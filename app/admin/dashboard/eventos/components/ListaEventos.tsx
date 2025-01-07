'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/app/admin/_lib/types'
import Cookies from 'js-cookie'
import { obtenerEventosDetalle, asignarEventoUser } from '@/app/admin/_lib/evento.actions'

// import { supabase } from '@/app/admin/_lib/supabase'
import FichaEvento from './FichaEvento'
// import { obtenerTipoEvento } from '@/app/admin/_lib/eventoTipo.actions'
// import { obtenerCliente } from '@/app/admin/_lib/cliente.actions'

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

    const fetchData = async () => {
        setLoading(true)
        const eventosDetallePromise = await obtenerEventosDetalle()
        setEventoDetalle(eventosDetallePromise.map(evento => ({
            ...evento,
            creacion: evento.creacion ? new Date(evento.creacion).toISOString() : '',
            fecha_evento: evento.fecha_evento ? new Date(evento.fecha_evento).toISOString() : '',
            fecha_actualizacion: evento.fecha_actualizacion ? new Date(evento.fecha_actualizacion).toISOString() : '',
            tipoEvento: evento.tipoEvento || '', // Asegúrate de mapear correctamente el campo
            evento: evento.evento || '',
            cliente: evento.cliente || '',
            user: evento.user || ''
        })))
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
        // Obtener usuario de la cookie
        const userString = Cookies.get('user') || ''
        const userObject = userString ? JSON.parse(userString) : {} as User
        setUser(userObject)

        // const subscriptionNuevo = supabase
        //     .channel('realtime:Evento:nuevo')
        //     .on(
        //         'postgres_changes',
        //         { event: 'INSERT', schema: 'public', table: 'Evento' },
        //         async (payload) => {
        //             console.log('Se realizo una insersión":', payload);
        //             const newEvento = payload.new;

        //             //newEvento: objeto que viene desde la base de datos de supabase y no trae el nombre del cliente ni el tipo de evento
        //             const nombreCliente = await obtenerCliente(newEvento.clienteId)
        //             const nombreTipoEvento = await obtenerTipoEvento(newEvento.eventoTipoId)

        //             setEventoDetalle(prevEventos => [
        //                 ...prevEventos,
        //                 {
        //                     id: newEvento.id,
        //                     cliente: nombreCliente?.nombre || '',
        //                     status: newEvento.status,
        //                     creacion: newEvento.creacion ? new Date(newEvento.creacion).toISOString() : '',
        //                     fecha_evento: newEvento.fecha_evento ? new Date(newEvento.fecha_evento).toISOString() : '',
        //                     fecha_actualizacion: newEvento.fecha_actualizacion ? new Date(newEvento.fecha_actualizacion).toISOString() : '',
        //                     tipoEvento: nombreTipoEvento?.nombre || '', // Asegúrate de mapear correctamente el campo
        //                     evento: newEvento.evento || '',
        //                     user: newEvento.user || ''
        //                 }
        //             ]);
        //         }
        //     )
        //     .subscribe();

        // // Obtener eventos
        // fetchData();

        // // Obtener usuario de la cookie
        // const userString = Cookies.get('user') || ''
        // const userObject = userString ? JSON.parse(userString) : {} as User
        // setUser(userObject)

        // return () => {
        //     supabase.removeChannel(subscriptionNuevo);
        // };

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
                            Eventos registrados
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
                                    <FichaEvento key={evento.id} evento={evento} handleOpen={handleOpen} />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}