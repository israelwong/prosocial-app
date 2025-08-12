'use client'
import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import { Boxes, CalendarClock, Layers, Users, Scale, CreditCard, SlidersHorizontal, Menu, X } from 'lucide-react';

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
    { href: '/admin/configurar/condicionesComerciales', label: 'Condiciones', Icon: Scale },
    { href: '/admin/configurar/metodoPago', label: 'Métodos de pago', Icon: CreditCard },
    { href: '/admin/configurar/parametros', label: 'Parámetros', Icon: SlidersHorizontal },
];

function DashboardSideBar() {
    const pathnameRaw = usePathname();
    const pathname = pathnameRaw || '';
    const [open, setOpen] = useState(false);

    // Determinar activo por startsWith para subrutas
    const items = useMemo(() => navItems.map(item => ({
        ...item,
        active: pathname === item.href || pathname.startsWith(item.href + '/')
    })), [pathname]);

    const baseItemClasses = 'flex items-center gap-2 w-full text-sm px-3 py-2 rounded-md transition-colors';

    return (
        <>
            {/* Barra superior móvil */}
            <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
                <span className="text-zinc-200 font-semibold">Configurar</span>
                <button aria-label={open ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setOpen(o => !o)}
                    className="p-2 rounded-md border border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                    {open ? <X size={18} /> : <Menu size={18} />}
                </button>
            </div>
            {/* Overlay móvil */}
            {open && <div onClick={() => setOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden z-20" />}
            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-30 md:z-auto
                w-64 md:w-60 border-r border-zinc-800 bg-zinc-950/95 md:bg-transparent backdrop-blur md:backdrop-blur-none
                transform transition-transform duration-200 ease-in-out
                ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
            >
                <nav className="h-full flex flex-col px-4 md:px-5 py-4 md:py-6 overflow-y-auto">
                    <ul className='space-y-1.5'>
                        {items.map(item => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    aria-current={item.active ? 'page' : undefined}
                                    className={`${baseItemClasses} ${item.active
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'}
                                    `}
                                    onClick={() => setOpen(false)}
                                >
                                    <item.Icon size={16} className="shrink-0" />
                                    <span className="truncate">{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-auto pt-6 hidden md:block text-[10px] text-zinc-600 uppercase tracking-wider">Panel</div>
                </nav>
            </aside>
            {/* Espaciador para layout en móvil */}
            <div className="md:hidden h-0" />
        </>
    )
}

export default DashboardSideBar