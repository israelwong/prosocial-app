// GalleryGrid Usage Examples
// Este archivo muestra ejemplos de uso del nuevo componente GalleryGrid

import React from 'react'
import { GalleryGrid } from '@/app/components/shared/galleries'

export default function GalleryGridExamples() {
    const handleCTA = () => {
        console.log('CTA clicked!')
    }

    return (
        <div className="space-y-16">
            {/* Ejemplo 1: Grid por defecto */}
            <GalleryGrid
                tipoEvento="boda"
                variant="grid"
                titulo="Galería de Bodas"
                descripcion="Momentos únicos capturados con profesionalismo"
                columns={3}
                gap="md"
                showCTA
                ctaAction={handleCTA}
            />

            {/* Ejemplo 2: Full width con más columnas */}
            <GalleryGrid
                tipoEvento="xv"
                variant="fullwidth"
                titulo="XV Años - Galería Completa"
                descripcion="Una celebración mágica en cada imagen"
                columns={5}
                gap="sm"
            />

            {/* Ejemplo 3: Slider en lugar de grid */}
            <GalleryGrid
                tipoEvento="corporativo"
                variant="slider"
                titulo="Eventos Corporativos"
                descripcion="Profesionalismo y elegancia en cada evento"
            />

            {/* Ejemplo 4: Compacto para secciones pequeñas */}
            <GalleryGrid
                tipoEvento="boda"
                variant="compact"
                columns={2}
                gap="lg"
            />

            {/* Ejemplo 5: Landing page con CTA personalizado */}
            <GalleryGrid
                tipoEvento="boda"
                variant="landing"
                titulo="Nuestro Mejor Trabajo"
                descripcion="Descubre por qué somos la opción preferida de las parejas"
                columns={4}
                gap="md"
                showCTA
                ctaText="Ver Portafolio Completo"
                ctaAction={handleCTA}
            />
        </div>
    )
}
