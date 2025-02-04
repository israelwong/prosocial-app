'use client'
import React, { useState, useEffect, useCallback } from 'react'

import { Evento, Cliente, Cotizacion, CondicionesComerciales } from '@/app/admin/_lib/types'
import { obtenerEventoCotizaciones } from '@/app/admin/_lib/evento.actions'
import { obtenerCondicionesComercialesActivas } from '@/app/admin/_lib/condicionesComerciales.actions'
import Skeleton from './skeleton'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { supabase } from '@/app/admin/_lib/supabase';

interface Props {
    eventoId: string
}

export default function EventoActivo({ eventoId }: Props) {

    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [evento, setEvento] = useState<Evento | null>(null)
    const [cliente, setCliente] = useState<Cliente | null>(null)
    const [eventoTipo, setEventoTipo] = useState<string | null>(null)
    const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
    const [condicionesComerciales, setCondicionesComerciales] = useState<CondicionesComerciales[] | null>(null)
    const [preview, setPreview] = useState(false)

    const suscripcionCotizacion = useCallback(async () => {
        const subscriptionNotificaciones = supabase
            .channel('realtime:notificaciones')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'Cotizacion' },
                async (payload) => {
                    // console.log('Evento en cotizacion:', payload);
                    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                        const data = await obtenerEventoCotizaciones(eventoId)
                        setCotizaciones(data.cotizaciones ?? [])
                    }
                }
            ).subscribe((status, err) => {
                if (err) {
                    console.error('Error en la cotizacion:', err);
                } else {
                    console.log('Estado de la suscripción en cotizacion:', status);
                }
            }
            );
        return () => {
            supabase.removeChannel(subscriptionNotificaciones);
        }
    }, [eventoId]);

    const fetchData = useCallback(async () => {
        const data = await obtenerEventoCotizaciones(eventoId)
        const condicionesComercialesData = await obtenerCondicionesComercialesActivas()

        setCotizaciones(data.cotizaciones ?? [])
        setEvento(data.evento ?? null)
        setCliente(data.cliente ?? null)
        setEventoTipo(data.tipoEvento ?? null)
        setCondicionesComerciales(condicionesComercialesData)

        const urlParams = new URLSearchParams(window.location.search);
        const isPrev = urlParams.get('preview');
        if (isPrev) {
            setPreview(true);
        }
        setLoading(false)
    }, [eventoId]);

    useEffect(() => {
        suscripcionCotizacion();
        fetchData();
    }, [suscripcionCotizacion, fetchData]);

    const handleOpenCotizacion = (cotizacionId: string) => {
        if (preview) {
            router.push(`/cotizacion/${cotizacionId}?param=lista&preview=true`)
            return
        } else {
            router.push(`/cotizacion/${cotizacionId}?param=lista`)
        }
    }

    if (loading) {
        return <Skeleton footer='Cargando las cotizaciones disponibles...' />
    }

    return (
        <div>


            <div className='container mx-auto max-w-screen-sm pt-5 pb-5'>

                <div className='mb-0 md:mb-5 md:p-0 p-5'>
                    <h1 className='font-Bebas-Neue text-4xl mb-2'>
                        <span className='text-zinc-500'>Hola </span> {cliente?.nombre.split(' ')[0]}!
                    </h1>
                    <p className='text-lg text-zinc-400'>
                        Te compartimos las cotizaciones que hemos preparado para el <span className='font-bold text-white'>{evento?.nombre}</span> que celebrarás el <span className='underline'>{evento?.fecha_evento ? new Date(evento.fecha_evento.getTime() + 86400000).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
                    </p>
                </div>

                <div className='w-full md:p-0 px-5 mb-5'>
                    {cotizaciones
                        .filter(cotizacion => cotizacion.visible_cliente)
                        .map(cotizacion => (
                            <div className='bg-zinc-900 border border-zinc-800 rounded my-3 w-full text-left mb-3 justify-between items-center p-5' key={cotizacion.id}>

                                <div className='mb-2'>
                                    <h4 className='text-lg md:text-xl md:pr-14'>
                                        {cotizacion.nombre}
                                    </h4>
                                    <p>
                                        <span className='text-md text-zinc-500'> Presupuesto <strong>{cotizacion.precio.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</strong></span>

                                    </p>
                                </div>

                                <button key={cotizacion.id} className='px-3 py-2 bg-purple-900 text-white rounded-md text-sm'
                                    onClick={() => cotizacion.id && handleOpenCotizacion(cotizacion.id)}>
                                    Ver cotización
                                </button>
                            </div>
                        ))}
                </div>

                <div className='md:p-0 p-5'>
                    <div className='w-full px-5 border border-yellow-500  p-5'>
                        <h3 className='font-Bebas-Neue text-2xl text-yellow-600 mb-2 font-semibold'>Condiciones comerciales</h3>
                        <ul className='text-sm text-zinc-400'>
                            {condicionesComerciales && condicionesComerciales
                                .filter(condicion =>
                                    (eventoTipo === 'Empresarial' && condicion.tipoEvento === 'Empresarial') ||
                                    (eventoTipo !== 'Empresarial' && condicion.tipoEvento === 'Social')
                                )
                                .map((condicion, index) => (
                                    <li key={index} className='mb-2'>
                                        <div className='flex items-start'>
                                            <ArrowRight size={12} className='mr-2 mt-1' />
                                            <p>
                                                <span className='font-semibold'>{condicion.nombre}:</span> {condicion.descripcion}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>

            </div>


        </div>
    )
}