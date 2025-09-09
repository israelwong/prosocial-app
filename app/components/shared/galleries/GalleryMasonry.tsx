'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { MasonryPhotoAlbum, RenderImageProps, RenderImageContext } from "react-photo-album"
import Lightbox from "yet-another-react-lightbox"
import "react-photo-album/masonry.css"
import "yet-another-react-lightbox/styles.css"

export interface MasonryPhoto {
    src: string
    width: number
    height: number
    alt?: string
}

interface GalleryMasonryProps {
    imagenes: string[] | MasonryPhoto[]
    columns?: number
    spacing?: number
    className?: string
    alt?: string
    // Props para container-agnostic behavior
    noPadding?: boolean
    lightPadding?: boolean
    // Props para header (opcional)
    titulo?: string
    descripcion?: string
    emoji?: string
    // Props para lightbox
    enableLightbox?: boolean
    lightboxClassName?: string
}

export default function GalleryMasonry({
    imagenes,
    columns = 3,
    spacing = 8,
    className = '',
    alt = 'Imagen de galería',
    noPadding = false,
    lightPadding = false,
    titulo,
    descripcion,
    emoji,
    enableLightbox = true,
    lightboxClassName = ''
}: GalleryMasonryProps) {

    // Estado del lightbox
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [lightboxIndex, setLightboxIndex] = useState(0)

    // Custom render function para Next.js Image con masonry
    const renderNextImage = (
        { alt: imageAlt = "", title, sizes }: RenderImageProps,
        { photo, width, height, index }: RenderImageContext
    ) => {
        const handleImageClick = () => {
            if (enableLightbox) {
                setLightboxIndex(index || 0)
                setLightboxOpen(true)
            }
        }

        return (
            <div
                style={{
                    width: "100%",
                    position: "relative",
                    aspectRatio: `${width} / ${height}`,
                }}
                className={`overflow-hidden rounded-lg bg-zinc-800 hover:shadow-xl transition-all duration-300 ${enableLightbox ? 'cursor-pointer' : ''}`}
                onClick={handleImageClick}
            >
                <Image
                    fill
                    src={photo.src}
                    alt={imageAlt}
                    title={title}
                    sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    style={{ objectFit: 'cover' }}
                />
                {enableLightbox && (
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                        <div className="opacity-0 hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // Función para convertir string[] a MasonryPhoto[]
    const preparePhotos = (): MasonryPhoto[] => {
        if (imagenes.length === 0) return []

        // Si ya son objetos MasonryPhoto, devolverlos tal como están
        if (typeof imagenes[0] === 'object' && 'src' in imagenes[0]) {
            return imagenes as MasonryPhoto[]
        }

        // Si son strings, convertir a MasonryPhoto con dimensiones estimadas
        return (imagenes as string[]).map((src, index) => {
            // Generar dimensiones variables para efecto masonry natural
            const aspectRatios = [
                { width: 400, height: 600 }, // Portrait
                { width: 600, height: 400 }, // Landscape  
                { width: 400, height: 500 }, // Tall
                { width: 500, height: 400 }, // Wide
                { width: 400, height: 700 }, // Very tall
                { width: 700, height: 400 }, // Very wide
                { width: 400, height: 400 }, // Square
            ]

            const ratio = aspectRatios[index % aspectRatios.length]

            return {
                src,
                width: ratio.width,
                height: ratio.height,
                alt: `${alt} ${index + 1}`
            }
        })
    }

    const photos = preparePhotos()

    // Control de padding
    const getPaddingClasses = () => {
        if (noPadding) return ''
        if (lightPadding) return 'py-4'
        return 'py-8'
    }

    const getContainerClasses = () => {
        if (noPadding) return 'w-full'
        return 'max-w-7xl mx-auto px-2 sm:px-4 lg:px-6'
    }

    // Validación temprana
    if (!photos.length) {
        const errorPadding = getPaddingClasses()
        const errorContainer = getContainerClasses()

        return (
            <section className={`${errorPadding} bg-zinc-900 ${className}`}>
                <div className={errorContainer}>
                    <div className="bg-zinc-800 rounded-lg p-4 text-center">
                        <p className="text-zinc-400 text-lg">No hay imágenes disponibles para mostrar</p>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className={`${getPaddingClasses()} ${className}`}>
            <div className={getContainerClasses()}>
                {/* Header opcional */}
                {(titulo || descripcion || emoji) && (
                    <div className="text-center mb-8">
                        {(titulo || emoji) && (
                            <div className="flex items-center justify-center gap-3 mb-4">
                                {emoji && <span className="text-3xl">{emoji}</span>}
                                {titulo && (
                                    <h2 className="text-2xl sm:text-3xl font-bold text-zinc-200">
                                        {titulo}
                                    </h2>
                                )}
                            </div>
                        )}

                        {descripcion && (
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                                {descripcion}
                            </p>
                        )}
                    </div>
                )}

                {/* Masonry Album */}
                <div className="masonry-container">
                    <MasonryPhotoAlbum
                        photos={photos}
                        columns={(breakpoint) => {
                            if (breakpoint < 640) return 1
                            if (breakpoint < 1024) return 2
                            return columns
                        }}
                        spacing={spacing}
                        render={{ image: renderNextImage }}
                        defaultContainerWidth={1200}
                        sizes={{
                            size: "1168px",
                            sizes: [
                                { viewport: "(max-width: 768px)", size: "100vw" },
                                { viewport: "(max-width: 1200px)", size: "50vw" },
                            ],
                        }}
                    />
                </div>
            </div>

            {/* Lightbox */}
            {enableLightbox && (
                <Lightbox
                    open={lightboxOpen}
                    close={() => setLightboxOpen(false)}
                    index={lightboxIndex}
                    slides={photos.map((photo) => ({
                        src: photo.src,
                        alt: photo.alt,
                        width: photo.width,
                        height: photo.height
                    }))}
                    className={lightboxClassName}
                    carousel={{
                        finite: false,
                        preload: 2
                    }}
                    animation={{
                        fade: 300,
                        swipe: 500
                    }}
                    controller={{
                        closeOnPullDown: true,
                        closeOnBackdropClick: true
                    }}
                />
            )}
        </section>
    )
}
