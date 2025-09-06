'use client'
import React from 'react'
import Image from 'next/image'
import { EventCarousel } from '@/app/components/ui/carousel'
import GallerySlider from './GallerySlider'

// Tipos más flexibles para diferentes contextos
export type EventType = 'boda' | 'xv' | 'xv años' | '15 años' | 'corporativo'
export type GalleryVariant = 'default' | 'compact' | 'landing' | 'grid' | 'masonry' | 'slider' | 'fullwidth' | 'carousel'

interface GalleryGridProps {
    tipoEvento?: EventType
    variant?: GalleryVariant
    titulo?: string
    descripcion?: string
    imagenes?: string[] // Nueva prop para imágenes personalizadas
    showCTA?: boolean
    ctaText?: string
    ctaAction?: () => void
    className?: string
    columns?: 2 | 3 | 4 | 5 | 6 // Columnas configurables
    gap?: 'sm' | 'md' | 'lg' // Espaciado configurable
}

export default function GalleryGrid({
    tipoEvento = 'boda',
    variant = 'grid',
    titulo,
    descripcion,
    imagenes = [],
    showCTA = false,
    ctaText = 'Ver más trabajos',
    ctaAction,
    className = "",
    columns = 3,
    gap = 'md'
}: GalleryGridProps) {

    // Imágenes de demostración por defecto si no se proporcionan
    const defaultImages = [
        '/images/galeria/boda-1.jpg',
        '/images/galeria/boda-2.jpg',
        '/images/galeria/boda-3.jpg',
        '/images/galeria/boda-4.jpg',
        '/images/galeria/boda-5.jpg',
        '/images/galeria/boda-6.jpg',
        '/images/galeria/boda-7.jpg',
        '/images/galeria/boda-8.jpg',
        '/images/galeria/boda-9.jpg',
        '/images/galeria/boda-10.jpg',
        '/images/galeria/boda-11.jpg',
        '/images/galeria/boda-12.jpg',
    ]

    const imagenesAMostrar = imagenes.length > 0 ? imagenes : defaultImages

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
                    showDescription: false,
                    containerClass: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'
                }
            case 'landing':
                return {
                    sectionPadding: 'py-20',
                    headerMargin: 'mb-16',
                    titleSize: 'text-3xl sm:text-5xl',
                    descriptionSize: 'text-xl',
                    showDescription: true,
                    containerClass: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
                }
            case 'fullwidth':
                return {
                    sectionPadding: 'py-16',
                    headerMargin: 'mb-12',
                    titleSize: 'text-2xl sm:text-4xl',
                    descriptionSize: 'text-lg',
                    showDescription: true,
                    containerClass: 'w-full px-4 sm:px-6 lg:px-8' // Sin max-width para full width
                }
            default:
                return {
                    sectionPadding: 'py-16',
                    headerMargin: 'mb-12',
                    titleSize: 'text-2xl sm:text-4xl',
                    descriptionSize: 'text-lg',
                    showDescription: true,
                    containerClass: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
                }
        }
    }

    // Configuración de columnas responsivas
    const getGridStyles = () => {
        const gapStyles = {
            sm: 'gap-2',
            md: 'gap-4',
            lg: 'gap-6'
        }

        const columnStyles = {
            2: 'grid-cols-1 sm:grid-cols-2',
            3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
            4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
            5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
            6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6'
        }

        return {
            gridClass: `grid ${columnStyles[columns]} ${gapStyles[gap]}`,
            itemClass: 'group relative overflow-hidden rounded-lg aspect-square bg-zinc-800 transition-all duration-300 hover:scale-105 hover:shadow-xl'
        }
    }

    const variantStyles = getVariantStyles()
    const gridStyles = getGridStyles()

    return (
        <section className={`${variantStyles.sectionPadding} bg-zinc-900 ${className}`}>
            <div className={variantStyles.containerClass}>
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

                {/* Renderizado condicional según variante */}
                <div className="relative">
                    {variant === 'slider' || variant === 'carousel' ? (
                        <GallerySlider
                            imagenes={imagenesAMostrar}
                            variant="multiple"
                            autoplay={3000}
                            perView={3.5}
                            gap={0}
                            className="w-full"
                            alt={contenido.titulo}
                            breakpoints={{
                                1024: { perView: 4 },
                                640: { perView: 1.3 }
                            }}
                        />
                    ) : variant === 'grid' || variant === 'masonry' || variant === 'fullwidth' ? (
                        <div className={gridStyles.gridClass}>
                            {imagenesAMostrar.map((imagen, index) => (
                                <div key={index} className={gridStyles.itemClass}>
                                    <Image
                                        src={imagen}
                                        alt={`${contenido.titulo} - Imagen ${index + 1}`}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        sizes={
                                            variant === 'fullwidth'
                                                ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        }
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EventCarousel
                            tipoEvento={tipoEvento}
                            imagenes={imagenesAMostrar}
                            className="w-full"
                        />
                    )}
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
