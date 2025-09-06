'use client'
import React, { useEffect, useRef } from 'react'
import { Star } from 'lucide-react'
import Glide from '@glidejs/glide'

interface TestimonialData {
    id: string
    nombre: string
    evento: string
    testimonio: string
    rating: number
    fecha: string
    avatar?: string
}

interface TestimonialsCarouselProps {
    testimonios?: TestimonialData[]
    className?: string
    showTitle?: boolean
    title?: string
    subtitle?: string
    variant?: 'default' | 'compact' | 'centered'
    autoplay?: boolean | number
    showGradients?: boolean
}

// Datos por defecto - movidos aquí para reutilización
const defaultTestimonios: TestimonialData[] = [
    {
        id: '1',
        nombre: 'María González',
        evento: 'Boda',
        testimonio: 'ProSocial hizo realidad el día más importante de nuestras vidas. Cada detalle fue perfecto, desde la decoración hasta la coordinación. ¡Superaron todas nuestras expectativas!',
        rating: 5,
        fecha: 'Marzo 2024',
        avatar: 'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/testimonios/avatar-1.jpg'
    },
    {
        id: '2',
        nombre: 'Fernanda Martínez',
        evento: 'XV Años',
        testimonio: 'Mi celebración de XV años fue un sueño hecho realidad. El equipo de ProSocial se encargó de todo y mi familia y yo pudimos disfrutar sin preocupaciones. ¡Gracias por tanto!',
        rating: 5,
        fecha: 'Enero 2024',
        avatar: 'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/testimonios/avatar-2.jpg'
    },
    {
        id: '3',
        nombre: 'Carlos y Ana Rodríguez',
        evento: 'Boda',
        testimonio: 'Profesionalismo, calidad y atención al detalle. ProSocial nos ayudó a crear momentos inolvidables. La coordinación fue impecable y nuestros invitados no paran de felicitarnos.',
        rating: 5,
        fecha: 'Febrero 2024',
        avatar: 'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/testimonios/avatar-3.jpg'
    },
    {
        id: '4',
        nombre: 'Isabella Jiménez',
        evento: 'XV Años',
        testimonio: 'Desde el primer día me sentí en las mejores manos. Cada sugerencia fue acertada y el resultado superó mis sueños más grandes. ¡Recomiendo ProSocial al 100%!',
        rating: 5,
        fecha: 'Diciembre 2023',
        avatar: 'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/testimonios/avatar-4.jpg'
    },
    {
        id: '5',
        nombre: 'Familia López',
        evento: 'Bautizo',
        testimonio: 'Una celebración íntima pero llena de detalles especiales. ProSocial entendió perfectamente lo que queríamos y lo ejecutó a la perfección. Estamos muy agradecidos.',
        rating: 5,
        fecha: 'Noviembre 2023',
        avatar: 'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/testimonios/avatar-5.jpg'
    },
    {
        id: '6',
        nombre: 'Patricio Hernández',
        evento: 'Graduación',
        testimonio: 'Mi graduación fue el broche de oro perfecto para mis estudios. La organización, la decoración y todo el ambiente fue exactamente como lo había imaginado. ¡Gracias ProSocial!',
        rating: 5,
        fecha: 'Octubre 2023',
        avatar: 'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/testimonios/avatar-6.jpg'
    }
]

