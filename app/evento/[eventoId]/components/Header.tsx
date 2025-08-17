'use client'
import React from 'react'
import Image from 'next/image'

interface Evento {
    id: string
    nombre: string | null
    fecha_evento: Date
    EventoTipo?: {
        nombre: string
    } | null
    Cliente?: {
        nombre: string
    }
}

interface Props {
    evento: Evento
    disponible: boolean
    diasRestantes: number
}

export default function Header({ evento, disponible, diasRestantes }: Props) {
    const fechaEvento = new Date(evento.fecha_evento)

    return (
        <header className="bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 py-6">

                    {/* Logo y branding */}
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                            <Image
                                src="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/logotipo_blanco.svg"
                                width={120}
                                height={40}
                                alt="ProSocial"
                                className="h-8 w-auto"
                                unoptimized
                            />
                        </div>
                    </div>

                    {/* Información del evento */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                        {/* Fecha y disponibilidad */}
                        <div className="flex flex-col gap-2">
                            {/* Estado de disponibilidad */}
                            <div
                                className={`
                                    inline-flex items-center gap-3 px-4 py-1.5 rounded-full text-base font-semibold
                                    ${disponible
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    }
                                `}
                                style={{ minHeight: '40px' }}
                            >
                                <div className={`w-2.5 h-2.5 rounded-full ${disponible ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                <span>
                                    {disponible ? 'Fecha disponible' : 'Fecha no disponible'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
