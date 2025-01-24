'use client'
import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Shuffle, Home, Calendar, Users, Wallet, Inbox } from 'lucide-react'
import { supabase } from '../../_lib/supabase'
// import { obtenerEventoPorId } from '../../_lib/evento.actions'
import { obtenerDetallesPago } from '../../_lib/pago.actions'
import { obtenerEventoEtapas } from '../../_lib/EventoEtapa.actions'
import { EventoEtapa } from '../../_lib/types'

const links = [
    { href: '/admin/dashboard', label: 'Inicio', icon: <Home size={24} />, alt: 'Inicio' },
    { href: '/admin/dashboard/eventos', label: 'Eventos', icon: <Inbox size={24} />, count: 0, alt: 'Promesas' },
    { href: '/admin/dashboard/seguimiento', label: 'Gestión', icon: <Shuffle size={24} />, count: 0, alt: 'Eventos' },
    { href: '/admin/dashboard/agenda', label: 'Agenda', icon: <Calendar size={24} />, alt: 'Agenda' },
    { href: '/admin/dashboard/contactos', label: 'Contactos', icon: <Users size={24} />, alt: 'Contactos' },
    { href: '/admin/dashboard/finanzas', label: 'Finanzas', icon: <Wallet size={24} />, alt: 'Finanzas' },
]

function DashboardSideBar() {

    const [activeLink, setActiveLink] = useState('')
    const [seguimientoCount, setSeguimientoCount] = useState(0)
    const [aprobadosCount, setAprobadosCount] = useState(0)
    const [agendaCount, setAgendaCount] = useState(0)
    const [etapas, setEtapas] = useState<EventoEtapa[]>([])

    //! NOTIFICACIÓN SONIDO
    const playNotificationSound = () => {
        try {
            const audio = new Audio('/notificacion.m4a'); // Ruta del sonido en la carpeta public
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Failed to play audio:', error);
                });
            }
        } catch (error) {
            console.error('Error playing notification sound:', error);
        }
    };

    //! CONTEO DE EVENTOS
    const fetchCounts = useCallback(async () => {

        const filtroEtapasPosicionSeguimiento = etapas.filter((etapa) => etapa.posicion === 1 || etapa.posicion === 2).map((etapa) => etapa.id);
        const { count: seguimientoCount, error: seguimientoError } = await supabase
            .from('Evento')
            .select('id', { count: 'exact' })
            .in('eventoEtapaId', filtroEtapasPosicionSeguimiento); // Filtra por múltiples valores

        const filtroEtapasPosicionAprobadas = etapas.filter((etapa) => etapa.posicion >= 3 && etapa.posicion < 9).map((etapa) => etapa.id);
        const { count: aprobadosCount, error: aprobadosError } = await supabase
            .from('Evento')
            .select('id', { count: 'exact' })
            .in('eventoEtapaId', filtroEtapasPosicionAprobadas);

        const { count: agendaCount, error: agendaError } = await supabase
            .from('Agenda')
            .select('id', { count: 'exact' })
            .eq('status', 'pendiente');

        if (seguimientoError) console.error('Error al obtener seguimiento leads:', seguimientoError);
        if (aprobadosError) console.error('Error al obtener aprobados leads:', aprobadosError);
        if (agendaError) console.error('Error al obtener aprobados leads:', agendaError);

        setSeguimientoCount(seguimientoCount || 0);
        setAprobadosCount(aprobadosCount || 0);
        setAgendaCount(agendaCount || 0);
    }, [etapas]);

    const revisarPago = async (id: string) => {
        const transaccion = await obtenerDetallesPago(id);

        if ((transaccion.evento?.eventoEtapaId === etapas[0].id || transaccion.evento?.eventoEtapaId === etapas[1].id) && transaccion.pago?.status === 'paid') {

            //!pago inicial
            //actualizar estatus a 'cliente'
            //actualizar corizacion a 'aprobada'
            //actualizar evento a 'aprobado'
            const etapaSiguiente = etapas.find((etapa) => etapa.posicion === 3)?.id;

            //crear agenda
            //enviar correo de confirmación
            //enviar correo de bienvenida
            console.log('Etapa siguiente:', etapaSiguiente);
        } else {
            console.log('pago ordinario, enviar correo de confirmación');
        }
    }

    /****************************************
     ********** SUSCRIPCIONES ***************
     ****************************************/

    //! ETAPA EVENTOS
    const suscripionConteos = useCallback(() => {
        const subscriptionConteo = supabase
            .channel('realtime:Conteo')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'Evento' },
                async (payload) => {
                    //! enviar sonido de notificación al insertar un nuevo evento
                    if (payload.eventType === 'INSERT') {
                        playNotificationSound();
                    }
                    fetchCounts();
                }
            ).on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'Agenda' },
                async () => {
                    fetchCounts();
                }
            ).subscribe((status, err) => {
                if (err) {
                    console.error('Error en la suscripción:', err);
                } else {
                    console.log('Estado de la suscripción en conteo evento etapa:', status);
                }
            });
        //! Obtener los conteos iniciales
        fetchCounts();

        return () => {
            supabase.removeChannel(subscriptionConteo);
        };
    }, [fetchCounts]);

    //! PAGOS
    const suscripcionPagos = useCallback(() => {
        const subscriptionPago = supabase
            .channel('realtime:Pago')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'Pago' },
                async (payload) => {

                    //! enviar sonido de notificación al insertar un nuevo evento
                    if (payload.eventType === 'INSERT') {
                        console.log('Nuevo pago:', payload.new.id);
                        revisarPago(payload.new.id);
                    }
                }
            ).subscribe((status, err) => {
                if (err) {
                    console.error('Error en la suscripción Pago:', err);
                } else {
                    console.log('Estado de la suscripción en conteo:', status);
                }
            });
        //! Obtener los conteos iniciales
        fetchCounts();

        return () => {
            supabase.removeChannel(subscriptionPago);
        };
    }, [fetchCounts]);

    //! Función para obtener los conteos de eventos en seguimiento y aprobados
    useEffect(() => {
        obtenerEventoEtapas().then((todasLasEtapas) => {
            setEtapas(todasLasEtapas);
        })
        suscripionConteos();
    }, []);

    useEffect(() => {
        suscripcionPagos();
    }, [suscripcionPagos]);

    return (
        <div className='h-screen flex pt-5'>
            <div className='relative flex'>
                {/* Barra lateral fija con iconos */}
                <div className='flex flex-col items-center text-white h-full p-2 space-y-10'>

                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`p-2 rounded ${activeLink === link.href ? 'text-white' : 'text-zinc-500'}`}
                            title={link.label}
                            onClick={() => setActiveLink(link.href)}
                        >
                            <div className='relative'>
                                {React.cloneElement(link.icon, { alt: link.alt })}
                                {(link.href === '/admin/dashboard/eventos' && seguimientoCount > 0) && (
                                    <span className='absolute bottom-3 left-4 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center'>
                                        {seguimientoCount}
                                    </span>
                                )}
                                {(link.href === '/admin/dashboard/seguimiento' && aprobadosCount > 0) && (
                                    <span className='absolute bottom-3 left-4 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center'>
                                        {aprobadosCount}
                                    </span>
                                )}
                                {(link.href === '/admin/dashboard/agenda' && agendaCount > 0) && (
                                    <span className='absolute bottom-3 left-4 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center'>
                                        {agendaCount}
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default DashboardSideBar