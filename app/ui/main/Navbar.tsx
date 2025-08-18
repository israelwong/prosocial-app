'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation'
import Image from 'next/image';

export default function Navbar() {
    const pathname = usePathname()
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeItem, setActiveItem] = useState('');

    useEffect(() => {
        setActiveItem(pathname || '')
    }, [pathname])

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
        <header className="bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800 text-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" onClick={() => handleLinkClick('/')}>
                            <Image
                                src="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/logotipo_blanco.svg"
                                width={120}
                                height={40}
                                alt="ProSocial"
                                className="h-8 w-auto"
                                unoptimized
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {menu.map((item, index) => (
                            <Link
                                key={index}
                                href={item.link}
                                className={`
                                    relative px-3 py-2 text-sm font-medium transition-all duration-200
                                    ${activeItem === item.link
                                        ? 'text-white'
                                        : 'text-zinc-400 hover:text-white'
                                    }
                                `}
                                onClick={() => handleLinkClick(item.link)}
                            >
                                {item.name}
                                {activeItem === item.link && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"></div>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Mobile menu button */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-black/80 z-40" onClick={toggleMenu}>
                    <div className="fixed top-0 right-0 h-full w-80 max-w-full bg-zinc-900 shadow-xl z-50 transform transition-transform duration-300">
                        <div className="flex flex-col h-full">
                            {/* Mobile Header */}
                            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                                <Image
                                    src="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/logotipo_blanco.svg"
                                    width={100}
                                    height={32}
                                    alt="ProSocial"
                                    className="h-6 w-auto"
                                    unoptimized
                                />
                                <button
                                    onClick={toggleMenu}
                                    className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Mobile Menu Items */}
                            <nav className="flex-1 px-4 py-6">
                                <div className="space-y-2">
                                    {menu.map((item, index) => (
                                        <Link
                                            key={index}
                                            href={item.link}
                                            className={`
                                                block px-4 py-3 text-base font-medium rounded-lg transition-all duration-200
                                                ${activeItem === item.link
                                                    ? 'text-white bg-purple-600 shadow-sm'
                                                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                                                }
                                            `}
                                            onClick={() => handleLinkClick(item.link)}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            </nav>

                            {/* Mobile Footer */}
                            <div className="p-4 border-t border-zinc-800 bg-zinc-950">
                                <p className="text-center text-sm text-zinc-500">
                                    Momentos para toda la vida
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}