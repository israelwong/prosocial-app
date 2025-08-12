'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CircleDollarSign, Calendar, CircleUser } from 'lucide-react'
import { obtenerEventosPorEtapa } from '@/app/admin/_lib/evento.actions'
import { EventoEtapa, EventoConTotalPagado } from '@/app/admin/_lib/types'
import { obtenerEtapasFiltradas } from '@/app/admin/_lib/EventoEtapa.actions'
// import { supabase } from '@/app/admin/_lib/supabase'


export default function ListaEventosAprobados() {

    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [eventosAprobados, setEventosAprobados] = useState<EventoConTotalPagado[]>([])
    const [etapas, setEtapas] = useState<EventoEtapa[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const filroEtapa = [3, 4, 5, 6, 7, 8]
                const etapas = await obtenerEtapasFiltradas(filroEtapa)
                setEtapas(etapas)

                const eventos = await obtenerEventosPorEtapa(filroEtapa)
                setEventosAprobados(eventos)
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])


    if (loading) return (
        <div className='flex items-center justify-center h-screen'>
            <p className='text-zinc-500 text-center'>Cargando eventos aprobados...</p>
        </div>
    )

    return (
        <div className=''>
            <div className="gap-4 mx-auto ">

                <div className='flex justify-between items-center mb-5'>

                    <h1 className='text-xl font-semibold mb-5 text-zinc-500'>
                        Gestión de eventos aprobados
                    </h1>

                    <button className='bg-zinc-800 text-zinc-300 px-4 py-2 rounded-md mb-5 border border-zinc-700 text-sm'
                    >
                        Eventos entregaados
                    </button>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3 overflow-x-auto">
                    {etapas.map((etapa) => (
                        <div key={etapa.id} className='border border-zinc-800 p-4 rounded-md shadow-md'>
                            <h2 className='text-sm font-semibold mb-4 text-zinc-400'>
                                {etapa.nombre}
                            </h2>
                            {eventosAprobados
                                .filter(evento => evento.EventoEtapa?.nombre === etapa.nombre).length === 0 ? (
                                loading ? (
                                    <p className='text-zinc-500 p-3 border border-zinc-800 rounded-md italic'>
                                        Cargando eventos...
                                    </p>
                                ) : (
                                    <p className='text-zinc-700 italic text-sm'>
                                        - No hay eventos en esta etapa
                                    </p>
                                )
                            ) : (
                                eventosAprobados
                                    .filter(evento => evento.EventoEtapa?.nombre === etapa.nombre)
                                    .map(evento => (
                                        <div key={evento.id} className="p-3 flex justify-between cursor-pointer mb-5 bg-zinc-900 rounded-md hover:bg-zinc-800"
                                            onClick={() => { router.push(`/admin/dashboard/seguimiento/${evento.id}`) }}
                                        >
                                            <div>
                                                <div className='flex items-center mb-3'>
                                                    <span className='bg-zinc-800 text-yellow-500 px-2 py-1 rounded-full text-xs mr-1'>
                                                        {evento.EventoTipo?.nombre}
                                                    </span>
                                                    {evento.nombre}
                                                </div>

                                                <p className="text-yellow-600 flex items-center text-sm mb-2">
                                                    <Calendar className='mr-1' size={16} />
                                                    {new Date(new Date(evento.fecha_evento).getTime() + new Date().getTimezoneOffset() * 60000).toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                </p>

                                                <p className='flex items-center text-sm mb-2'>
                                                    <CircleUser size={16} className='mr-1' />
                                                    {evento.Cliente.nombre.split(' ')[0]} {evento.Cliente.nombre.split(' ')[1]}
                                                </p>

                                                <div className=''>
                                                    {evento.Cotizacion && evento.Cotizacion[0] && typeof evento.Cotizacion[0].precio === 'number' ? (
                                                        (evento.Cotizacion[0].precio - Number(evento.total_pagado)) === 0 ? (
                                                            <p className='flex items-center text-green-500'>
                                                                <CircleDollarSign size={16} className='mr-1' /> Pagado
                                                            </p>
                                                        ) : (
                                                            <>
                                                                <p className='flex items-center text-red-500'>
                                                                    <CircleDollarSign size={16} className='mr-1' /> {(evento.Cotizacion[0].precio - Number(evento.total_pagado)).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                                                </p>
                                                            </>
                                                        )
                                                    ) : (
                                                        <p className='flex items-center text-zinc-500 italic'>
                                                            Cotización no disponible
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
