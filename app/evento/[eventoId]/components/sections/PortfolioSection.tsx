'use client'
import React from 'react'
import { EventCarousel } from '@/app/components/ui/carousel'

interface PortfolioSectionProps {
    tipoEvento: 'boda' | 'xv' | 'xv años' | '15 años'
    titulo?: string
    descripcion?: string
    className?: string
}

export default function PortfolioSection({
    tipoEvento,
    titulo,
    descripcion,
    className = ""
}: PortfolioSectionProps) {

    const getContenidoPorTipo = () => {
        const isXV = tipoEvento === 'xv' || tipoEvento.toLowerCase().includes('xv') || tipoEvento.toLowerCase().includes('15')

        if (isXV) {
            return {
                titulo: titulo || 'Momentos únicos de XV Años',
                descripcion: descripcion || 'Capturamos la magia de tu celebración de quince años con elegancia y estilo único.',
                emoji: '👑',
                gradiente: 'from-pink-500/20 via-purple-500/20 to-pink-500/20'
            }
        } else {
            return {
                titulo: titulo || 'Momentos inolvidables de Boda',
                descripcion: descripcion || 'Inmortalizamos cada momento especial de tu día más importante con profesionalismo y arte.',
                emoji: '💍',
                gradiente: 'from-rose-500/20 via-pink-500/20 to-rose-500/20'
            }
        }
    }

    const contenido = getContenidoPorTipo()

    return (
        <section className={`py-16 bg-zinc-900`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <h2 className="text-2xl sm:text-4xl font-bold text-zinc-200">
                            {contenido.titulo}
                        </h2>
                    </div>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        {contenido.descripcion}
                    </p>
                </div>

                {/* Carrusel */}
                <div className="relative">
                    <EventCarousel
                        tipoEvento={tipoEvento}
                        className="w-full"
                    />

                    {/* Indicadores de navegación visual */}
                    {/* <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white via-white/50 to-transparent pointer-events-none z-10" />
                    <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white via-white/50 to-transparent pointer-events-none z-10" /> */}
                </div>

                {/* CTA opcional */}
                {/* <div className="text-center mt-12">
                    <p className="text-gray-600 mb-6">
                        ¿Te gusta lo que ves? Contactanos para crear momentos únicos
                    </p>
                    <button className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105">
                        <span>Ver más trabajos</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div> */}
            </div>
        </section>
    )
}
