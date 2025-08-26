'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Boxes,
    CalendarClock,
    Layers,
    Users,
    Scale,
    CreditCard,
    SlidersHorizontal,
    Menu,
    X,
    ArrowLeft
} from 'lucide-react';

interface NavItem {
    href: string;
    label: string;
    Icon: React.ComponentType<{ size?: number; className?: string }>;
}

const navItems: NavItem[] = [
    { href: '/admin/configurar/paquetes', label: 'Paquetes', Icon: Boxes },
    { href: '/admin/configurar/tipoEvento', label: 'Tipo de eventos', Icon: CalendarClock },
    { href: '/admin/configurar/catalogo', label: 'Catálogo', Icon: Layers },
    { href: '/admin/configurar/usuarios', label: 'Personal', Icon: Users },
    { href: '/admin/configurar/pipeline', label: 'Pipeline', Icon: Users },

    { href: '/admin/configurar/condicionesComerciales', label: 'Condiciones', Icon: Scale },
    { href: '/admin/configurar/metodoPago', label: 'Métodos de pago', Icon: CreditCard },
    { href: '/admin/configurar/parametros', label: 'Parámetros', Icon: SlidersHorizontal },
];

function SideBarConfigurar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActiveLink = (href: string) => {
        if (!pathname) return false;
        return pathname.startsWith(href);
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
                            Configuración
                        </h2>
                        <div className="lg:hidden">
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
                    {navItems.map((item) => {
                        const IconComponent = item.Icon;
                        const isActive = isActiveLink(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    group flex items-center px-3 py-2.5 rounded-lg transition-all duration-200
                                    ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                    }
                                `}
                                onClick={() => setIsMobileMenuOpen(false)}
                                title={item.label}
                            >
                                <IconComponent
                                    size={20}
                                    className={`
                                        ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'}
                                        transition-colors duration-200
                                    `}
                                />
                                <span className="ml-3 font-medium lg:hidden xl:block transition-all duration-200">
                                    {item.label}
                                </span>
                                {isActive && (
                                    <div className="ml-auto w-2 h-2 bg-white rounded-full lg:hidden xl:block" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer del sidebar */}
                <div className="p-4 border-t border-zinc-800">
                    <Link
                        href="/admin/dashboard"
                        className="group flex items-center px-3 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-200"
                        title="Volver al Dashboard"
                    >
                        <ArrowLeft size={20} className="text-zinc-400 group-hover:text-white transition-colors duration-200" />
                        <span className="ml-3 font-medium lg:hidden xl:block">
                            Volver
                        </span>
                    </Link>
                </div>
            </div>
        </>
    )
}

export default SideBarConfigurar;