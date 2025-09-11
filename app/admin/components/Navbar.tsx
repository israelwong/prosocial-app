'use client'
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Image from 'next/image';
import { User } from '@/app/admin/_lib/types';
import { verifyToken, cerrarSesion } from '@/app/lib/auth';
import { Bell, Menu, X, LogOut, ChevronDown, User as UserIcon, Settings, LayoutDashboard } from 'lucide-react'
import { supabase } from '../_lib/supabase';
import NotificacionesDropdown from './NotificacionesDropdown';
import { REALTIME_DEBUG_CONFIG, logRealtime } from '../_lib/realtime-debug-config';

function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const router = useRouter();
    const token = Cookies.get('token');

    //! NOTIFICACIONES
    const suscripcionNotificaciones = useCallback(async () => {
        // Control centralizado de debug
        if (!REALTIME_DEBUG_CONFIG.NAVBAR_NOTIFICACIONES) {
            logRealtime('NAVBAR', 'Realtime DESHABILITADO para debug sistemático')
            return () => { } // Retornar función vacía de cleanup
        }

        logRealtime('NAVBAR', 'Configurando suscripción realtime para Notificacion')
        const subscriptionNotificaciones = supabase
            .channel('realtime:notificaciones')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'Notificacion' },
                async (payload) => {
                    logRealtime('NAVBAR', 'Evento en notificaciones:', payload);
                }
            ).subscribe((status, err) => {
                if (err) {
                    console.error('Error en la suscripción de notificaciones:', err);
                    // Si hay error de schema mismatch, logearlo específicamente
                    if (err.message?.includes('mismatch between server and client bindings')) {
                        console.error('🚨 Schema mismatch detectado en tabla Notificacion')
                    }
                } else {
                    logRealtime('NAVBAR', `Estado de la suscripción: ${status}`);
                }
            });
        return () => {
            supabase.removeChannel(subscriptionNotificaciones);
        }
    }, []);

    useEffect(() => {
        suscripcionNotificaciones();

        async function validarToken(token: string | undefined) {
            if (token) {
                try {
                    const response = await verifyToken(token);
                    if (response.payload) {
                        const userData: User = response.payload as unknown as User;
                        userData.token = token;
                        setUser(userData);
                        Cookies.set('user', JSON.stringify(userData));
                    } else {
                        router.push('/admin');
                    }
                } catch (error) {
                    console.error('Error verifying token:', error);
                    router.push('/admin');
                }
            } else {
                router.push('/admin');
            }
        }
        validarToken(token);
    }, [token, router, suscripcionNotificaciones]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    async function handleCerrarSesion() {
        if (confirm('¿Estás seguro de cerrar sesión?')) {
            if (user && user.token) {
                const response = await cerrarSesion(user.token);
                if (response && response.status) {
                    Cookies.remove('token');
                    router.push('/admin');
                }
            }
        }
    }

    return (
        <nav className='bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800/50 sticky top-0 z-[60]'>
            <div className='w-full mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex justify-between items-center h-16'>

                    {/* Logo y Brand */}
                    <div className='flex items-center space-x-3'>
                        <div className='flex items-center space-x-2'>
                            <Image
                                src='https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/isotipo_gris.svg'
                                width={24}
                                height={24}
                                alt='ProSocial Logo'
                                className='opacity-90'
                            />
                            <span className='text-xl font-semibold text-zinc-200'>
                                ProSocial
                            </span>
                        </div>
                    </div>

                    {/* Right Side - Desktop */}
                    <div className='hidden md:flex items-center space-x-4'>

                        {/* Notifications Dropdown */}
                        <NotificacionesDropdown userId={user?.id} />

                        {/* User Menu */}
                        <div className='relative' ref={userMenuRef}>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className='flex items-center space-x-2 p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 rounded-lg transition-all duration-200'
                            >
                                <div className='w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center'>
                                    <UserIcon size={16} />
                                </div>
                                <span className='text-sm font-medium hidden lg:block'>{user?.username}</span>
                                <ChevronDown size={16} className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* User Dropdown */}
                            {userMenuOpen && (
                                <div className='absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-1 z-[100]'>
                                    <div className='px-4 py-2 border-b border-zinc-800'>
                                        <p className='text-sm font-medium text-zinc-200'>{user?.username}</p>
                                        <p className='text-xs text-zinc-500'>{user?.role}</p>
                                    </div>
                                    <Link href="/admin/dashboard">
                                        <span className='w-full px-4 py-2 text-left text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 flex items-center space-x-2 cursor-pointer'>
                                            <LayoutDashboard size={16} />
                                            <span>Dashboard</span>
                                        </span>
                                    </Link>
                                    {user && user.role === 'admin' && (
                                        <Link href="/admin/configurar">
                                            <span className='w-full px-4 py-2 text-left text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 flex items-center space-x-2 cursor-pointer'>
                                                <Settings size={16} />
                                                <span>Configurar</span>
                                            </span>
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleCerrarSesion}
                                        className='w-full px-4 py-2 text-left text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 flex items-center space-x-2'
                                    >
                                        <LogOut size={16} />
                                        <span>Cerrar sesión</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className='md:hidden'>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className='p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 rounded-lg transition-all duration-200'
                        >
                            {menuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className='md:hidden border-t border-zinc-800/50'>
                        <div className='pt-4 pb-3 border-t border-zinc-800/50'>
                            <div className='flex items-center px-5 space-x-3'>
                                <div className='w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center'>
                                    <UserIcon size={18} />
                                </div>
                                <div>
                                    <div className='text-base font-medium text-zinc-200'>{user?.username}</div>
                                    <div className='text-sm text-zinc-500'>{user?.role}</div>
                                </div>
                            </div>
                            <div className='mt-3 px-2 space-y-1'>
                                {/* Notificaciones en móvil */}
                                <div className="px-3 py-2">
                                    <NotificacionesDropdown userId={user?.id} />
                                </div>
                                <button
                                    className='flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 w-full text-left transition-all duration-200'
                                >
                                    <Bell size={18} />
                                    <span>Notificaciones</span>
                                </button>
                                <button
                                    onClick={handleCerrarSesion}
                                    className='flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 w-full text-left transition-all duration-200'
                                >
                                    <LogOut size={18} />
                                    <span>Cerrar sesión</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;