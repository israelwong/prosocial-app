'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { Agenda } from '@/app/admin/_lib/types'
import { obtenerAgendaDeEvento, eliminarAgendaEvento, actualzarStatusAgendaActividad } from '@/app/admin/_lib/agenda.actions'
import { Edit, Trash, Calendar, Clock, MessageCircle, MapPin, Link } from 'lucide-react'
import { AgendaTipo } from '@/app/admin/_lib/types'

import { obtenerAgendaTipos } from '@/app/admin/_lib/agendaTipos.actions'
import ModalFormAgendaNuevo from '../../agenda/components/ModalFormAgendaNuevo'
import ModalFormAgendaEditar from '../../agenda/components/ModalFormAgendaEditar'

import Cookies from 'js-cookie'

interface Props {
    eventoId: string
}


export default function FichaAgenda({ eventoId }: Props) {

    const [agenda, setAgenda] = React.useState<Agenda[]>([])
    const [loading, setLoading] = React.useState(true)
    const [isModalAgendaNuevoOpen, setIsModalAgendaNuevoOpen] = useState(false)
    const [isModalAgendaEditarOpen, setIsModalAgendaEditarOpen] = useState(false)
    const [agendaTipos, setAgendaTipos] = useState<AgendaTipo[]>()
    const [userId, setUserId] = useState<string | null>(null)
    const [agendaId, setAgendaId] = useState<string | null>(null)

    useEffect(() => {
        //obtner id del usuario de la sesión actual
        const user = Cookies.get('user')
        const userId = user ? JSON.parse(user).id : null
        setUserId(userId)
    }, [])

    const fetchAgendaTipos = useMemo(() => {
        return async () => {
            obtenerAgendaTipos().then((data) => {
                if (data) {
                    setAgendaTipos(data)
                }
            })
        }
    }, [])

    const fetchAgenda = useMemo(() => {
        return async () => {
            obtenerAgendaDeEvento(eventoId).then((data) => {
                if (data) {
                    setAgenda(data)
                }
                setLoading(false)
            })
        }
    }, [eventoId])

    useEffect(() => {
        fetchAgenda()
        fetchAgendaTipos()
    }, [])

    const handleDeleteAgenda = async (agendaId: string) => {
        if (confirm('¿Estás seguro de eliminar este evento de la agenda?')) {
            await eliminarAgendaEvento(agendaId)
            fetchAgenda()
        }
    }

    const handleStatusAgendaActividad = async (agendaId: string, status: string) => {
        await actualzarStatusAgendaActividad(agendaId, status)
        fetchAgenda()
    }

    const handleSubmitAgenda = () => {
        setIsModalAgendaNuevoOpen(false)
        setIsModalAgendaEditarOpen(false)
        fetchAgenda()
    }

    return (
        <div className='mb-5 p-3 bg-zinc-900 rounded-md border border-zinc-800'>
            <div className='flex justify-between mb-5 items-center'>
                <h1 className='text-xl text-zinc-500 font-semibold'>
                    Servicios agendados
                </h1>
                <button
                    className='p-2 bg-zinc-900 text-white rounded-md text-sm border border-zinc-700 py-2 px-3'
                    onClick={() => setIsModalAgendaNuevoOpen(true)}
                    disabled={!agendaTipos || !eventoId || !userId}
                >
                    {!agendaTipos || !eventoId || !userId ? '...' : 'Agendar'}
                </button>
            </div>

            <div>

                {loading && (
                    <p className='text-centleft text-zinc-500'>
                        Cargando...
                    </p>
                )}

                {!loading && agenda.length === 0 && (
                    <p className='text-left text-zinc-500'>
                        No hay servicios agendados
                    </p>
                )}

                {!loading && agenda.length > 0 && (
                    <div className='grid grid-cols-1 gap-3'>
                        {agenda.map((agenda, index) => (
                            <div key={index} className='bg-zinc-800 p-3 rounded-md border border-zinc-700'>
                                <div className=''>
                                    <div>

                                        {/* header   */}
                                        <div className='flex items-center mb-2 justify-between w-full'>
                                            <div
                                                className={`text-zinc-400 mr-2 text-xs border px-2 py-1 rounded-md inline-block mb-2 ${agenda.agendaTipo === 'Evento' ? 'border-pink-500 text-pink-300' : agenda.agendaTipo === 'Cita virtual' ? 'border-yellow-500 text-yellow-300' : 'border-purple-500 text-purple-300'}`}>
                                                {agenda.agendaTipo}
                                            </div>

                                            <div className='flex items-center'>

                                                <button
                                                    onClick={() => agenda.id && handleStatusAgendaActividad(agenda.id, agenda.status === 'pendiente' ? 'completado' : 'pendiente')}
                                                    className={`border rounded-md py-1 px-2 text-xs ${agenda.status === 'pendiente' ? 'border-yellow-600 text-yellow-500' : 'border-green-600 text-green-500'}`}>
                                                    {agenda.status === 'pendiente' ? 'Pendiente' : 'Completado'}
                                                </button>

                                                <button
                                                    className='p-2 text-red-500 py-2 px-3'
                                                    onClick={() => agenda.id && handleDeleteAgenda(agenda.id)}
                                                >
                                                    <Trash size={16} />
                                                </button>
                                                {agenda.id && (
                                                    <button
                                                        className='text-lg text-zinc-200 flex items-center'
                                                        onClick={() => {
                                                            setIsModalAgendaEditarOpen(true)
                                                            setAgendaId(agenda.id ?? '')
                                                        }}
                                                    >
                                                        <Edit size={16} className='mr-2' />
                                                    </button>
                                                )}

                                            </div>
                                        </div>

                                        <ul>
                                            {agenda.concepto && (
                                                <li>
                                                    {agenda.concepto}
                                                </li>
                                            )}

                                            {agenda.fecha && (
                                                <li className='text-yellow-400 pb-2 flex items-start'>
                                                    <span>
                                                        <Calendar size={16} className='mr-2 mt-1' />
                                                    </span>
                                                    {new Date(new Date(agenda.fecha).getTime() + new Date().getTimezoneOffset() * 60000).toLocaleString('es-ES', { dateStyle: 'full' })}
                                                </li>
                                            )}
                                            {agenda.hora && (
                                                <li className='text-red-400 pb-2 flex items-start'>
                                                    <span>
                                                        <Clock size={16} className='mr-2 mt-1' />
                                                    </span>
                                                    {agenda.hora}
                                                </li>
                                            )}
                                            {agenda.descripcion && (
                                                <li className='text-zinc-400 pb-2 flex items-start'>
                                                    <span>
                                                        <MessageCircle size={16} className='mr-2 mt-2' />
                                                    </span>
                                                    <p>
                                                        {agenda.descripcion}
                                                    </p>
                                                </li>
                                            )}
                                            {agenda.direccion && (
                                                <li className='text-zinc-400 pb-2 flex items-start'>
                                                    <span>
                                                        <MapPin size={16} className='mr-2 mt-1' />
                                                    </span>
                                                    {agenda.direccion}
                                                </li>
                                            )}
                                            {agenda.googleMapsUrl && (
                                                <li className='text-blue-400 pb-2 flex items-start'>
                                                    <span>
                                                        <Link size={16} className='mr-2 mt-1' />
                                                    </span>
                                                    <a href={agenda.googleMapsUrl} target='_blank' rel='noreferrer'>
                                                        Abrir Google Maps
                                                    </a>
                                                </li>
                                            )}
                                        </ul>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isModalAgendaNuevoOpen && agendaTipos && (
                    <ModalFormAgendaNuevo
                        onClose={() => setIsModalAgendaNuevoOpen(false)}
                        onSubmit={handleSubmitAgenda}
                        agendaTipos={agendaTipos}
                        eventoId={eventoId}
                        userId={userId || ''}
                    />
                )}

                {isModalAgendaEditarOpen && agendaTipos && (
                    <ModalFormAgendaEditar
                        onClose={() => setIsModalAgendaEditarOpen(false)}
                        onSubmit={handleSubmitAgenda}
                        agendaTipos={agendaTipos}
                        agendaId={agendaId || ''}
                    />
                )}

            </div>
        </div>
    )
}