// Componente de testimonio individual con variantes
const TestimonialCard = ({
    testimonio,
    variant = 'default'
}: {
    testimonio: TestimonialData
    variant?: 'default' | 'compact' | 'centered'
}) => {
    const cardClasses = {
        default: "bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mx-2",
        compact: "bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 mx-1",
        centered: "bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 mx-3"
    }

    const textSizes = {
        default: "text-sm sm:text-base",
        compact: "text-xs sm:text-sm",
        centered: "text-base sm:text-lg"
    }

    return (
        <div className={cardClasses[variant]}>
            {/* Header con info del cliente */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                    <h4 className={`font-semibold text-gray-900 ${variant === 'compact' ? 'text-base' : 'text-lg'}`}>
                        {testimonio.nombre}
                    </h4>
                    <p className={`text-gray-600 ${variant === 'compact' ? 'text-xs' : 'text-sm'}`}>
                        {testimonio.evento} • {testimonio.fecha}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`${variant === 'compact' ? 'w-3 h-3' : 'w-4 h-4'} ${i < testimonio.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Testimonio */}
            <p className={`text-gray-700 leading-relaxed ${textSizes[variant]}`}>
                {testimonio.testimonio}
            </p>

            {/* Línea decorativa */}
            <div className="mt-4 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
        </div>
    )
}

export default function TestimonialsCarousel({
    testimonios = defaultTestimonios,
    className = "",
    showTitle = true,
    title = "Lo que dicen nuestros clientes",
    subtitle = "Testimonios reales de familias que confiaron en nosotros para sus momentos más especiales",
    variant = 'default',
    autoplay = 4000,
    showGradients = true
}: TestimonialsCarouselProps) {
    const glideRef = useRef<HTMLDivElement>(null)
    const glideInstanceRef = useRef<Glide | null>(null)

    useEffect(() => {
        if (!glideRef.current) return

        const perViewConfig = {
            default: { xl: 3, lg: 2, md: 1.5, sm: 1 },
            compact: { xl: 4, lg: 3, md: 2, sm: 1 },
            centered: { xl: 2, lg: 1.5, md: 1, sm: 1 }
        }

        const config = perViewConfig[variant]

        const glideInstance = new Glide(glideRef.current, {
            type: "carousel",
            focusAt: "center",
            perView: config.xl,
            autoplay: autoplay === false ? false : (typeof autoplay === 'number' ? autoplay : 4000),
            animationDuration: 800,
            gap: variant === 'compact' ? 16 : 24,
            classes: {
                activeNav: "[&>*]:bg-purple-500",
            },
            breakpoints: {
                1280: { perView: config.xl, gap: variant === 'compact' ? 16 : 24 },
                1024: { perView: config.lg, gap: variant === 'compact' ? 14 : 20 },
                768: { perView: config.md, gap: variant === 'compact' ? 12 : 16 },
                640: { perView: config.sm, gap: variant === 'compact' ? 10 : 12 }
            },
        })

        glideInstance.mount()
        glideInstanceRef.current = glideInstance

        return () => {
            if (glideInstanceRef.current) {
                glideInstanceRef.current.destroy()
            }
        }
    }, [variant, autoplay])

    const sectionClasses = {
        default: "py-16 px-4 bg-gradient-to-br from-gray-50 to-gray-100",
        compact: "py-8 px-4 bg-gray-50",
        centered: "py-20 px-4 bg-gradient-to-br from-gray-50 via-white to-gray-100"
    }

    return (
        <section className={`${sectionClasses[variant]} ${className}`}>
            <div className={`mx-auto ${variant === 'centered' ? 'max-w-6xl' : 'max-w-7xl'}`}>
                {/* Header */}
                {showTitle && (
                    <div className={`text-center ${variant === 'compact' ? 'mb-8' : 'mb-12'}`}>
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Star className={`text-yellow-400 fill-yellow-400 ${variant === 'compact' ? 'w-6 h-6' : 'w-8 h-8'}`} />
                            <h2 className={`font-bold text-gray-900 ${variant === 'compact' ? 'text-2xl sm:text-3xl' :
                                    variant === 'centered' ? 'text-4xl sm:text-5xl' :
                                        'text-3xl sm:text-4xl'
                                }`}>
                                {title}
                            </h2>
                            <Star className={`text-yellow-400 fill-yellow-400 ${variant === 'compact' ? 'w-6 h-6' : 'w-8 h-8'}`} />
                        </div>
                        <p className={`text-gray-600 mx-auto leading-relaxed ${variant === 'compact' ? 'text-base max-w-xl' :
                                variant === 'centered' ? 'text-xl max-w-3xl' :
                                    'text-lg max-w-2xl'
                            }`}>
                            {subtitle}
                        </p>
                    </div>
                )}

                {/* Carrusel de testimonios */}
                <div className="relative">
                    <div ref={glideRef} className="glide-testimonios relative w-full h-fit">
                        <div className="overflow-hidden" data-glide-el="track">
                            <ul className="whitespace-no-wrap flex-no-wrap [backface-visibility: hidden] [transform-style: preserve-3d] [touch-action: pan-Y] [will-change: transform] relative flex w-full overflow-hidden p-0">
                                {testimonios.map((testimonio) => (
                                    <li key={testimonio.id} className="glide__slide">
                                        <TestimonialCard testimonio={testimonio} variant={variant} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Indicadores de navegación visual */}
                    {showGradients && (
                        <>
                            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-gray-100 via-gray-100/50 to-transparent pointer-events-none z-10" />
                            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-gray-100 via-gray-100/50 to-transparent pointer-events-none z-10" />
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}

// Export también del tipo para usar en otros componentes
export type { TestimonialData }
