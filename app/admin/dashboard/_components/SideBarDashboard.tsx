'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shuffle, Home, Calendar, Users, Wallet, Inbox } from 'lucide-react'
import { supabase } from '../../_lib/supabase'

const links = [
    { href: '/admin/dashboard', label: 'Inicio', icon: <Home size={24} /> },
    { href: '/admin/dashboard/eventos', label: 'Eventos', icon: <Inbox size={24} />, count: 0 },
    { href: '/admin/dashboard/seguimiento', label: 'Seguimiento', icon: <Shuffle size={24} />, count: 0 },
    { href: '/admin/dashboard/agenda', label: 'Agenda', icon: <Calendar size={24} /> },
    { href: '/admin/dashboard/contactos', label: 'Contactos', icon: <Users size={24} /> },
    { href: '/admin/dashboard/finanzas', label: 'Finanzas', icon: <Wallet size={24} /> },
]

function DashboardSideBar() {

    const [activeLink, setActiveLink] = useState('')
    const [seguimientoCount, setSeguimientoCount] = useState(0)
    const [aprobadosCount, setAprobadosCount] = useState(0)

    //! Función para reproducir un sonido de notificación
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

    //! Función para obtener los conteos de eventos en seguimiento y aprobados
    useEffect(() => {

        const fetchCounts = async () => {
            // console.log('Fetching counts...');
            const { count: seguimientoCount, error: seguimientoError } = await supabase
                .from('Evento')
                .select('id', { count: 'exact' })
                .in('status', ['nuevo', 'seguimiento']); // Filtra por múltiples valores
            const { count: aprobadosCount, error: aprobadosError } = await supabase
                .from('Evento')
                .select('id', { count: 'exact' })
                .eq('status', 'aprobado');
            // Asegúrate de que no haya errores
            if (seguimientoError) console.error('Error al obtener seguimiento leads:', seguimientoError);
            if (aprobadosError) console.error('Error al obtener aprobados leads:', aprobadosError);
            // Establecer los conteos
            setSeguimientoCount(seguimientoCount || 0);
            setAprobadosCount(aprobadosCount || 0);
        };

        //! Suscripción a cambios en tiempo real   
        const subscription = supabase
            .channel('realtime:Evento')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'Evento' },
                async (payload) => {
                    // console.log('Cambio detectado:', payload);
                    //! enviar sonido de notificación al insertar un nuevo evento
                    if (payload.eventType === 'INSERT') {
                        playNotificationSound();
                    }
                    // Actualiza los conteos cuando cambian los datos
                    fetchCounts();
                }
            )
            .subscribe((status, err) => {
                if (err) {
                    console.error('Error en la suscripción:', err);
                } else {
                    console.log('Estado de la suscripción en SIDEBAR:', status);
                }
            });
        //! Obtener los conteos iniciales
        fetchCounts();
        return () => {
            //! Eliminar la suscripción cuando el componente se desmonta
            supabase.removeChannel(subscription);
        };
    }, []);

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
                                {link.icon}
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
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default DashboardSideBar