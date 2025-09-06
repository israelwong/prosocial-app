'use client'
import React from 'react'
import GuaranteeCard from './GuaranteeCard'
import TrustBadges from './TrustBadges'
import { Guarantee, GuaranteeVariant } from './types'

interface GuaranteesSectionProps {
    variant?: GuaranteeVariant
    title?: string
    subtitle?: string
    guarantees?: Guarantee[]
    showTrustBadges?: boolean
    showCTA?: boolean
    className?: string
    contentMaxWidth?: string
}

const defaultGuarantees: Guarantee[] = [
    {
        id: 'satisfaction',
        title: 'Satisfacción 100% Garantizada',
        description: 'Si no quedas completamente satisfecho con el resultado, reharemos las tomas necesarias sin costo adicional.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        features: [
            'Revisión completa del material',
            'Refilmación gratuita si es necesario',
            'Satisfacción garantizada al 100%',
            'Soporte post-entrega por 30 días'
        ],
        badge: 'Más popular',
        color: 'purple'
    },
    {
        id: 'quality',
        title: 'Calidad Profesional',
        description: 'Utilizamos equipos de última generación y técnicas profesionales para asegurar la máxima calidad en cada proyecto.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
        ),
        features: [
            'Equipos 4K y profesionales',
            'Edición con software especializado',
            'Respaldo triple de archivos',
            'Entrega en múltiples formatos'
        ],
        color: 'blue'
    },
    {
        id: 'timing',
        title: 'Entrega Puntual',
        description: 'Cumplimos religiosamente con los tiempos de entrega acordados. Tu material estará listo cuando lo prometemos.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        features: [
            'Galería preview en 48-72 horas',
            'Material final en tiempo acordado',
            'Notificaciones de progreso',
            'Entrega anticipada cuando sea posible'
        ],
        color: 'green'
    },
    {
        id: 'support',
        title: 'Soporte Continuo',
        description: 'Te acompañamos durante todo el proceso, desde la consulta inicial hasta después de la entrega final.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 110 19.5 9.75 9.75 0 010-19.5" />
            </svg>
        ),
        features: [
            'Consulta inicial gratuita',
            'Comunicación directa con el equipo',
            'Asistencia durante el evento',
            'Soporte post-entrega'
        ],
        color: 'orange'
    }
]

export default function GuaranteesSection({
    variant = 'full',
    title = 'Nuestras Garantías',
    subtitle = 'Trabajamos con la confianza y tranquilidad que mereces para tu evento especial',
    guarantees = defaultGuarantees,
    showTrustBadges = true,
    showCTA = true,
    className = '',
    contentMaxWidth = 'max-w-7xl'
}: GuaranteesSectionProps) {

    // Configuración por variante
    const getVariantStyles = () => {
        switch (variant) {
            case 'compact':
                return {
                    sectionPadding: 'py-12',
                    titleSize: 'text-2xl sm:text-3xl',
                    subtitleSize: 'text-base',
                    showSubtitle: false,
                    gridCols: 'grid-cols-1 md:grid-cols-2',
                    containerClass: 'max-w-4xl mx-auto px-4 sm:px-6'
                }
            case 'inline':
                return {
                    sectionPadding: 'py-16',
                    titleSize: 'text-2xl sm:text-3xl',
                    subtitleSize: 'text-lg',
                    showSubtitle: true,
                    gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
                    containerClass: `${contentMaxWidth} mx-auto px-4 sm:px-6 lg:px-8`
                }
            default: // full
                return {
                    sectionPadding: 'py-20',
                    titleSize: 'text-3xl sm:text-4xl',
                    subtitleSize: 'text-xl',
                    showSubtitle: true,
                    gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
                    containerClass: `${contentMaxWidth} mx-auto px-4 sm:px-6 lg:px-8`
                }
        }
    }

    const variantStyles = getVariantStyles()

    return (
        <section className={`${variantStyles.sectionPadding} bg-gradient-to-br from-zinc-900 to-zinc-800 ${className}`}>
            <div className={variantStyles.containerClass}>
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className={`${variantStyles.titleSize} font-bold text-zinc-100 mb-4`}>
                        {title}
                    </h2>
                    {variantStyles.showSubtitle && subtitle && (
                        <p className={`${variantStyles.subtitleSize} text-zinc-300 max-w-3xl mx-auto leading-relaxed`}>
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Garantías Grid */}
                <div className={`grid ${variantStyles.gridCols} gap-8 mb-16`}>
                    {guarantees.map((guarantee) => (
                        <GuaranteeCard
                            key={guarantee.id}
                            guarantee={guarantee}
                            variant={variant}
                        />
                    ))}
                </div>

                {/* Trust Badges */}
                {showTrustBadges && (
                    <div className="mb-16">
                        <TrustBadges variant={variant} />
                    </div>
                )}

                {/* CTA Section */}
                {showCTA && (
                    <div className="text-center">
                        <div className="bg-zinc-800 rounded-2xl border border-zinc-600 shadow-lg p-8 max-w-2xl mx-auto">
                            <div className="flex items-center justify-center w-16 h-16 bg-zinc-700 rounded-full mx-auto mb-6">
                                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-zinc-100 mb-4">
                                ¿Listo para empezar?
                            </h3>
                            <p className="text-zinc-300 mb-6 leading-relaxed">
                                Agenda una consulta gratuita y descubre cómo podemos hacer realidad la documentación perfecta de tu evento especial.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button className="inline-flex items-center justify-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <span>Consulta Gratuita</span>
                                </button>
                                <button className="inline-flex items-center justify-center gap-2 border-2 border-zinc-500 text-zinc-300 px-8 py-4 rounded-lg font-semibold hover:border-zinc-400 hover:bg-zinc-700 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <span>Ver Portafolio</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
