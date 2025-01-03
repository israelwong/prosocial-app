'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation';

const links = [
    { href: '/admin/configurar', label: 'Inicio' },
    { href: '/admin/configurar/usuarios', label: 'Usuarios' },
    { href: '/admin/configurar/paquetes', label: 'Paquetes' },
    { href: '/admin/configurar/tipoEvento', label: 'Tipo de eventos' },
    { href: '/admin/configurar/servicios', label: 'Servicios' },
    { href: '/admin/configurar/categorias', label: 'Categorías de servicio' },
    { href: '/admin/configurar/condicionesComerciales', label: 'Condiciones comerciales' },
    { href: '/admin/configurar/metodoPago', label: 'Métodos de pago' },
    { href: '/admin/configurar/parametros', label: 'Parámetros base' },
];

function DashboardSideBar() {
    const pathname = usePathname();

    return (
        <div className='px-5 w-60 h-screen'>
            <nav>
                <ul className='py-5 h-full space-y-5'>
                    {links.map((link) => (
                        <li key={link.href}>
                            <Link href={link.href}>
                                <span className={`text-gray-500 ${pathname === link.href ? 'font-bold text-white' : ''}`}>
                                    {link.label}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    )
}

export default DashboardSideBar