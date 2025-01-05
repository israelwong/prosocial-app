'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/app/admin/_lib/types'
import Cookies from 'js-cookie'
import { obtenerEventosDetalle, asignarEventoUser } from '@/app/admin/_lib/evento.actions'
import { Calendar, CircleUserRound } from 'lucide-react'

export default function ListaEventos() {

    interface EventoDetalle {
        id: string;
        evento: string;
        cliente: string;
        creacion: string;
        status: string;
        tipoEvento: string;
        fecha_evento: string;
        user: string;
        fecha_actualizacion: string;
    }

    const [eventosDetalle, setEventoDetalle] = useState<EventoDetalle[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [filtro, setFiltro] = useState<string>('')
    const [user, setUser] = useState<User>({} as User)

    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const eventosDetallePromise = await obtenerEventosDetalle()
            setEventoDetalle(eventosDetallePromise.map(evento => ({
                ...evento,
                creacion: evento.creacion.toISOString(),
                fecha_evento: evento.fecha_evento.toISOString(),
                fecha_actualizacion: evento.fecha_actualizacion.toISOString(),
                tipoEvento: evento.tipoEvento || '',
                evento: evento.evento || '',
                user: evento.user || ''
            })))
            setLoading(false)
        }
        fetchData()

        const userString = Cookies.get('user') || ''
        const userObject = userString ? JSON.parse(userString) : {} as User
        setUser(userObject)

    }, [])

    const eventosFiltrados = eventosDetalle.filter(evento => {
        const cumpleFiltro =
            (filtro === '' || evento.evento.toLowerCase().includes(filtro.toLowerCase())) ||
            (filtro === '' || evento.cliente.toLowerCase().includes(filtro.toLowerCase())) ||
            (filtro === '' || new Date(evento.creacion).toLocaleDateString('es-MX', {
                timeZone: 'UTC',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).includes(filtro))

        return cumpleFiltro
    })

    const eventosPorEstado = {
        nuevos: eventosFiltrados.filter(evento => evento.status === 'nuevo'),
        seguimientos: eventosFiltrados.filter(evento => evento.status === 'seguimiento'),
        // archivados: eventosFiltrados.filter(evento => evento.status === 'archivado')
    }

    const handleOpen = (id: string, status: string) => {

        if (status === 'nuevo') {
            asignarEventoUser(id, user.id?.toString() || '', 'seguimiento').then(() => {
                router.push(`/admin/dashboard/eventos/${id}`)
            })
        }

        //si status es nuevo, actualizar a seguimiento y asignar a usuario quien lo abrio
        router.push(`/admin/dashboard/eventos/${id}`)
    }

    return (
        <div className='mx-auto max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl'>
            {loading ? (
                <div className='flex items-center justify-center h-screen'>
                    <p className='text-zinc-300 text-center'>
                        Cargando eventos...
                    </p>
                </div>
            ) : (
                <div className='overflow-x-auto'>
                    <div className='flex justify-between items-center mb-5'>
                        <h1 className='text-2xl text-zinc-400'>
                            Eventos registrados ({eventosDetalle.length})
                        </h1>
                        <button
                            className='bg-zinc-800 border border-zinc-700 px-3 py-2 rounded-md text-zinc-300 text-sm'
                            onClick={() => router.push('/admin/dashboard/eventos/nuevo')}
                        >
                            Crear nuevo evento
                        </button>
                    </div>

                    <div className='mb-2'>
                        <input
                            type='text'
                            placeholder='Filtrar por nombre del evento, cliente o fecha'
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                            className='bg-zinc-800 border border-zinc-700 px-3 py-2 rounded-md text-zinc-300 mb-2 w-full'
                        />
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4'>
                        {Object.entries(eventosPorEstado).map(([estado, eventos]) => (
                            <div key={estado}>

                                <h2 className='text-xl text-zinc-400 capitalize mb-4'>{estado}</h2>

                                {eventos.map(evento => (
                                    <div key={evento.id} className='relative px-4 py-2 border border-zinc-700 rounded-md mb-5'>

                                        <h3 className='text-lg text-zinc-300 items-center'>
                                            <button onClick={() => handleOpen(
                                                evento.id,
                                                evento.status
                                            )}>
                                                {evento.evento || 'Por configurar'}

                                                <span className='ml-2 px-2 py-1 leading-3 text-[12px] bg-zinc-800 text-yellow-500 rounded-full'>
                                                    {evento.tipoEvento}
                                                </span>
                                            </button>
                                        </h3>

                                        <p className='flex items-center mb-2 text-zinc-300'>

                                            <Calendar size={15} className='mr-2' /> Fecha de evento {new Date(evento.fecha_evento).toLocaleDateString('es-MX', {
                                                timeZone: 'UTC',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>

                                        <div className='space-x-1 mb-2 flex items-center'>
                                            Lead <span className='ml-2 px-2 py-1 leading-3 text-[12px] bg-zinc-700 rounded-md uppercase flex items-center'>
                                                <CircleUserRound size={15} className='mr-1' /> {evento.cliente}
                                            </span>

                                            {evento.user && (
                                                <span className='px-2 py-1 leading-3 text-sm rounded-md flex text-purple-500'>
                                                    @{evento.user}
                                                </span>
                                            )}
                                        </div>

                                        <p className='text-zinc-500 flex items-center text-sm'>
                                            Registrado {new Date(evento.fecha_actualizacion).toLocaleDateString('es-MX', {
                                                timeZone: 'UTC',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}