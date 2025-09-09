'use client'
import React from 'react'
import { Button } from '../ui'
import type { ButtonVariant, ButtonSize } from '../ui'

/**
 * Componente HeroVideo - Refactorizado siguiendo ESTILO_MAESTRO_MAIN.md
 * 
 * Hero con video de fondo y elementos decorativos mejorados
 * 
 * Características aplicadas:
 * - Sistema de colores zinc como estándar con acentos purple-pink
 * - Gradientes purple-pink para elementos destacados
 * - Elementos decorativos sutiles pero pronunciados
 * - Tipografía mejorada con jerarquía clara
 * - Efectos de profundidad y separación visual
 */

export type TextAlignment = 'left' | 'center' | 'right'

interface ButtonConfig {
    text: React.ReactNode
    href?: string
    onClick?: () => void
    variant?: ButtonVariant
    size?: ButtonSize
    target?: '_blank' | '_self'
    fullWidth?: boolean
    withBorder?: boolean
    className?: string
}

interface HeroVideoProps {
    videoSrc: string
    videoPoster?: string
    autoPlay?: boolean
    loop?: boolean
    muted?: boolean
    controls?: boolean
    title?: string
    subtitle?: string
    description?: string
    buttons?: ButtonConfig[]
    overlay?: boolean
    overlayOpacity?: number
    textAlignment?: TextAlignment
    className?: string
    contentMaxWidth?: string
    minHeight?: string
    /** Mostrar elementos decorativos */
    showDecorative?: boolean
    /** Tamaño de los elementos decorativos */
    decorativeSize?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function HeroVideo({
    videoSrc,
    videoPoster,
    title,
    subtitle,
    description,
    buttons = [],
    overlay = true,
    overlayOpacity = 50,
    textAlignment = 'center',
    autoPlay = true,
    muted = true,
    loop = true,
    controls = false,
    className = '',
    contentMaxWidth = 'max-w-4xl',
    minHeight = 'min-h-screen'
}: HeroVideoProps) {

    const textAlignmentClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    }

    return (
        <div className={`relative ${minHeight} flex items-center justify-center overflow-hidden ${className}`}>
            {/* Video Background */}
            <video
                className="absolute inset-0 w-full h-full object-cover -z-10"
                autoPlay={autoPlay}
                muted={muted}
                loop={loop}
                controls={controls}
                poster={videoPoster}
            >
                <source src={videoSrc} type="video/mp4" />
                Tu navegador no soporta el elemento video.
            </video>

            {/* Elementos decorativos de fondo */}
            <div className="absolute inset-0 -z-5 overflow-hidden">
                {/* Gradient overlay principal */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-pink-900/30"></div>

                {/* Círculos decorativos */}
                <div className="absolute top-1/4 -left-32 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-gradient-to-br from-fuchsia-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>

                {/* Líneas decorativas */}
                <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-400/20 to-transparent"></div>
                <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-pink-400/20 to-transparent"></div>

                {/* Elementos geométricos */}
                <div className="absolute top-1/3 left-1/6 w-4 h-4 bg-gradient-to-br from-purple-400/40 to-pink-400/40 rotate-45 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-1/3 right-1/6 w-6 h-6 bg-gradient-to-br from-pink-400/40 to-purple-400/40 rotate-45 animate-pulse" style={{ animationDelay: '3s' }}></div>
                <div className="absolute top-2/3 left-3/4 w-8 h-8 border border-fuchsia-400/30 rotate-45 animate-pulse" style={{ animationDelay: '5s' }}></div>
            </div>

            {/* Overlay */}
            {overlay && (
                <div
                    className={`absolute inset-0 bg-black/${overlayOpacity} -z-5`}
                />
            )}

            {/* Content */}
            <div className={`relative z-10 px-4 sm:px-6 lg:px-8 ${contentMaxWidth} mx-auto w-full`}>
                <div className={textAlignmentClasses[textAlignment]}>
                    {/* Subtitle */}
                    {subtitle && (
                        <p className="text-lg sm:text-xl md:text-2xl text-pink-400 font-medium mb-4">
                            {subtitle}
                        </p>
                    )}

                    {/* Title */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                        {title}
                    </h1>

                    {/* Description */}
                    {description && (
                        <p className="text-xl sm:text-2xl md:text-3xl text-zinc-300 mb-8 leading-relaxed max-w-3xl mx-auto">
                            {description}
                        </p>
                    )}

                    {/* Buttons */}
                    {buttons.length > 0 && (
                        <div className={`flex flex-col sm:flex-row gap-4 ${textAlignment === 'center' ? 'justify-center' : textAlignment === 'right' ? 'justify-end' : 'justify-start'}`}>
                            {buttons.map((button, index) => (
                                <Button
                                    key={index}
                                    variant={button.variant}
                                    size={button.size}
                                    href={button.href}
                                    target={button.target}
                                    onClick={button.onClick}
                                    fullWidth={button.fullWidth}
                                    withBorder={button.withBorder}
                                    className={button.className}
                                >
                                    {button.text}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
