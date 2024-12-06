'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation'
import Image from 'next/image';


export default function Navbar() {
    const pathname = usePathname()

    useEffect(() => {
        setActiveItem(pathname)
    }, [pathname])


    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeItem, setActiveItem] = useState('');

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLinkClick = (path: string) => {
        setActiveItem(path);
        setIsMenuOpen(false);
    };

    const menu = [
        { name: 'Inicio', link: "/" },
        { name: 'Fifteens', link: "/fifteens" },
        { name: 'Weddings', link: "/weddings" },
        { name: 'Contacto', link: "/contacto" },
    ];

    return (
        <header className="bg-gradient-to-r bg-purple-800 from-gray-950/60 text-white p-4 z-50  w-full">

            <div className="container mx-auto flex items-center justify-between">
                <div>
                    <figure className="flex">
                        <Link href="/" onClick={() => handleLinkClick('/')}>
                            <Image
                                src="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/logotipo_blanco.svg"
                                width={200}
                                height={200}
                                alt="Logotipo de ProSocial"
                                className="w-1/2 h-fit"
                            />
                        </Link>
                    </figure>
                </div>
                <nav className="hidden md:flex space-x-8">
                    {menu.map((item, index) => (
                        <Link
                            key={index}
                            href={item.link}
                            className={`flex items-center hover:text-gray-300 ${activeItem === item.link ? 'text-violet-300 text-2xl font-Smooch underline' : ''}`}
                            onClick={() => handleLinkClick(item.link)}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
                <button
                    id="menu-toggle"
                    onClick={toggleMenu}
                    className="text-white md:hidden"
                    aria-label="Toggle menu"
                >
                    <Menu />
                </button>
            </div>

            <div
                id="mobile-menu"
                className={`fixed inset-0 bg-black/85 text-white ${isMenuOpen ? 'flex' : 'hidden'} flex-col justify-between z-50`}
            >
                <div className="h-screen flex flex-col items-center justify-center space-y-4">
                    <h2 className="text-3xl font-Bebas-Neue text-gray-300 tracking-wide">
                        Menú de navegación
                    </h2>
                    <div className="py-6">
                        <nav className="flex flex-col items-center space-y-8">
                            {menu.map((item, index) => (
                                <div key={index}>
                                    <Link href={item.link}
                                        className={`hover:text-gray-300 ${activeItem === item.link ? 'text-violet-300 text-2xl font-Smooch underline' : ''}`}
                                        onClick={() => handleLinkClick(item.link)}>
                                        {item.name}
                                    </Link>
                                </div>
                            ))}
                        </nav>
                    </div>
                    <button
                        id="menu-close"
                        onClick={toggleMenu}
                        className="text-sm border border-gray-600 rounded-full px-4 py-2"
                    >
                        Cerrar menú
                    </button>
                </div>
            </div>
        </header>
    );
}