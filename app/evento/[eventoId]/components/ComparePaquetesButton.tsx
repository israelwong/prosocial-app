'use client'

import Link from 'next/link'
import { Scale, ArrowRight } from 'lucide-react'

interface ComparePaquetesButtonProps {
    eventoId: string
    className?: string
    variant?: 'default' | 'hero' | 'minimal'
    showDescription?: boolean
}

export default function ComparePaquetesButton({
    eventoId,
    className = '',
    variant = 'default',
    showDescription = true
}: ComparePaquetesButtonProps) {

    const baseUrl = `/comparador-paquetes?eventoId=${eventoId}`

    // Variante Hero - Botón principal destacado
    if (variant === 'hero') {
        return (
            <div className={`text-center ${className}`}>
                <Link
                    href={baseUrl}
                    className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-base lg:text-lg"
                >
                    <Scale className="w-5 h-5 lg:w-6 lg:h-6" />
                    Compara Paquetes Disponibles
                    <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                        Nuevo
                    </span>
                </Link>
                {showDescription && (
                    <p className="text-zinc-400 text-sm mt-2 max-w-md mx-auto">
                        Compara características, precios y servicios lado a lado para encontrar la opción perfecta
                    </p>
                )}
            </div>
        )
    }

    // Variante Minimal - Versión compacta
    if (variant === 'minimal') {
        return (
            <div className={`border border-zinc-700 rounded-lg p-3 bg-gradient-to-r from-purple-900/20 to-purple-800/20 ${className}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-zinc-400" />
                        <span className="text-sm text-zinc-300">¿Quieres comparar paquetes?</span>
                    </div>
                    <Link
                        href={baseUrl}
                        className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                    >
                        Comparar
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        )
    }

    // Variante Default - Botón estándar
    return (
        <Link href={baseUrl} className={className}>
            <button className="w-full py-3 px-6 rounded-lg font-medium text-white bg-blue-600/80 hover:bg-blue-600 border border-blue-500/50 hover:border-blue-400 transition-all duration-200 flex items-center justify-center gap-2">
                <Scale className="w-5 h-5" />
                Compara Paquetes Disponibles
            </button>
        </Link>
    )
}
