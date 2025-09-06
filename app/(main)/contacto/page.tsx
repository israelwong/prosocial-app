import React from 'react'
import type { Metadata } from 'next'
import {
  HeroMarketing,
  ServiceSection,
  VideoSection,
  PortfolioGallery,
  TestimonialsCarousel
} from '@/app/components/shared'
import LeadFormMOFU from './components/LeadFormMOFU'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contáctanos para conocer nuestros servicios de fotografía y video profesional. Te ayudamos a crear el evento perfecto.',
  keywords: ['contacto', 'cotización', 'presupuesto', 'fotografía profesional', 'video profesional'],
  openGraph: {
    title: 'Contacto - ProSocial',
    description: 'Contáctanos para conocer nuestros servicios de fotografía y video profesional.',
  },
}

interface ContactoPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ContactoPage({ searchParams }: ContactoPageProps) {
  const params = await searchParams
  const ref = params.ref as string | undefined

  // Contenido dinámico basado en la referencia
  const getHeroContent = () => {
    switch (ref) {
      case 'fifteens':
        return {
          titulo: "¡Tu Celebración de XV Años te Espera!",
          subtitulo: "Capturamos cada momento especial de tu quinceañera",
          descripcion: "Especialistas en XV años con más de 10 años de experiencia. Fotografía y video profesional para que este día sea perfecto y memorable.",
          overlayGradient: "from-purple-900/10 via-transparent to-pink-900/20"
        }
      case 'weddings':
        return {
          titulo: "¡Tu Boda Perfecta te Espera!",
          subtitulo: "Documentamos tu historia de amor de manera única",
          descripcion: "Especialistas en bodas con más de 10 años de experiencia. Fotografía y video profesional para que tu día especial sea perfecto y memorable.",
          overlayGradient: "from-blue-900/10 via-transparent to-purple-900/20"
        }
      default:
        return {
          titulo: "¿Listo para capturar momentos únicos?",
          subtitulo: "Contáctanos y hagamos realidad la fotografía de tus sueños",
          descripcion: "Especialistas en bodas, XV años y eventos corporativos con más de 10 años de experiencia. Te ayudamos a crear recuerdos que durarán para siempre.",
          overlayGradient: "from-blue-900/10 via-transparent to-purple-900/20"
        }
    }
  }

  const heroContent = getHeroContent()

  return (
    <div className="min-h-screen">
      {/* Hero Section con variant landing */}
      <HeroMarketing
        variant="landing"
        titulo={heroContent.titulo}
        subtitulo={heroContent.subtitulo}
        descripcion={heroContent.descripcion}
        overlayGradient={heroContent.overlayGradient}
        showScrollIndicator={true}
      />

      {/* Formulario MOFU */}
      <section className="py-16 bg-zinc-900">
        <div className="container mx-auto px-4">
          <LeadFormMOFU ref={ref} />
        </div>
      </section>

      {/* Sección de Portfolio - Solo para referencia genérica */}
      {!ref && (
        <>
          <section className="py-16 bg-zinc-900">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Nuestro Trabajo Habla por Sí Solo
                </h2>
                <p className="text-zinc-400 max-w-2xl mx-auto">
                  Explora nuestra galería y descubre el estilo que mejor se adapte a tu evento especial
                </p>
              </div>

              {/* Galería de Bodas */}
              <div className="mb-16">
                <PortfolioGallery
                  tipoEvento="boda"
                  variant="grid"
                  titulo="Bodas"
                  descripcion="Momentos únicos e irrepetibles capturados con elegancia y profesionalismo"
                  imagenes={[
                    'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/porfatolio/1.jpg',
                    'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/porfatolio/2.jpg',
                    'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/porfatolio/3.jpg'
                  ]}
                />
              </div>

              {/* Galería de XV Años */}
              <div className="mb-16">
                <PortfolioGallery
                  tipoEvento="xv"
                  variant="carousel"
                  titulo="XV Años"
                  descripcion="Celebraciones llenas de alegría y tradición, documentadas con el mejor estilo"
                  imagenes={[
                    'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/porfatolio/6.jpg',
                    'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/porfatolio/7.jpg',
                    'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/porfatolio/8.jpg'
                  ]}
                />
              </div>
            </div>
          </section>

          {/* Sección de Testimonios */}
          <section className="py-16 bg-zinc-800">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Lo que Dicen Nuestros Clientes
                </h2>
                <p className="text-zinc-400">
                  La satisfacción de nuestros clientes es nuestra mejor carta de presentación
                </p>
              </div>

              <TestimonialsCarousel
                variant="centered"
                autoplay={true}
              />
            </div>
          </section>
        </>
      )}

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-r from-purple-900 to-blue-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para Comenzar?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            No esperes más para crear recuerdos únicos. Contáctanos hoy mismo y comencemos a planificar la fotografía perfecta para tu evento.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/5215512345678"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              📱 WhatsApp
            </a>
            <a
              href="tel:+525512345678"
              className="bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              📞 Llamar Ahora
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}