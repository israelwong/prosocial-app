'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { EventoEtapa } from '@/app/admin/_lib/types'
import { EventoConDetalles } from '@/app/admin/_lib/schemas/evento.schemas'
import { getEventosConDetallesPorEtapa } from '@/app/admin/_lib/actions/eventos/eventos.actions'
import { obtenerEtapasFiltradas } from '@/app/admin/_lib/EventoEtapa.actions'
import EventosTable from './EventosTable'
import { PlusCircle } from 'lucide-react'

export default function EventosList() {
    const router = useRouter()
    const [loading, setLoading] = useState<boolean>(true)
    const [etapas, setEtapas] = useState<EventoEtapa[]>([])
    const [eventos, setEventos] = useState<EventoConDetalles[]>([])

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            // 1. Obtener las etapas de prospección (ej. posiciones 1 y 2)
            const etapasProspeccion = await obtenerEtapasFiltradas([1, 2]);
            setEtapas(etapasProspeccion);

            // 2. Obtener los eventos que están en esas etapas
            const idsEtapas = etapasProspeccion.map(e => e.id);
            if (idsEtapas.length > 0) {
                const eventosProspeccion = await getEventosConDetallesPorEtapa(idsEtapas);
                setEventos(eventosProspeccion);
            }
        } catch (error) {
            console.error("Error al cargar datos de eventos:", error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    if (loading) {
        return (
            <div className='flex items-center justify-center h-screen'>
                <p className='text-zinc-500 text-center italic'>
                    Cargando eventos...
                </p>
            </div>
        )
    }

    return (
        <div className='container mx-auto p-4'>
            <div className='flex justify-between items-center mb-6'>
                <h1 className='text-2xl font-bold text-zinc-100'>
                    Cotizaciones y Prospección
                </h1>
                <button
                    className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2'
                    onClick={() => router.push('/admin/dashboard/eventos/nuevo')}
                >
                    <PlusCircle size={20} />
                    Nueva Cotización
                </button>
            </div>

            {etapas.length > 0 ? (
                etapas.map(etapa => (
                    <div key={etapa.id} className='mb-8'>
                        <h2 className='text-xl font-semibold text-zinc-300 mb-4'>
                            {etapa.nombre}
                        </h2>
                        <EventosTable
                            eventos={eventos.filter(evento => evento.eventoEtapaId === etapa.id)}
                        />
                    </div>
                ))
            ) : (
                <p className="text-center text-zinc-400 mt-8">No se encontraron etapas de prospección configuradas.</p>
            )}
        </div>
    )
}
