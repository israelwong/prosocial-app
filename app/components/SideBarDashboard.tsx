'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shuffle, Home, Calendar, Users, Wallet, Inbox } from 'lucide-react'
import { conteo } from '../admin/_lib/conteo.actions'

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
    const [gestionarCount, setGestionarCount] = useState(0)

    useEffect(() => {
        conteo().then(data => {
            console.log(data)
            setSeguimientoCount(data.seguimiento)
            setGestionarCount(data.gestionar)
        })
        // Aquí deberías hacer las llamadas a la API para obtener los números de eventos y seguimientos
        // Ejemplo:
        // fetch('/api/eventos/count').then(res => res.json()).then(data => setEventCount(data.count))
        // fetch('/api/seguimiento/count').then(res => res.json()).then(data => setSeguimientoCount(data.count))

        // Simulación de datos
        // setEventCount(5)
        // setSeguimientoCount(3)
    }, [])

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
                            <div className='relative'>
                                {link.icon}
                                {(link.href === '/admin/dashboard/eventos' && seguimientoCount > 0) && (
                                    <span className='absolute bottom-3 left-4 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center'>
                                        {seguimientoCount}
                                    </span>
                                )}
                                {(link.href === '/admin/dashboard/seguimiento' && gestionarCount > 0) && (
                                    <span className='absolute bottom-3 left-4 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center'>
                                        {gestionarCount}
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