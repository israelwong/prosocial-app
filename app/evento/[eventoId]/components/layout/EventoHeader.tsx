'use client'
import React from 'react'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

interface Props {
    showBackButton?: boolean
    onBack?: () => void
}

export default function EventoHeader({ showBackButton = false, onBack }: Props) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Lado izquierdo: Back button o espacio */}
                    <div className="flex items-center">
                        {showBackButton && (
                            <button
                                onClick={onBack}
                                className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                                aria-label="Volver"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Centro: Logo */}
                    <div className="flex items-center">
                        <Image
                            src="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/logotipo_blanco.svg"
                            width={100}
                            height={32}
                            alt="ProSocial"
                            className="h-7 w-auto"
                            unoptimized
                            priority
                        />
                    </div>

                    {/* Lado derecho: Espacio para acciones futuras */}
                    <div className="w-10 sm:w-12">
                        {/* Reservado para menú hamburguesa o acciones adicionales */}
                    </div>
                </div>
            </div>
        </header>
    )
}
