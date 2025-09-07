// GalleryGrid Usage Examples
// Este archivo muestra ejemplos de uso del nuevo componente GalleryGrid

import React from 'react'
import { GalleryGrid } from '@/app/components/shared/galleries'

interface GalleryGridExamplesProps {
    // Props para personalizar las imágenes
    imagenesBoda?: string[]
    imagenesXV?: string[]
    imagenesCorporativo?: string[]
    // Props para configuración general
    onCTAClick?: () => void
    showAllExamples?: boolean
    className?: string
}

export default function GalleryGridExamples({
    imagenesBoda = [],
    imagenesXV = [],
    imagenesCorporativo = [],
    onCTAClick,
    showAllExamples = true,
    className = ""
}: GalleryGridExamplesProps) {

    const handleCTA = () => {
        if (onCTAClick) {
            onCTAClick()
        } else {
            console.log('CTA clicked!')
        }
    }

    return (
        <div className={`space-y-16 ${className}`}>
            {/* Ejemplo 1: Grid por defecto */}
            <GalleryGrid
                tipoEvento="boda"
                variant="grid"
                titulo="Galería de Bodas"
                descripcion="Momentos únicos capturados con profesionalismo"
                imagenes={imagenesBoda}
                columns={3}
                gap="md"
                showCTA
                ctaAction={handleCTA}
            />

            {showAllExamples && (
                <>
                    {/* Ejemplo 2: Full width con más columnas */}
                    <GalleryGrid
                        tipoEvento="xv"
                        variant="fullwidth"
                        titulo="XV Años - Galería Completa"
                        descripcion="Una celebración mágica en cada imagen"
                        imagenes={imagenesXV}
                        columns={5}
                        gap="sm"
                    />

                    {/* Ejemplo 3: Slider en lugar de grid */}
                    <GalleryGrid
                        tipoEvento="corporativo"
                        variant="slider"
                        titulo="Eventos Corporativos"
                        descripcion="Profesionalismo y elegancia en cada evento"
                        imagenes={imagenesCorporativo}
                    />

                    {/* Ejemplo 4: Compacto para secciones pequeñas */}
                    <GalleryGrid
                        tipoEvento="boda"
                        variant="compact"
                        imagenes={imagenesBoda.slice(0, 4)} // Solo mostrar las primeras 4 imágenes
                        columns={2}
                        gap="lg"
                    />

                    {/* Ejemplo 5: Landing page con CTA personalizado */}
                    <GalleryGrid
                        tipoEvento="boda"
                        variant="landing"
                        titulo="Nuestro Mejor Trabajo"
                        descripcion="Descubre por qué somos la opción preferida de las parejas"
                        imagenes={imagenesBoda}
                        columns={4}
                        gap="md"
                        showCTA
                        ctaText="Ver Portafolio Completo"
                        ctaAction={handleCTA}
                    />
                </>
            )}
        </div>
    )
}
