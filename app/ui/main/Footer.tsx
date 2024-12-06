import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

function Footer() {
    return (

        <footer className="w-full py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                <div className="max-w-3xl mx-auto">
                    <div className="flex space-x-10 justify-center items-center mb-10">

                        <a
                            title="Facebook"
                            href="https://www.facebook.com/prosocialmx" target="_blank"
                            className="block text-gray-600 transition-all duration-500 hover:text-indigo-600"
                        >
                            <i className="fab fa-facebook-f"></i>
                        </a>

                        <a
                            title="Instagram"
                            href="https://www.instagram.com/prosocialmx" target="_blank"
                            className="block text-gray-600 transition-all duration-500 hover:text-indigo-600"
                        >
                            <i className="fab fa-instagram"></i>
                        </a>

                        <a
                            title="YouTube"
                            href="https://www.youtube.com/@prosocial_fifteens" target="_blank"
                            className="block text-gray-600 transition-all duration-500 hover:text-indigo-600"
                        >
                            <i className="fab fa-youtube"></i>
                        </a>

                        <a
                            title="Tiktok"
                            href="https://www.tiktok.com/@prosocialmx" target="_blank"
                            className="block text-gray-600 transition-all duration-500 hover:text-indigo-600"
                        >
                            <i className="fab fa-tiktok"></i>
                        </a>

                    </div>

                    <div className='text-center'>

                        <p className="text-sm text-gray-500 text-center block pb-3">
                            ProSocial 2024, Todos los derechos reservados.
                        </p>

                        <p className='text-zinc-700 text-sm'>
                            Sitio web diseñado por
                        </p>

                        <Link href="https://promedia.mx" target="_blank" title="ProMedia">
                            <Image
                                title="ProMedia"
                                src="https://sfsjdyuwttrcgchbsxim.supabase.co/storage/v1/object/public/ProMedia/logo_dark_gray.svg"
                                width={200}
                                height={200}
                                alt="ProMedia"
                                className="h-4 mx-auto inline-block"
                            />
                        </Link>
                    </div>

                </div>
            </div>

        </footer>

    )
}

export default Footer
