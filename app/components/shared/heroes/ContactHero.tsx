'use client'
import React from 'react'

interface ContactHeroProps {
    evento?: string
    titulo?: string
    descripcion?: string
    gradientFrom?: string
    gradientTo?: string
    showScrollIndicator?: boolean
    className?: string
}

export default function ContactHero({
    evento = "Eventos",
    titulo = "Contáctanos Hoy Mismo",
    descripcion = "Nos emociona saber que nos estás considerando para cubrir tu evento. Especialistas en bodas, XV años y eventos corporativos.",
    gradientFrom = "from-purple-600",
    gradientTo = "to-blue-600",
    showScrollIndicator = true,
    className = ""
}: ContactHeroProps) {
    return (
        <section className={`relative min-h-screen flex items-center justify-center px-4 ${className}`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 to-black">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.1),transparent_50%)]" />
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto text-center">
                {/* Badge */}
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700 mb-8">
                    <span className="text-zinc-400 text-sm font-medium">
                        Especialistas en {evento}
                    </span>
                </div>

                {/* Main Title */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                    {titulo}
                </h1>

                {/* Description */}
                <p className="text-xl md:text-2xl text-zinc-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                    {descripcion}
                </p>

                {/* Call to Action Text */}
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 mb-12 max-w-2xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        ¿Quieres conocer nuestros paquetes?
                    </h2>
                    <p className="text-zinc-400 text-lg">
                        Antes de continuar, veamos si tenemos disponible la fecha para cubrir tu evento
                    </p>
                </div>

                {/* Scroll Indicator */}
                {showScrollIndicator && (
                    <div className="flex flex-col items-center animate-bounce">
                        <span className="text-zinc-500 text-sm mb-2">Verificar disponibilidad</span>
                        <div className="w-6 h-10 border-2 border-zinc-600 rounded-full flex justify-center">
                            <div className="w-1 h-3 bg-zinc-600 rounded-full mt-2 animate-pulse"></div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
