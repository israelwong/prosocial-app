'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'
export type TextAlignment = 'left' | 'center' | 'right'

interface ButtonConfig {
    text: string
    href?: string
    onClick?: () => void
    variant?: ButtonVariant
    size?: ButtonSize
    target?: '_blank' | '_self'
    fullWidth?: boolean
    withBorder?: boolean
    className?: string
}

interface HeroImageProps {
    imageSrc: string
    imageAlt: string
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
    imagePosition?: 'top' | 'center' | 'bottom'
    imageClassName?: string
    imagePriority?: boolean
}

export default function HeroImage({
    imageSrc,
    imageAlt = 'Hero image',
    title,
    subtitle,
    description,
    buttons = [],
    overlay = true,
    overlayOpacity = 50,
    textAlignment = 'center',
    className = '',
    contentMaxWidth = 'max-w-4xl',
    minHeight = 'min-h-screen',
    imagePosition = 'center',
    imagePriority = true
}: HeroImageProps) {

    const getButtonStyles = (button: ButtonConfig) => {
        const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2'

        const variants = {
            primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:scale-105 focus:ring-purple-500',
            secondary: 'bg-zinc-800 text-white hover:bg-zinc-700 focus:ring-zinc-500',
            outline: 'border-2 border-white text-white hover:bg-white hover:text-zinc-900 focus:ring-white',
            ghost: 'text-white hover:bg-white/20 focus:ring-white',
            gradient: 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white hover:shadow-xl hover:scale-105 focus:ring-purple-500'
        }

        const sizes = {
            sm: 'px-4 py-2 text-sm',
            md: 'px-6 py-3 text-base',
            lg: 'px-8 py-4 text-lg',
            xl: 'px-10 py-5 text-xl'
        }

        const borderStyles = button.withBorder ? 'border border-white/30 backdrop-blur-sm' : ''
        const widthStyles = button.fullWidth ? 'w-full' : ''

        return `${baseStyles} ${variants[button.variant || 'primary']} ${sizes[button.size || 'md']} ${borderStyles} ${widthStyles} ${button.className || ''}`
    }

    const textAlignmentClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    }

    const imagePositionClasses = {
        center: 'object-center',
        top: 'object-top',
        bottom: 'object-bottom'
    }

    return (
        <div className={`relative ${minHeight} flex items-center justify-center overflow-hidden ${className}`}>
            {/* Image Background */}
            <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                priority={imagePriority}
                className={`object-cover ${imagePositionClasses[imagePosition]} -z-10`}
                sizes="100vw"
            />

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
                    {title && (
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                            {title}
                        </h1>
                    )}

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
                                button.href ? (
                                    <Link
                                        key={index}
                                        href={button.href}
                                        target={button.target || '_self'}
                                        className={getButtonStyles(button)}
                                        onClick={button.onClick}
                                    >
                                        {button.text}
                                    </Link>
                                ) : (
                                    <button
                                        key={index}
                                        onClick={button.onClick}
                                        className={getButtonStyles(button)}
                                    >
                                        {button.text}
                                    </button>
                                )
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}