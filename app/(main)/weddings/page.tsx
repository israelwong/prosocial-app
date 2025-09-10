'use client'
import React from 'react'
import {
  HeroVideo,
  HeroImage,
  HeroText,
  ServiceSection,
  VideoSingle,
  FAQSection,
  Garantias,
  TrustBadges
} from '@/app/components/shared'

import GalleryMasonry from '@/app/components/shared/galleries/GalleryMasonry'

import Entregas from '@/app/components/main/Entregas';
import Testimonios from '@/app/components/main/Testimonios';
import QuoteSection from '@/app/components/main/QuoteSection';
import PorqueNosotros from '@/app/components/main/PorqueNosotros'
import { CTASection, CTAPaquetes, ctaConfigs } from '@/app/components/cta';
import { ArrowRight } from 'lucide-react'

function WeddingsPage() {
  const handleContact = () => {
    window.open('https://wa.me/5544546582', '_blank')
  }

  const handleQuote = () => {
    window.location.href = '/cotizacion'
  }

  // Configuración de imágenes para cada tipo de sesión
  const imagenesConfig = {
    portafolio_1: [
      "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/100.jpg",
      // "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/101.jpg",
      "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/102.jpg",
      "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/103.jpg",
      "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/104.jpg",
      "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/105.jpg",
      "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/106.jpg",
      "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/107.jpg",
      "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/108.jpg",
      "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/109.jpg",
      "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/110.jpg",
      "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/111.jpg",
      "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/112.jpg",
      "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/113.jpg",
      "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/114.jpg",
      "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/115.jpg",
      "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/116.jpg",
      "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/117.jpg",
      "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/118.jpg",
      "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/119.jpg",
      "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/120.jpg",
    ],
    portafolio_2: [
      // 50 al 70
      ...Array.from({ length: 21 }, (_, i) =>
        `https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portafolio/${50 + i}.jpg`
      )
    ]
  }


  return (
    <>
      {/* Hero Principal con Imagen */}
      <HeroImage
        imageSrc="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/portada_1.jpg"
        imageAlt="Boda de ensueño"
        title="Tu Día Perfecto"
        subtitle="Bodas de Ensueño"
        description="Inmortalizamos cada momento especial de tu día más importante con profesionalismo y arte"
        buttons={[
          {
            text: (
              <span className="flex items-center gap-2">
                Ver Paquetes
                <ArrowRight className="w-5 h-5" />
              </span>
            ),
            href: "/contacto?ref=weddings",
            variant: "primary" as const,
            size: "lg" as const
          }
        ]}
        overlay={true}
        overlayOpacity={40}
        textAlignment="center"
        imagePosition="center"
        minHeight="min-h-screen"
      />


      <section>
        <CTAPaquetes
          title="¡Contacta hoy mismo!"
          subtitle="tenemos fechas limitadas."
          buttonText="Ver Paquetes de Boda"
          buttonHref="/contacto?ref=weddings"
          buttonId="btn-contacto-desde-hero-weddings"
          showTopSeparator={true}
          showBottomSeparator={true}
        />
      </section>

      <section>
        <PorqueNosotros />
      </section>

      <section>
        <QuoteSection message="Cuidamos todos los detalles para entregarte los mejores resultados." />
      </section>

      {/* Video de Bodas */}
      <section className="py-16">
        <VideoSingle
          src="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/weddings/reels_evento_2018.mp4"
          autoPlay={true}
          muted={true}
          loop={true}
          maxWidth="max-w-4xl"
          className="px-4"
        />
      </section>


      <section>
        <CTAPaquetes
          title="Reserva tu fecha"
          subtitle="no dejes pasar esta oportunidad."
          buttonText="Ver Paquetes de Boda"
          buttonHref="/contacto?ref=weddings"
          buttonId="btn-contacto-desde-video-weddings"
          showTopSeparator={true}
          showBottomSeparator={true}
        />
      </section>

      {/* Galería de Bodas */}
      <GalleryMasonry
        imagenes={[
          ...imagenesConfig.portafolio_1
        ]} // TODO: Agregar imágenes reales
        fullWidth={true}
        titulo="Momentos Inolvidables"
        descripcion="Cada boda cuenta una historia única. Aquí tienes algunos de nuestros trabajos más especiales"
        columns={4}
        spacing={16}
        enableLightbox={true}
        rounded={true}
      />

      <section>
        <Entregas />
      </section>

      <section>
        <Testimonios />
      </section>


      <section>
        <CTAPaquetes
          title="Reserva tu fecha"
          subtitle="no dejes pasar esta oportunidad."
          buttonText="Ver Paquetes de Boda"
          buttonHref="/contacto?ref=weddings"
          buttonId="btn-contacto-desde-video-weddings"
          showTopSeparator={true}
          showBottomSeparator={true}
        />
      </section>

      {/* Galería de Bodas */}
      <GalleryMasonry
        imagenes={[
          ...imagenesConfig.portafolio_2
        ]} // TODO: Agregar imágenes reales
        fullWidth={true}
        titulo="Momentos Inolvidables"
        descripcion="Cada boda cuenta una historia única. Aquí tienes algunos de nuestros trabajos más especiales"
        columns={4}
        spacing={16}
        enableLightbox={true}
        rounded={true}
      />

      {/* Sección de Preguntas Frecuentes */}
      <FAQSection
        variant="full"
        showCategories={false}
        title="Preguntas Frecuentes"
        subtitle="Resolvemos las dudas más comunes sobre nuestros servicios"
        className="py-24"
      />

      {/* CTA Final Unificado */}
      <CTASection
        {...ctaConfigs.fifteens}
        title="¿Listos para Empezar?"
        description="Ofrecemos paquetes preconfigurados, pero si necesitas algo especial podemos armar un paquete a tu medida."
        additionalInfo="Agenda tu cita virtual gratuita • Consulta paquetes disponibles • Cotización personalizada"
        showAdditionalInfo={true}
      />

      {/* Línea sutil inferior */}
      <div className="relative">
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
      </div>
    </>
  )
}

export default WeddingsPage
