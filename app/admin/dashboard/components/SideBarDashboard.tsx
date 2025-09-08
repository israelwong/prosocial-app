'use client'
import React, { useState, useEffect, useCallback } from 'react'
import {
    Home,
    Calendar,
    Users,
    Wallet,
    Inbox,
    Columns,
    Settings,
    Menu,
    X
} from 'lucide-react'
import { supabase } from '../../_lib/supabase'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { validarPagoStripe } from '../../_lib/actions/pago/pago.actions'
import { EVENTO_STATUS, AGENDA_STATUS } from '../../_lib/constants/status'

const links = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home, alt: 'Dashboard' },
    { href: '/admin/dashboard/gestion', label: 'Kanban', icon: Columns, alt: 'Kanban' },
    { href: '/admin/dashboard/eventos', label: 'Eventos', icon: Calendar, alt: 'Eventos' },
    { href: '/admin/dashboard/seguimiento', label: 'Seguimiento', icon: Inbox, alt: 'Seguimiento' },
    { href: '/admin/dashboard/agenda', label: 'Agenda', icon: Calendar, alt: 'Agenda' },
    { href: '/admin/dashboard/contactos', label: 'Contactos', icon: Users, alt: 'Contactos' },
    { href: '/admin/dashboard/finanzas', label: 'Finanzas', icon: Wallet, alt: 'Finanzas' },
]

function DashboardSideBar() {
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [seguimientoCount, setSeguimientoCount] = useState(0)
    const [aprobadosCount, setAprobadosCount] = useState(0)
    const [agendaCount, setAgendaCount] = useState(0)

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

        // Eventos en seguimiento (pendientes de aprobación)
        const { count: seguimientoCount, error: seguimientoError } = await supabase
            .from('Evento')
            .select('id', { count: 'exact' })
            .in('status', [
                EVENTO_STATUS.PENDIENTE,    // Eventos pendientes
                EVENTO_STATUS.ACTIVE        // Legacy: eventos activos antiguos
            ]);

        // Eventos aprobados (en proceso o completados)
        const { count: aprobadosCount, error: aprobadosError } = await supabase
            .from('Evento')
            .select('id', { count: 'exact' })
            .in('status', [
                EVENTO_STATUS.APROBADO,     // Eventos aprobados
                EVENTO_STATUS.COMPLETADO    // Eventos completados
            ]);

        // Agenda pendiente y confirmada (requieren atención)
        const { count: agendaCount, error: agendaError } = await supabase
            .from('Agenda')
            .select('id', { count: 'exact' })
            .in('status', [
                AGENDA_STATUS.PENDIENTE,    // Citas pendientes de confirmación
                AGENDA_STATUS.CONFIRMADO    // Citas confirmadas que requieren seguimiento
            ]);

        if (seguimientoError) console.error('Error al obtener eventos en seguimiento:', seguimientoError);
        if (aprobadosError) console.error('Error al obtener eventos aprobados:', aprobadosError);
        if (agendaError) console.error('Error al obtener agenda pendiente:', agendaError);

        setSeguimientoCount(seguimientoCount || 0);
        setAprobadosCount(aprobadosCount || 0);
        setAgendaCount(agendaCount || 0);
    }, []);

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

    const suscripcionPagos = useCallback(() => {
        const subscriptionPagos = supabase
            .channel('realtime:Pagos')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'Pago' },
                async (payload) => {
                    // console.log('Evento en pagos:', payload);
                    if (payload.eventType === 'INSERT') {
                        // console.log('Nuevo pago:', payload.new.id);
                        validarPagoStripe(payload.new.id);
                    }
                    if (payload.eventType === 'UPDATE') {
                        // console.log('Actualización de pago:', payload.new.id);
                        validarPagoStripe(payload.new.id);
                    }
                }
            ).subscribe((status, err) => {
                if (err) {
                    console.error('Error en la suscripción:', err);
                } else {
                    console.log('Estado de la suscripción en pagos:', status);
                }
            });

        return () => {
            supabase.removeChannel(subscriptionPagos);
        };
    }, []);

    //! Función para obtener los conteos de eventos en seguimiento y aprobados
    useEffect(() => {
        console.log('🔌 Configurando suscripciones de conteo y pagos...')

        // Configurar suscripción de conteos
        const unsubscribeConteos = suscripionConteos()

        // Configurar suscripción de pagos
        const unsubscribePagos = suscripcionPagos()

        // Cleanup function para evitar memory leaks
        return () => {
            console.log('🧹 Limpiando suscripciones de conteo y pagos...')
            unsubscribeConteos()
            unsubscribePagos()
        }
    }, [fetchCounts, suscripionConteos, suscripcionPagos])

    // Función para verificar si un link está activo
    const isActiveLink = (href: string) => {
        if (!pathname) return false;
        if (href === '/admin/dashboard') {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    // Función para obtener el count de un link específico
    const getLinkCount = (href: string) => {
        switch (href) {
            case '/admin/dashboard/eventos':
                return seguimientoCount; // Eventos pendientes en seguimiento
            case '/admin/dashboard/seguimiento':
                return aprobadosCount; // Eventos aprobados y completados
            case '/admin/dashboard/agenda':
                return agendaCount; // Citas pendientes y confirmadas que requieren atención
            default:
                return 0;
        }
    };

    return (
        <>
            {/* Botón de menú móvil */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-800 text-white rounded-md hover:bg-zinc-700 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Overlay para cerrar el menú en móvil */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:static inset-y-0 left-0 z-40
                w-64 lg:w-20 xl:w-64
                bg-zinc-900 border-r border-zinc-800
                transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                flex flex-col h-screen
            `}>
                {/* Header del sidebar */}
                <div className="p-4 border-b border-zinc-800">
                    <div className="flex items-center justify-between">
                        <h2 className="text-white font-semibold text-lg lg:hidden xl:block">
                            Dashboard
                        </h2>
                        <div className="lg:hidden xl:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-zinc-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-4 space-y-2">
                    {links.map((link) => {
                        const IconComponent = link.icon;
                        const isActive = isActiveLink(link.href);
                        const count = getLinkCount(link.href);

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`
                                    group flex items-center px-3 py-2.5 rounded-lg transition-all duration-200
                                    ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                    }
                                `}
                                onClick={() => setIsMobileMenuOpen(false)}
                                title={link.label}
                            >
                                <div className="relative flex items-center">
                                    <IconComponent
                                        size={20}
                                        className={`
                                            ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'}
                                            transition-colors duration-200
                                        `}
                                    />

                                    {/* Badge de notificaciones */}
                                    {count > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-medium">
                                            {count > 99 ? '99+' : count}
                                        </span>
                                    )}
                                </div>

                                {/* Label del link - oculto en lg, visible en xl y móvil */}
                                <span className="ml-3 font-medium lg:hidden xl:block transition-all duration-200">
                                    {link.label}
                                </span>

                                {/* Indicador de estado activo */}
                                {isActive && (
                                    <div className="ml-auto w-2 h-2 bg-white rounded-full lg:hidden xl:block" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer del sidebar */}
                <div className="p-4 border-t border-zinc-800">
                    <div className="text-xs text-zinc-500 text-center lg:hidden xl:block">
                        Dashboard v2.0
                    </div>
                </div>
            </div>
        </>
    )
}

export default DashboardSideBar