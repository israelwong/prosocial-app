'use client';

import { useState, useEffect, useRef } from 'react';
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
    X,
    CalendarPlus,
    Mail,
    MapPin,
    Users,
    Globe,
    ChevronDown
} from 'lucide-react';

interface NavigationItem {
    name: string;
    href: string;
    icon: any;
    current: boolean;
    comingSoon?: boolean;
    category?: 'core' | 'services';
    description?: string;
}

export default function ClienteNavbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
    const pathname = usePathname();
    const { cliente, logout } = useClienteAuth();
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const servicesMenuRef = useRef<HTMLDivElement>(null);

    // Cerrar menú móvil al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setMobileMenuOpen(false);
            }
            if (servicesMenuRef.current && !servicesMenuRef.current.contains(event.target as Node)) {
                setServicesMenuOpen(false);
            }
        };

        if (mobileMenuOpen || servicesMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [mobileMenuOpen, servicesMenuOpen]);

    // Cerrar menús al cambiar de ruta
    useEffect(() => {
        setMobileMenuOpen(false);
        setServicesMenuOpen(false);
    }, [pathname]);

    // Configuración de navegación principal (servicios core)
    const coreNavigationItems: NavigationItem[] = [
        {
            name: 'Dashboard',
            href: '/cliente/dashboard',
            icon: Home,
            current: pathname === '/cliente/dashboard',
            category: 'core',
            description: 'Panel principal de tu cuenta'
        },
        {
            name: 'Mis Eventos',
            href: '/cliente/dashboard',
            icon: Calendar,
            current: pathname?.includes('/cliente/evento') && !pathname?.includes('/pago') || false,
            category: 'core',
            description: 'Eventos contratados y en progreso'
        },
        {
            name: 'Historial de Pagos',
            href: '/cliente/pagos',
            icon: CreditCard,
            current: pathname?.includes('/pago') || pathname === '/cliente/pagos' || false,
            category: 'core',
            description: 'Historial de pagos y facturas'
        }
    ];

    // Servicios digitales adicionales (futuros upsells)
    const digitalServicesItems: NavigationItem[] = [
        {
            name: 'Planificación de Evento',
            href: '/cliente/servicios/planificacion',
            icon: CalendarPlus,
            current: pathname?.includes('/cliente/servicios/planificacion') || false,
            category: 'services',
            comingSoon: true,
            description: 'Herramientas para planificar tu evento paso a paso'
        },
        {
            name: 'Invitaciones Digitales',
            href: '/cliente/servicios/invitaciones',
            icon: Mail,
            current: pathname?.includes('/cliente/servicios/invitaciones') || false,
            category: 'services',
            comingSoon: true,
            description: 'Crea y envía invitaciones personalizadas'
        },
        {
            name: 'Locaciones para Sesión',
            href: '/cliente/servicios/locaciones',
            icon: MapPin,
            current: pathname?.includes('/cliente/servicios/locaciones') || false,
            category: 'services',
            comingSoon: true,
            description: 'Catálogo de locaciones para tu sesión fotográfica'
        },
        {
            name: 'Proveedores de Confianza',
            href: '/cliente/servicios/proveedores',
            icon: Users,
            current: pathname?.includes('/cliente/servicios/proveedores') || false,
            category: 'services',
            comingSoon: true,
            description: 'Red de proveedores verificados'
        },
        {
            name: 'Espacio Digital',
            href: '/cliente/servicios/espacio-digital',
            icon: Globe,
            current: pathname?.includes('/cliente/servicios/espacio-digital') || false,
            category: 'services',
            comingSoon: true,
            description: 'Sitio web personalizado para tu evento'
        }
    ];

    if (!cliente) {
        return null;
    }

    return (
        <header className="bg-zinc-900 border-b border-zinc-800 shadow-lg relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo y navegación principal */}
                    <div className="flex items-center space-x-8">
                        <Link href="/cliente/dashboard" className="flex items-center">
                            <img
                                src="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/logotipo_gris.svg"
                                alt="ProSocial"
                                className="h-8 w-auto"
                            />
                            <span className="ml-2 text-sm text-zinc-400 hidden sm:inline">Portal Cliente</span>
                        </Link>

                        {/* Navegación principal - Desktop */}
                        <nav className="hidden md:flex space-x-6">
                            {/* Enlaces principales */}
                            {coreNavigationItems.map((item) => {
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

                            {/* Menú de Servicios Digitales */}
                            <div className="relative" ref={servicesMenuRef}>
                                <button
                                    onClick={() => setServicesMenuOpen(!servicesMenuOpen)}
                                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                                >
                                    <Globe className="w-4 h-4 mr-2" />
                                    Servicios Digitales
                                    <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${servicesMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown de servicios */}
                                {servicesMenuOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-80 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-50">
                                        <div className="p-4">
                                            <div className="text-sm font-medium text-zinc-200 mb-3">
                                                Servicios Premium Adicionales
                                                <span className="text-xs text-zinc-400 ml-1">- Próximamente</span>
                                            </div>
                                            <div className="space-y-3">
                                                {digitalServicesItems.map((service) => {
                                                    const ServiceIcon = service.icon;
                                                    return (
                                                        <div
                                                            key={service.name}
                                                            className="group relative rounded-md p-2 cursor-default"
                                                        >
                                                            <div className="flex items-start">
                                                                <ServiceIcon className="w-4 h-4 text-zinc-700 mt-0.5 flex-shrink-0" />
                                                                <div className="ml-3 flex-1">
                                                                    <div className="text-sm font-medium text-zinc-200">
                                                                        {service.name}
                                                                    </div>
                                                                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                                                                        {service.description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </nav>
                    </div>

                    {/* Acciones del usuario */}
                    <div className="flex items-center space-x-4">
                        {/* Menú de usuario */}
                        <div className="relative group">
                            {/* Dropdown del usuario */}
                            <div className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="py-1">
                                    {/* <Link
                                        href="/cliente/profile"
                                        className="flex items-center px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700"
                                    >
                                        <Settings className="w-4 h-4 mr-2" />
                                        Mi Perfil
                                    </Link> */}
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

            {/* Menú móvil - Overlay que se sobrepone */}
            {mobileMenuOpen && (
                <div
                    ref={mobileMenuRef}
                    className="absolute top-full left-0 right-0 md:hidden bg-zinc-800 border-t border-zinc-700 shadow-lg z-50"
                >
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {/* Enlaces principales en móvil */}
                        {coreNavigationItems.map((item) => {
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

                        {/* Separador */}
                        <div className="pt-2 border-t border-zinc-700 mt-3">
                            <div className="px-3 py-2">
                                <span className="text-sm font-medium text-zinc-200">
                                    Servicios Premium Adicionales
                                </span>
                                <span className="text-xs text-zinc-400 ml-1">- Próximamente</span>
                            </div>

                            {/* Servicios digitales en móvil */}
                            {digitalServicesItems.map((service) => {
                                const ServiceIcon = service.icon;
                                return (
                                    <div
                                        key={service.name}
                                        className="px-3 py-2 cursor-default"
                                    >
                                        <div className="flex items-start">
                                            <ServiceIcon className="w-4 h-4 mr-3 mt-0.5 text-zinc-700 flex-shrink-0" />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-zinc-100">
                                                    {service.name}
                                                </div>
                                                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                                                    {service.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
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
                            {/* <Link
                                href="/cliente/profile"
                                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:text-white hover:bg-zinc-700"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Settings className="w-5 h-5 mr-3" />
                                Mi Perfil
                            </Link> */}
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    logout();
                                }}
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
