'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { obtenerEventosPorCliente } from '@/app/admin/_lib/actions/evento/evento.actions'
import { Evento } from '@/app/admin/_lib/types'
import { obtenerTipoEvento } from '@/app/admin/_lib/actions/eventoTipo/eventoTipo.actions'
import { useRouter } from 'next/navigation'
import { Calendar, Edit } from 'lucide-react'

interface Props {
    clienteId: string
}

function ListaEventosCliente({ clienteId }: Props) {

    const [eventos, setEventos] = useState<Evento[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const router = useRouter()

    const fetchData = useCallback(async () => {
        setLoading(true)

        const eventos = await obtenerEventosPorCliente(clienteId)

        const eventosConTipo = await Promise.all(
            eventos.map(async (evento) => {
                const tipoEvento = evento.eventoTipoId ? await obtenerTipoEvento(evento.eventoTipoId) : null
                return { ...evento, tipoEvento: tipoEvento?.nombre || '' }
            })
        )
        setEventos(eventosConTipo)
        setLoading(false)
    }, [clienteId])

    useEffect(() => {
        fetchData()
    }, [clienteId, fetchData])

    return (
        <div className=''>
            {loading ? (
                <p className='text-zinc-500 text-center py-10 italic'>
                    Cargando eventos asociados...
                </p>
            ) : (
                <div className=''>
                    <div>
                        <div className='flex justify-end items-center mb-4'>
                            <button
                                className='bg-blue-700 hover:bg-blue-600 px-3 py-2 rounded-md text-white text-sm transition-colors'
                                onClick={() => router.push(`/admin/dashboard/eventos/nuevo?clienteId=${clienteId}`)}
                            >
                                + Asociar nuevo evento
                            </button>
                        </div>

                        {eventos.length === 0 ? (
                            <div className='text-center py-8'>
                                <p className='text-zinc-500 italic mb-4'>
                                    No hay eventos asociados a este cliente
                                </p>
                                <button
                                    className='bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-md text-white text-sm transition-colors'
                                    onClick={() => router.push(`/admin/dashboard/eventos/nuevo?clienteId=${clienteId}`)}
                                >
                                    Crear primer evento
                                </button>
                            </div>
                        ) : (
                            <div className='space-y-3'>
                                {eventos.map(evento => (
                                    <div
                                        key={evento.id}
                                        className='relative p-4 border border-zinc-700 rounded-lg hover:border-zinc-600 transition-colors cursor-pointer bg-zinc-800 hover:bg-zinc-750'
                                        onClick={() => router.push(`/admin/dashboard/eventos/${evento.id}`)}
                                    >
                                        <div className='flex items-start justify-between mb-3'>
                                            <h3 className='text-zinc-300 font-medium'>
                                                {evento.nombre || 'Sin personalizar'}
                                            </h3>
                                            <span className='px-2 py-1 text-xs bg-blue-700 text-white rounded-md'>
                                                {evento.tipoEvento}
                                            </span>
                                        </div>

                                        <p className='text-zinc-400 flex items-center text-sm'>
                                            <Calendar size={14} className='mr-2' />
                                            {new Date(evento.fecha_evento).toLocaleDateString('es-MX', {
                                                timeZone: 'UTC',
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>

                                        <div className='flex items-center justify-end mt-3'>
                                            <span className='text-xs text-zinc-500 flex items-center'>
                                                <Edit size={12} className='mr-1' />
                                                Ver detalles
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ListaEventosCliente
