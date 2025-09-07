'use client'
import React from 'react'
import GalleryGrid from '@/app/components/shared/galleries/GalleryGrid'

interface PortfolioSectionProps {
    tipoEvento: 'boda' | 'xv' | 'xv años' | '15 años'
    imagenes: string[] // Array de URLs de imágenes
    titulo?: string
    descripcion?: string
    className?: string
    // Props opcionales para personalizar la galería
    variant?: 'default' | 'compact' | 'landing' | 'grid' | 'masonry' | 'slider' | 'fullwidth' | 'carousel'
    columns?: 2 | 3 | 4 | 5 | 6
    gap?: 'sm' | 'md' | 'lg'
    showCTA?: boolean
    ctaText?: string
    onCTAClick?: () => void
}

export default function PortfolioSection({
    tipoEvento,
    imagenes,
    titulo,
    descripcion,
    className = "",
    variant = "fullwidth",
    columns = 3,
    gap = "md",
    showCTA = true,
    ctaText,
    onCTAClick
}: PortfolioSectionProps) {

    // Determinar si es XV años o boda para textos por defecto
    const isXV = tipoEvento === 'xv' ||
        tipoEvento === 'xv años' ||
        tipoEvento === '15 años' ||
        tipoEvento.toLowerCase().includes('xv') ||
        tipoEvento.toLowerCase().includes('15')

    // Texto por defecto del CTA si no se proporciona
    const defaultCTAText = ctaText || (isXV ? "Ver más XV Años" : "Ver más Bodas")

    return (
        <GalleryGrid
            tipoEvento={isXV ? 'xv' : 'boda'}
            imagenes={imagenes}
            variant={variant}
            titulo={titulo}
            descripcion={descripcion}
            columns={columns}
            gap={gap}
            showCTA={showCTA}
            ctaText={defaultCTAText}
            ctaAction={onCTAClick}
            className={className}
        />
    )
}
