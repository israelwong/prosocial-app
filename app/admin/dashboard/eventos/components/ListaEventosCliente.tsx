'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { obtenerEventosPorCliente } from '@/app/admin/_lib/evento.actions'
import { Evento } from '@/app/admin/_lib/types'
import { obtenerTipoEvento } from '@/app/admin/_lib/eventoTipo.actions'
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

    //! HANDLE CREAR EVENTO
    return (
        <div className=''>
            {loading ? (
                <p className='text-zinc-700 text-center py-10 italic'>
                    Cargando eventos asociados...
                </p>
            ) : (
                <div className=''>
                    <div>
                        <div className='flex justify-between items-center mb-3'>
                            <h2 className=' text-xl text-zinc-500'>Eventos asociados</h2>
                            <button
                                className='bg-zinc-800 px-3 py-2 rounded-md border border-zinc-700 text-sm'
                                onClick={() => router.push(`/admin/dashboard/eventos/nuevo?clienteId=${clienteId}`)}
                            >
                                Asociar nuevo evento
                            </button>
                        </div>

                        {eventos.length === 0 ? (
                            <p className='text-zinc-700 italic'>
                                - No hay eventos asociados a este cliente
                            </p>
                        ) : (
                            eventos.map(evento => (
                                <div key={evento.id} className='relative p-4 border border-zinc-700 rounded-md mb-5'>
                                    <h3 className='text-lg text-zinc-300 mt-2 items-center'>
                                        <button
                                            className='flex items-center mr-4'
                                            onClick={() => router.push(`/admin/dashboard/eventos/${evento.id}`)}
                                        >
                                            <Edit size={15} className='mr-2' />
                                            {evento.nombre || 'Sin personalizar'}
                                            <span className='px-2 py-1 leading-3 text-[12px] bg-gray-700 rounded-md ml-2 uppercase'>
                                                {evento.tipoEvento}
                                            </span>
                                        </button>
                                    </h3>

                                    <p className='text-zinc-500 flex items-center text-sm'>
                                        <Calendar size={15} className='mr-2' />
                                        Evento {new Date(evento.fecha_evento).toLocaleDateString('es-MX', {
                                            timeZone: 'UTC',
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ListaEventosCliente