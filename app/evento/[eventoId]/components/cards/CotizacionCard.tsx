'use client'
import React from 'react'
import Link from 'next/link'
import { ArrowRight, Star, DollarSign } from 'lucide-react'

interface Cotizacion {
    id: string
    nombre: string
    precio: number
    status?: string
}

interface Props {
    cotizacion: Cotizacion
    eventoId: string
    index: number
    isRecommended?: boolean
}

export default function CotizacionCard({ cotizacion, eventoId, index, isRecommended = false }: Props) {
    const formatearPrecio = (precio: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0
        }).format(precio)
    }

    const getColorScheme = (index: number) => {
        const schemes = [
            {
                border: 'border-purple-500/40',
                bg: 'bg-gradient-to-br from-purple-500/10 to-purple-600/5',
                hover: 'hover:border-purple-400/60 hover:from-purple-500/15',
                accent: 'text-purple-400',
                button: 'bg-purple-600 hover:bg-purple-700 border-purple-500'
            },
            {
                border: 'border-blue-500/40',
                bg: 'bg-gradient-to-br from-blue-500/10 to-blue-600/5',
                hover: 'hover:border-blue-400/60 hover:from-blue-500/15',
                accent: 'text-blue-400',
                button: 'bg-blue-600 hover:bg-blue-700 border-blue-500'
            },
            {
                border: 'border-emerald-500/40',
                bg: 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5',
                hover: 'hover:border-emerald-400/60 hover:from-emerald-500/15',
                accent: 'text-emerald-400',
                button: 'bg-emerald-600 hover:bg-emerald-700 border-emerald-500'
            },
            {
                border: 'border-pink-500/40',
                bg: 'bg-gradient-to-br from-pink-500/10 to-pink-600/5',
                hover: 'hover:border-pink-400/60 hover:from-pink-500/15',
                accent: 'text-pink-400',
                button: 'bg-pink-600 hover:bg-pink-700 border-pink-500'
            }
        ]
        return schemes[index % schemes.length]
    }

    const colors = getColorScheme(index)

    return (
        <div className={`
            relative rounded-2xl border-2 p-6 transition-all duration-300 
            ${colors.border} ${colors.bg} ${colors.hover}
            transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/20
        `}>
            {/* Badge recomendado */}
            {isRecommended && (
                <div className="absolute -top-3 left-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Recomendado
                </div>
            )}

            {/* Header de la cotización */}
            <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                    {cotizacion.nombre}
                </h3>

                {/* Precio destacado */}
                <div className="flex items-baseline gap-2">
                    <span className={`text-2xl sm:text-3xl font-bold ${colors.accent}`}>
                        {formatearPrecio(cotizacion.precio)}
                    </span>
                    <span className="text-zinc-400 text-sm">MXN</span>
                </div>
            </div>

            {/* Status si existe */}
            {/* {cotizacion.status && (
                <div className="mb-4">
                    <span className={`
                        inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                        ${cotizacion.status === 'aprobada'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-zinc-700/50 text-zinc-300 border border-zinc-600/30'
                        }
                    `}>
                        {cotizacion.status === 'aprobada' ? '✓ Aprobada' : 'Pendiente'}
                    </span>
                </div>
            )} */}

            {/* Características destacadas */}
            <div className="mb-6 space-y-2">
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                    <div className={`w-1.5 h-1.5 rounded-full ${colors.accent.replace('text-', 'bg-')}`} />
                    <span>Cotización personalizada</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                    <div className={`w-1.5 h-1.5 rounded-full ${colors.accent.replace('text-', 'bg-')}`} />
                    <span>Incluye servicios seleccionados</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                    <div className={`w-1.5 h-1.5 rounded-full ${colors.accent.replace('text-', 'bg-')}`} />
                    <span>Precios especiales</span>
                </div>
            </div>

            {/* Botón de acción */}
            <Link href={`/evento/${eventoId}/cotizacion/${cotizacion.id}`}>
                <button className={`
                    w-full py-4 px-6 rounded-xl font-semibold text-white 
                    transition-all duration-200 border-2
                    ${colors.button}
                    flex items-center justify-center gap-2
                    shadow-lg hover:shadow-xl
                    transform active:scale-[0.98]
                `}>
                    <span>Ver detalles</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
            </Link>

            {/* Decorative element */}
            <div className={`
                absolute top-4 right-4 w-8 h-8 rounded-full 
                ${colors.bg} ${colors.border} border
                flex items-center justify-center
            `}>
                <span className={`text-sm font-bold ${colors.accent}`}>
                    {index + 1}
                </span>
            </div>
        </div>
    )
}
