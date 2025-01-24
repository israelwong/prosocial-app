'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { supabase } from '@/app/admin/_lib/supabase'
import { EventoEtapa, EventosPorEtapa } from '@/app/admin/_lib/types'
import { obtenerEventosPorEtapa } from '@/app/admin/_lib/evento.actions'
import { obtenerTipoEvento } from '@/app/admin/_lib/eventoTipo.actions'
import { obtenerCliente } from '@/app/admin/_lib/cliente.actions'
import { obtenerEventoEtapas, obtenerEtapasFiltradas } from '@/app/admin/_lib/EventoEtapa.actions'
import FichaEvento from './FichaEvento'

export default function ListaEventos() {

    const router = useRouter()
    const [loading, setLoading] = useState<boolean>(false)
    const [etapas, setEtapas] = useState<EventoEtapa[]>([])
    const [eventos, setEventos] = useState<EventosPorEtapa[]>([])

    const fetchData = useCallback(async () => {

        setLoading(true)

        const filtroEtapas = [1, 2]
        obtenerEtapasFiltradas(filtroEtapas).then(etapas => {
            setEtapas(etapas)
        })

        obtenerEventosPorEtapa(filtroEtapas).then(eventos => {
            setEventos(eventos)
        })

        const etapasPromise = await obtenerEventoEtapas()
        const primeras2Etapas = etapasPromise.slice(0, 2);
        setEtapas(primeras2Etapas);
        setLoading(false)

    }, [])

    const suscripcionSupabase = () => {

        const subscriptionNuevo = supabase.channel('realtime:Evento:nuevo').on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'Evento' },

            async (payload) => {
                const newEvento = payload.new;
                const nombreCliente = await obtenerCliente(newEvento.clienteId)
                const nombreTipoEvento = await obtenerTipoEvento(newEvento.eventoTipoId)

                setEventos(prevEventos => [
                    ...prevEventos,
                    {
                        id: newEvento.id,
                        nombre: newEvento.nombre || '',
                        createdAt: newEvento.createdAt,
                        updatedAt: newEvento.updatedAt,
                        clienteId: newEvento.clienteId,
                        eventoTipoId: newEvento.eventoTipoId,
                        fecha_evento: newEvento.fecha_evento ? new Date(newEvento.fecha_evento) : new Date(),
                        sede: newEvento.sede || '',
                        direccion: newEvento.direccion || '',
                        status: newEvento.status,
                        userId: newEvento.userId,
                        eventoEtapaId: newEvento.eventoEtapaId,
                        total_pagado: 0,
                        Cliente: {
                            nombre: nombreCliente?.nombre || ''
                        },
                        EventoTipo: {
                            nombre: nombreTipoEvento?.nombre || ''
                        },
                        EventoEtapa: {
                            nombre: '',
                            posicion: 0
                        },
                        User: {
                            username: ''
                        },
                        Cotizacion: []
                    }
                ]);
            }
        ).subscribe(status => {
            console.log('Estado de la suscripción:', status)
        });

        return () => {
            supabase.removeChannel(subscriptionNuevo);
        };
    }

    useEffect(() => {
        fetchData();
        suscripcionSupabase();
    }, [fetchData])


    return (
        <div className='mx-auto max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl'>
            {loading ? (
                <div className='flex items-center justify-center h-screen'>
                    <p className='text-zinc-300 text-center'>
                        Cargando promesas...
                    </p>
                </div>
            ) : (
                <div className='overflow-x-auto'>
                    <div className='flex justify-between items-center mb-5'>

                        <h1 className='text-lg font-semibold mb-5 text-zinc-500'>
                            Promesas
                        </h1>
                        <button
                            className='bg-zinc-800 border border-zinc-700 px-3 py-2 rounded-md text-zinc-300 text-sm'
                            onClick={() => router.push('/admin/dashboard/eventos/nuevo')}
                        >
                            Crear nuevo evento
                        </button>
                    </div>


                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4'>
                        {etapas.map(etapa => (
                            <div key={etapa.id} className='border border-zinc-800 p-5 rounded-md'>
                                <h2 className='text-zinc-400 mb-5'>
                                    {etapa.nombre}
                                </h2>
                                {eventos
                                    .filter(evento => evento.eventoEtapaId === etapa.id)
                                    .map(evento => (
                                        <FichaEvento
                                            key={evento.id}
                                            evento={evento}
                                        />
                                    ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}