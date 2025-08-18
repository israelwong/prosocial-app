'use client'
import React from 'react'
import Link from 'next/link'
import { ArrowRight, Package, Sparkles } from 'lucide-react'

interface Paquete {
    id: string
    nombre: string
    precio: number | null
}

interface Props {
    paquete: Paquete
    eventoId: string
    index: number
    isPopular?: boolean
}

export default function PaqueteCard({ paquete, eventoId, index, isPopular = false }: Props) {
    const formatearPrecio = (precio: number | null) => {
        if (!precio) return 'Consulta precio'
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0
        }).format(precio)
    }

    const getPackageType = (nombre: string) => {
        const nombreLower = nombre.toLowerCase()
        if (nombreLower.includes('básico') || nombreLower.includes('bronze')) {
            return {
                type: 'básico',
                icon: '🥉',
                gradient: 'from-amber-500/20 to-yellow-500/20',
                border: 'border-amber-500/40',
                accent: 'text-amber-400'
            }
        }
        if (nombreLower.includes('intermedio') || nombreLower.includes('silver') || nombreLower.includes('plata')) {
            return {
                type: 'intermedio',
                icon: '🥈',
                gradient: 'from-gray-400/20 to-slate-500/20',
                border: 'border-gray-400/40',
                accent: 'text-gray-300'
            }
        }
        if (nombreLower.includes('premium') || nombreLower.includes('gold') || nombreLower.includes('oro') || nombreLower.includes('completo')) {
            return {
                type: 'premium',
                icon: '🥇',
                gradient: 'from-yellow-500/20 to-amber-600/20',
                border: 'border-yellow-500/40',
                accent: 'text-yellow-400'
            }
        }
        return {
            type: 'estándar',
            icon: '📦',
            gradient: 'from-zinc-600/20 to-zinc-700/20',
            border: 'border-zinc-500/40',
            accent: 'text-zinc-400'
        }
    }

    const packageInfo = getPackageType(paquete.nombre)

    return (
        <div className={`
            relative rounded-2xl border-2 p-6 transition-all duration-300 
            bg-gradient-to-br ${packageInfo.gradient} ${packageInfo.border}
            hover:border-white/30 hover:shadow-2xl hover:shadow-black/20
            transform hover:scale-[1.02]
            ${isPopular ? 'ring-2 ring-purple-500/50 ring-offset-2 ring-offset-zinc-900' : ''}
        `}>
            {/* Badge popular */}
            {isPopular && (
                <div className="absolute -top-3 left-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-current" />
                    Más popular
                </div>
            )}

            {/* Tipo de paquete */}
            <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{packageInfo.icon}</span>
                <span className={`text-xs uppercase font-bold tracking-wider ${packageInfo.accent}`}>
                    {packageInfo.type}
                </span>
            </div>

            {/* Nombre del paquete */}
            <h3 className="text-xl font-bold text-white mb-3 leading-tight">
                {paquete.nombre}
            </h3>

            {/* Precio */}
            <div className="mb-6">
                {paquete.precio ? (
                    <div className="flex items-baseline gap-2">
                        <span className={`text-2xl sm:text-3xl font-bold ${packageInfo.accent}`}>
                            {formatearPrecio(paquete.precio)}
                        </span>
                        <span className="text-zinc-400 text-sm">MXN</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-zinc-400" />
                        <span className="text-lg font-semibold text-zinc-300">
                            Consulta precio
                        </span>
                    </div>
                )}
            </div>

            {/* Características del paquete */}
            <div className="mb-6 space-y-2">
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                    <div className={`w-1.5 h-1.5 rounded-full bg-green-400`} />
                    <span>Paquete pre-diseñado</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                    <div className={`w-1.5 h-1.5 rounded-full bg-green-400`} />
                    <span>Servicios incluidos</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                    <div className={`w-1.5 h-1.5 rounded-full bg-green-400`} />
                    <span>Precio fijo</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                    <div className={`w-1.5 h-1.5 rounded-full bg-green-400`} />
                    <span>Disponible inmediatamente</span>
                </div>
            </div>

            {/* Botón de acción */}
            <Link href={`/evento/paquetes/${paquete.id}`}>
                <button className={`
                    w-full py-4 px-6 rounded-xl font-semibold text-white 
                    transition-all duration-200 border-2
                    bg-zinc-700 hover:bg-zinc-600 border-zinc-600 hover:border-zinc-500
                    flex items-center justify-center gap-2
                    shadow-lg hover:shadow-xl
                    transform active:scale-[0.98]
                `}>
                    <span>Ver paquete</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
            </Link>

            {/* Indicador de tipo */}
            <div className="absolute top-4 right-4">
                <div className={`
                    w-8 h-8 rounded-full border-2 ${packageInfo.border}
                    bg-gradient-to-br ${packageInfo.gradient}
                    flex items-center justify-center
                `}>
                    <Package className={`w-4 h-4 ${packageInfo.accent}`} />
                </div>
            </div>
        </div>
    )
}
