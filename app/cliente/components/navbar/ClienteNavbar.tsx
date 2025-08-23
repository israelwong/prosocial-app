'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClienteAuth } from '@/app/cliente/hooks/useClienteAuth';
import {
    Calendar,
    CreditCard,
    Home,
    FileText,
    Settings,
    LogOut,
    User,
    Menu,
    X
} from 'lucide-react';

interface NavigationItem {
    name: string;
    href: string;
    icon: any;
    current: boolean;
}

export default function ClienteNavbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { cliente, logout } = useClienteAuth();

    // Configuración de navegación
    const navigationItems: NavigationItem[] = [
        {
            name: 'Dashboard',
            href: '/cliente/dashboard',
            icon: Home,
            current: pathname === '/cliente/dashboard'
        },
        {
            name: 'Eventos',
            href: '/cliente/dashboard',
            icon: Calendar,
            current: pathname?.includes('/cliente/evento') && !pathname?.includes('/pago') || false
        },
        {
            name: 'Cotizaciones',
            href: '/cliente/cotizaciones',
            icon: FileText,
            current: pathname?.includes('/cliente/cotizacion') || false
        },
        {
            name: 'Pagos',
            href: '/cliente/pagos',
            icon: CreditCard,
            current: pathname?.includes('/pago') || pathname === '/cliente/pagos' || false
        }
    ];

    if (!cliente) {
        return null;
    }

    return (
        <header className="bg-zinc-900 border-b border-zinc-800 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo y navegación principal */}
                    <div className="flex items-center space-x-8">
                        <Link href="/cliente/dashboard" className="flex items-center">
                            <img
                                src="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/isotipo_gris.svg"
                                alt="ProSocial"
                                className="w-8 h-8 mr-3"
                            />
                            <span className="text-xl font-bold text-white">ProSocial</span>
                            <span className="ml-2 text-sm text-zinc-400 hidden sm:inline">Portal Cliente</span>
                        </Link>

                        {/* Navegación principal - Desktop */}
                        <nav className="hidden md:flex space-x-6">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${item.current
                                                ? 'bg-zinc-800 text-white'
                                                : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4 mr-2" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Acciones del usuario */}
                    <div className="flex items-center space-x-4">
                        {/* Menú de usuario */}
                        <div className="relative group">
                            {/* Dropdown del usuario */}
                            <div className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="py-1">
                                    <Link
                                        href="/cliente/profile"
                                        className="flex items-center px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700"
                                    >
                                        <Settings className="w-4 h-4 mr-2" />
                                        Mi Perfil
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="flex items-center w-full px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Cerrar Sesión
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Menú móvil */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Menú móvil */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-zinc-800 border-t border-zinc-700">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${item.current
                                            ? 'bg-zinc-700 text-white'
                                            : 'text-zinc-300 hover:text-white hover:bg-zinc-700'
                                        }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Usuario en móvil */}
                    <div className="pt-4 pb-3 border-t border-zinc-700">
                        <div className="flex items-center px-5">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="ml-3">
                                <div className="text-base font-medium text-white">{cliente.nombre}</div>
                                <div className="text-sm text-zinc-400">{cliente.email}</div>
                            </div>
                        </div>
                        <div className="mt-3 px-2 space-y-1">
                            <Link
                                href="/cliente/profile"
                                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:text-white hover:bg-zinc-700"
                            >
                                <Settings className="w-5 h-5 mr-3" />
                                Mi Perfil
                            </Link>
                            <button
                                onClick={logout}
                                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:text-white hover:bg-zinc-700"
                            >
                                <LogOut className="w-5 h-5 mr-3" />
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
