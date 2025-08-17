'use client'
import React from 'react'
import Link from 'next/link'

interface Cotizacion {
    id: string
    nombre: string
    precio: number
}

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
    cotizaciones: Cotizacion[]
    eventoId: string
    evento: Evento
}

export default function ListaCotizaciones({ cotizaciones, eventoId, evento }: Props) {
    const formatearPrecio = (precio: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0
        }).format(precio)
    }

    const getColorForIndex = (index: number) => {
        const colores = [
            'border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20', // Púrpura
            'border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20', // Violeta
            'border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20', // Índigo
            'border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20', // Azul
            'border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20', // Cian
            'border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20' // Rosa
        ]
        return colores[index % colores.length]
    }

    return (
        <div className="space-y-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center">
                    {cotizaciones.map((cotizacion, index) => (
                        <Link
                            key={cotizacion.id}
                            href={`/evento/${eventoId}/cotizacion/${cotizacion.id}`}
                            className="group block w-full max-w-sm"
                        >
                            <div
                                className={`
                                    relative p-6 rounded-2xl border-2 transition-all duration-300 
                                    transform hover:scale-105 hover:shadow-2xl cursor-pointer
                                    flex flex-col justify-between
                                    ${getColorForIndex(index)}
                                `}
                                style={{ minHeight: '16rem' }}
                            >
                                {/* Etiqueta Paquete personalizado */}
                                {cotizacion.nombre.toLowerCase().includes('personalizado') && (
                                    <span className="absolute top-4 right-4 bg-purple-400 text-purple-900 text-xs font-bold px-3 py-1 rounded-full shadow">
                                        Paquete personalizado
                                    </span>
                                )}

                                {/* Header de la cotización */}
                                <div className="mb-6">
                                    <h4 className="text-xl font-bold text-zinc-300 mb-3 group-hover:text-zinc-100 transition-colors">
                                        {cotizacion.nombre}
                                    </h4>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-white">
                                            {formatearPrecio(cotizacion.precio)}
                                        </span>
                                        <span className="text-sm text-zinc-400 font-medium">
                                            MXN
                                        </span>
                                    </div>
                                </div>

                                {/* Botón minimalista */}
                                <div className="flex justify-center">
                                    <span className="text-purple-200 font-medium px-4 py-2 rounded-lg border border-purple-700 bg-zinc-800 hover:bg-purple-700 hover:text-white transition-colors text-sm">
                                        Ver cotización
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

        </div>
    )
}
