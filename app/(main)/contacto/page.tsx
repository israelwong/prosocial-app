import React from 'react'
import type { Metadata } from 'next'
import {
  HeroMarketing,
  ServiceSection,
  VideoSection,
  PortfolioGallery,
  TestimonialsCarousel
} from '@/app/components/shared'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contáctanos para conocer nuestros servicios de fotografía y video profesional. Te ayudamos a crear el evento perfecto.',
  keywords: ['contacto', 'cotización', 'presupuesto', 'fotografía profesional', 'video profesional'],
  openGraph: {
    title: 'Contacto - ProSocial',
    description: 'Contáctanos para conocer nuestros servicios de fotografía y video profesional.',
  },
}

export default function ContactoPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section con variant landing */}
      <HeroMarketing
        variant="landing"
        titulo="¿Listo para capturar momentos únicos?"
        subtitulo="Contáctanos y hagamos realidad la fotografía de tus sueños"
        descripcion="Especialistas en bodas, XV años y eventos corporativos con más de 10 años de experiencia. Te ayudamos a crear recuerdos que durarán para siempre."
        overlayGradient="from-blue-900/10 via-transparent to-purple-900/20"
        showScrollIndicator={true}
      />

      {/* Sección de Portfolio */}
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
                'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/porfatolio/3.jpg',
                'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/porfatolio/4.jpg',
                'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/porfatolio/5.jpg'
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
                'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/porfatolio/8.jpg',
                'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/porfatolio/9.jpg',
                'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/porfatolio/10.jpg'
              ]}
            />
          </div>

        </div>
      </section>

      {/* Formulario de Contacto */}
      <section className="py-16 bg-zinc-950">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¡Hablemos de tu Evento!
            </h2>
            <p className="text-zinc-400">
              Cuéntanos los detalles y te preparamos una cotización personalizada
            </p>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    placeholder="Tu teléfono"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Tipo de evento
                  </label>
                  <select className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-purple-500">
                    <option value="">Selecciona tu evento</option>
                    <option value="boda">Boda</option>
                    <option value="xv">XV Años</option>
                    <option value="corporativo">Evento Corporativo</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Fecha aproximada del evento
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Cuéntanos sobre tu evento
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                  placeholder="Describe tu evento, ubicación, número de invitados, servicios de interés, etc."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Solicitar Cotización Gratuita
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-16 bg-zinc-900">
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