'use client'
import React from 'react'

interface ServiceSectionProps {
    titulo: string
    descripcion: string
    children: React.ReactNode
    className?: string
    titleGradient?: string
    showSeparator?: boolean
    SeparatorComponent?: React.ComponentType
}

// Componente de separador reutilizable
export const AnimatedSeparator = () => (
    <div className="text-center mx-auto animate-pulse py-6">
        <div className="w-6 h-6 mx-auto text-zinc-400">
            <svg
                className="w-full h-full"
                fill="currentColor"
                viewBox="0 0 24 24"
            >
                <path d="M12 16l-6-6h12l-6 6z" />
            </svg>
        </div>
    </div>
)

export default function ServiceSection({
    titulo,
    descripcion,
    children,
    className = '',
    titleGradient = 'from-pink-500 to-violet-500',
    showSeparator = true,
    SeparatorComponent = AnimatedSeparator
}: ServiceSectionProps) {
    return (
        <>
            <div className={`mb-10 ${className}`}>
                {/* Header con título y descripción */}
                <div className="py-10 px-10 md:max-w-screen-md mx-auto">
                    <div className="mb-4">
                        <h3 className={`bg-clip-text text-transparent bg-gradient-to-r ${titleGradient} font-semibold text-2xl md:text-3xl font-Bebas-Neue`}>
                            {titulo}
                        </h3>
                    </div>
                    <p className="md:text-xl text-md font-light text-slate-200">
                        {descripcion}
                    </p>
                </div>

                {/* Contenido multimedia */}
                <div className="w-full">
                    {children}
                </div>
            </div>

            {/* Separador opcional */}
            {showSeparator && <SeparatorComponent />}
        </>
    )
}
