import React, { useState } from 'react'
import Link from 'next/link'
import { Home, Calendar, Users, Wallet, Inbox } from 'lucide-react'

const links = [
    { href: '/admin/dashboard', label: 'Inicio', icon: <Home size={24} /> },
    { href: '/admin/dashboard/eventos', label: 'Eventos', icon: <Inbox size={24} /> },
    { href: '/admin/dashboard/agenda', label: 'Agenda', icon: <Calendar size={24} /> },
    { href: '/admin/dashboard/contactos', label: 'Contactos', icon: <Users size={24} /> },
    { href: '/admin/dashboard/finanzas', label: 'Finanzas', icon: <Wallet size={24} /> },
]

function DashboardSideBar() {
    const [activeLink, setActiveLink] = useState('')

    return (
        <div className='h-screen flex pt-5'>
            <div className='relative flex'>
                {/* Barra lateral fija con iconos */}
                <div className='flex flex-col items-center text-white h-full p-3 space-y-10'>

                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`p-2 rounded ${activeLink === link.href ? 'text-white' : 'text-zinc-500'}`}
                            title={link.label}
                            onClick={() => setActiveLink(link.href)}
                        >
                            {link.icon}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default DashboardSideBar