'use client'
import React from 'react'
import { EventCarousel } from '@/app/components/ui/carousel'

// Tipos más flexibles para diferentes contextos
export type EventType = 'boda' | 'xv' | 'xv años' | '15 años' | 'corporativo'
export type PortfolioVariant = 'default' | 'compact' | 'landing' | 'grid' | 'carousel'

interface PortfolioGalleryProps {
    tipoEvento: EventType
    variant?: PortfolioVariant
    titulo?: string
    descripcion?: string
    showCTA?: boolean
    ctaText?: string
    ctaAction?: () => void
    className?: string
}

export default function PortfolioGallery({
    tipoEvento,
    variant = 'default',
    titulo,
    descripcion,
    showCTA = false,
    ctaText = 'Ver más trabajos',
    ctaAction,
    className = ""
}: PortfolioGalleryProps) {

    const getContenidoPorTipo = () => {
        const isXV = tipoEvento === 'xv' || tipoEvento.toLowerCase().includes('xv') || tipoEvento.toLowerCase().includes('15')
        const isCorporativo = tipoEvento === 'corporativo'

        if (isCorporativo) {
            return {
                titulo: titulo || 'Eventos Corporativos Profesionales',
                descripcion: descripcion || 'Capturamos la esencia profesional de tus eventos empresariales con elegancia y distinción.',
                emoji: '🏢',
                gradiente: 'from-blue-500/20 via-cyan-500/20 to-blue-500/20'
            }
        } else if (isXV) {
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

    // Configuración por variante
    const getVariantStyles = () => {
        switch (variant) {
            case 'compact':
                return {
                    sectionPadding: 'py-8',
                    headerMargin: 'mb-6',
                    titleSize: 'text-xl sm:text-2xl',
                    descriptionSize: 'text-base',
                    showDescription: false
                }
            case 'landing':
                return {
                    sectionPadding: 'py-20',
                    headerMargin: 'mb-16',
                    titleSize: 'text-3xl sm:text-5xl',
                    descriptionSize: 'text-xl',
                    showDescription: true
                }
            default:
                return {
                    sectionPadding: 'py-16',
                    headerMargin: 'mb-12',
                    titleSize: 'text-2xl sm:text-4xl',
                    descriptionSize: 'text-lg',
                    showDescription: true
                }
        }
    }

    const variantStyles = getVariantStyles()

    return (
        <section className={`${variantStyles.sectionPadding} bg-zinc-900 ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className={`text-center ${variantStyles.headerMargin}`}>
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <span className="text-3xl">{contenido.emoji}</span>
                        <h2 className={`${variantStyles.titleSize} font-bold text-zinc-200`}>
                            {contenido.titulo}
                        </h2>
                    </div>

                    {variantStyles.showDescription && (
                        <p className={`${variantStyles.descriptionSize} text-gray-600 max-w-2xl mx-auto leading-relaxed`}>
                            {contenido.descripcion}
                        </p>
                    )}
                </div>

                {/* Carrusel */}
                <div className="relative">
                    <EventCarousel
                        tipoEvento={tipoEvento}
                        className="w-full"
                    />
                </div>

                {/* CTA opcional */}
                {showCTA && (
                    <div className="text-center mt-12">
                        <p className="text-gray-600 mb-6">
                            ¿Te gusta lo que ves? Contáctanos para crear momentos únicos
                        </p>
                        <button
                            onClick={ctaAction}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105"
                        >
                            <span>{ctaText}</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </section>
    )
}
