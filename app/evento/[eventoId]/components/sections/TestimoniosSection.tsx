'use client'
import React, { useEffect, useRef } from 'react'
import { Star, Quote } from 'lucide-react'
import Glide from '@glidejs/glide'

interface TestimonioData {
  id: string
  nombre: string
  evento: string
  testimonio: string
  rating: number
  fecha: string
  avatar?: string
}

const testimonios: TestimonioData[] = [
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

// Componente de testimonio individual
const TestimonioCard = ({ testimonio }: { testimonio: TestimonioData }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mx-2">
      {/* Header con avatar y info */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {testimonio.avatar ? (
            <img 
              src={testimonio.avatar} 
              alt={testimonio.nombre}
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                // Fallback si la imagen no carga
                e.currentTarget.style.display = 'none'
                e.currentTarget.parentElement!.innerHTML = testimonio.nombre.charAt(0)
              }}
            />
          ) : (
            testimonio.nombre.charAt(0)
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{testimonio.nombre}</h4>
          <p className="text-sm text-gray-600">{testimonio.evento} • {testimonio.fecha}</p>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < testimonio.rating 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Quote icon */}
      <div className="mb-3">
        <Quote className="w-8 h-8 text-purple-500" />
      </div>

      {/* Testimonio */}
      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
        {testimonio.testimonio}
      </p>

      {/* Línea decorativa */}
      <div className="mt-4 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
    </div>
  )
}

interface TestimoniosSectionProps {
  className?: string
}

export default function TestimoniosSection({ className = "" }: TestimoniosSectionProps) {
  const glideRef = useRef<HTMLDivElement>(null)
  const glideInstanceRef = useRef<Glide | null>(null)

  useEffect(() => {
    if (!glideRef.current) return

    const glideInstance = new Glide(glideRef.current, {
      type: "carousel",
      focusAt: "center",
      perView: 3,
      autoplay: 4000,
      animationDuration: 800,
      gap: 24,
      classes: {
        activeNav: "[&>*]:bg-purple-500",
      },
      breakpoints: {
        1024: { perView: 2, gap: 20 },
        768: { perView: 1.5, gap: 16 },
        640: { perView: 1, gap: 12 }
      },
    })

    glideInstance.mount()
    glideInstanceRef.current = glideInstance

    return () => {
      if (glideInstanceRef.current) {
        glideInstanceRef.current.destroy()
      }
    }
  }, [])

  return (
    <section className={`py-16 px-4 bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Lo que dicen nuestros clientes
            </h2>
            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Testimonios reales de familias que confiaron en nosotros para sus momentos más especiales
          </p>
        </div>

        {/* Carrusel de testimonios */}
        <div className="relative">
          <div ref={glideRef} className="glide-testimonios relative w-full h-fit">
            <div className="overflow-hidden" data-glide-el="track">
              <ul className="whitespace-no-wrap flex-no-wrap [backface-visibility: hidden] [transform-style: preserve-3d] [touch-action: pan-Y] [will-change: transform] relative flex w-full overflow-hidden p-0">
                {testimonios.map((testimonio) => (
                  <li key={testimonio.id} className="glide__slide">
                    <TestimonioCard testimonio={testimonio} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Indicadores de navegación visual */}
          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-gray-100 via-gray-100/50 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-gray-100 via-gray-100/50 to-transparent pointer-events-none z-10" />
        </div>

        {/* Call to action */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            ¿Quieres ser parte de nuestras historias de éxito?
          </p>
          <button className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105">
            <span>Crear mi evento</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
