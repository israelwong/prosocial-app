'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation';

const links = [
    { href: '/admin/dashboard', label: 'Inicio' },
    { href: '/admin/dashboard/prospectos', label: 'Prospectos' },
    { href: '/admin/dashboard/cotizaciones', label: 'Cotizaciones' },
    { href: '/admin/dashboard/clientes', label: 'Clientes' },
    { href: '/admin/dashboard/finanzas', label: 'Finanzas' },
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