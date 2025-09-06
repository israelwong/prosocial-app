'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

// const socialLinks = [
//     {
//         title: "Facebook",
//         href: "https://www.facebook.com/prosocialmx",
//         iconClass: "fab fa-facebook-f",
//         ariaLabel: "Facebook"
//     },
//     {
//         title: "Instagram",
//         href: "https://www.instagram.com/prosocialmx",
//         iconClass: "fab fa-instagram",
//         ariaLabel: "Instagram"
//     },
//     {
//         title: "YouTube",
//         href: "https://www.youtube.com/@prosocial_fifteens",
//         iconClass: "fab fa-youtube",
//         ariaLabel: "YouTube"
//     },
//     {
//         title: "Tiktok",
//         href: "https://www.tiktok.com/@prosocialmx",
//         iconClass: "fab fa-tiktok",
//         ariaLabel: "Tiktok"
//     }
// ];

function Footer() {
    return (
        <footer className="w-full py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    {/* <div className="flex space-x-10 justify-center items-center mb-10">
                        {socialLinks.map((link) => (
                            <a
                                key={link.title}
                                title={link.title}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-gray-600 transition-all duration-500 hover:text-indigo-600"
                                aria-label={link.ariaLabel}
                            >
                                <i className={link.iconClass}></i>
                            </a>
                        ))}
                    </div> */}
                    <div className='text-center'>
                        <p className="text-sm text-gray-500 text-center block pb-3">
                            ProSocial 2025, Todos los derechos reservados.
                        </p>
                        <p className='text-zinc-700 text-sm'>
                            Sitio web diseñado por
                        </p>
                        <Link href="https://promedia.mx" target="_blank" title="ProMedia" rel="noopener noreferrer">
                            <Image
                                title="ProMedia"
                                src="https://sfsjdyuwttrcgchbsxim.supabase.co/storage/v1/object/public/ProMedia/logo_dark_gray.svg"
                                width={200}
                                height={200}
                                alt="ProMedia"
                                className="h-4 mx-auto inline-block"
                                unoptimized
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
