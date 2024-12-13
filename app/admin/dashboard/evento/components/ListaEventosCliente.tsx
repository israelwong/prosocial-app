'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { obtenerEventosPorCliente } from '@/app/admin/_lib/evento.actions'
import { Evento } from '@/app/admin/_lib/types'
import { obtenerTipoEvento } from '@/app/admin/_lib/eventoTipo.actions'
import { obtenerCliente } from '@/app/admin/_lib/cliente.actions'
import { Cliente } from '@/app/admin/_lib/types'

import ListaCotizaciones from '../../cotizaciones/components/ListaCotizaciones'

import { useSearchParams } from 'next/navigation'
import FormEventoEditar from './FormEventoEditar'
import FormEventoNuevo from './FormEventoNuevo'
import { Calendar, Pencil, Eye } from 'lucide-react'

interface Props {
    clienteId: string
}

function ListaEventosCliente({ clienteId }: Props) {
    const [eventos, setEventos] = useState<Evento[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const searchParams = useSearchParams()
    const eventoId = searchParams ? searchParams.get('eventoId') : null
    const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null)
    const [openModalEditarEvento, setOpenModalEditarEvento] = useState(false)
    const [openModalCrearEvento, setOpenModalCrearEvento] = useState(false)
    const [cliente, setCliente] = useState<Cliente | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)

        const eventos = await obtenerEventosPorCliente(clienteId)

        const eventosConTipo = await Promise.all(
            eventos.map(async (evento) => {
                const tipoEvento = evento.eventoTipoId ? await obtenerTipoEvento(evento.eventoTipoId) : null
                return { ...evento, tipoEvento: tipoEvento?.nombre }
            })
        )

        const cliente = await obtenerCliente(clienteId)
        if (cliente) {
            setCliente(cliente)
        }

        setEventos(eventosConTipo)
        setLoading(false)
    }, [clienteId])

    useEffect(() => {
        fetchData()
    }, [clienteId, fetchData])

    useEffect(() => {
        if (eventoId) {
            const evento = eventos.find(evento => evento.id === eventoId)
            if (evento) {
                setEventoSeleccionado(evento)
            }

        }
    }, [eventoId, eventos])

    //! HANDLE EDITAR EVENTO
    const handleEditarEvento = (evento: Evento) => {
        setOpenModalEditarEvento(true)
        setEventoSeleccionado(evento)
    }

    const hanldleDetalleEvento = (evento: Evento) => {
        setEventoSeleccionado(evento)
        if (searchParams) {
            if (searchParams) {
                const newSearchParams = searchParams ? new URLSearchParams(searchParams.toString()) : new URLSearchParams()
                newSearchParams.set('eventoId', evento.id || '')
                window.history.replaceState(null, '', `?${newSearchParams.toString()}`)
            }
        }
    }

    const handleCloseEditarEvento = () => {
        setOpenModalEditarEvento(false)
        setEventoSeleccionado(null)
    }

    const handleSuccessEditarEvento = () => {
        fetchData()
        setOpenModalEditarEvento(false)
        setEventoSeleccionado(null)
    }

    //! HANDLE COTIZACIONES
    const handleCloseCotizaciones = () => {
        setEventoSeleccionado(null)
        if (searchParams) {
            const newSearchParams = new URLSearchParams(searchParams.toString())
            newSearchParams.delete('eventoId')
            window.history.replaceState(null, '', `?${newSearchParams.toString()}`)
        }
    }

    const handleSuccessCrearEvento = () => {
        fetchData()
        setOpenModalCrearEvento(false)
    }

    const handleCloseCrearEvento = () => {
        setOpenModalCrearEvento(false)
    }


    //! HANDLE CREAR EVENTO
    return (
        <div className='p-5 border border-zinc-800 rounded-md'>
            {loading ? (
                <p className='text-zinc-300'>Cargando eventos...</p>
            ) : (
                <div className='grid grid-cols-3 gap-4'>
                    <div>
                        <div className='flex justify-between items-center mb-5'>
                            <h2 className=' text-xl text-zinc-300'>Eventos</h2>
                            <button
                                className='bg-zinc-900 px-3 py-2 rounded-md border border-zinc-600 text-sm'
                                onClick={() => setOpenModalCrearEvento(true)}
                            >
                                Crear evento
                            </button>
                        </div>

                        {eventos.map(evento => (
                            <div key={evento.id} className='relative p-4 border border-zinc-700 rounded-md mb-5'
                            >
                                {evento.status === 'active' && (
                                    <span className='absolute top-2 right-2 inline-block w-2 h-2 bg-green-500 rounded-full'></span>
                                )}

                                <h3 className='text-lg text-zinc-300 mt-2 items-center'>
                                    {evento.nombre}
                                    <span className='px-2 py-1 leading-3 text-[12px] bg-gray-700 rounded-md ml-2 uppercase' >
                                        {evento.tipoEvento}
                                    </span>
                                </h3>

                                <div className='flex items-center my-2'>
                                    <button
                                        className='flex items-center mr-4'
                                        onClick={() => handleEditarEvento(evento)}>
                                        <Pencil size={15} className='mr-2' />Editar
                                    </button>
                                    <button
                                        className='flex items-center'
                                        onClick={() => hanldleDetalleEvento(evento)}>
                                        <Eye size={15} className='mr-2' />Cotizaciones
                                    </button>
                                </div>

                                <p className='text-zinc-500 flex items-center text-sm'><Calendar size={15} className='mr-2' />
                                    {new Date(evento.fecha_evento).toLocaleDateString('es-MX', {
                                        timeZone: 'UTC',
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className='col-span-2'>
                        {eventoSeleccionado && cliente && (
                            <ListaCotizaciones
                                evento={eventoSeleccionado}
                                cliente={cliente}
                                onClose={() => handleCloseCotizaciones()}
                            />
                        )}
                    </div>

                    {/* MODALES */}
                    {openModalEditarEvento && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <div className="p-5 rounded-md shadow-lg w-1/2">
                                {eventoSeleccionado && (
                                    <FormEventoEditar
                                        evento={eventoSeleccionado}
                                        onSuccess={() => handleSuccessEditarEvento()}
                                        onClose={() => handleCloseEditarEvento()}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {openModalCrearEvento && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <div className="p-5 rounded-md shadow-lg w-1/2">
                                {eventoSeleccionado && (
                                    <FormEventoNuevo
                                        clienteId={clienteId}
                                        onSuccess={() => handleSuccessCrearEvento()}
                                        onClose={() => handleCloseCrearEvento()}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default ListaEventosCliente