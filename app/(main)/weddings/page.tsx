'use client'
import React from 'react'
import {
  HeroVideo,
  HeroImage,
  HeroText,
  GalleryGrid,
  ServiceSection,
  VideoSingle
} from '@/app/components/shared'

function WeddingsPage() {
  const handleContact = () => {
    window.open('https://wa.me/5544546582', '_blank')
  }

  const handleQuote = () => {
    window.location.href = '/cotizacion'
  }

  return (
    <>
      {/* Hero Principal con Video */}
      <HeroVideo
        videoSrc="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/video/reels/weddings/reel_boda_2019.mp4"
        title="Tu Día Perfecto"
        subtitle="Bodas de Ensueño"
        description="Inmortalizamos cada momento especial de tu día más importante con profesionalismo y arte"
        buttons={[
          {
            text: "Ver Portafolio",
            href: "/galeria/bodas",
            variant: "primary",
            size: "lg"
          },
          {
            text: "WhatsApp",
            href: "https://wa.me/5544546582",
            variant: "outline",
            size: "lg",
            target: "_blank",
            withBorder: true
          }
        ]}
        overlay={true}
        overlayOpacity={40}
        textAlignment="center"
        autoPlay={true}
        muted={true}
        loop={true}
        controls={false}
        minHeight="min-h-screen"
      />

      {/* Hero con Imagen - Servicios */}
      <HeroImage
        imageSrc="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/boda/1.jpg"
        imageAlt="Boda profesional"
        title="Servicios Completos"
        subtitle="Todo lo que Necesitas"
        description="Desde la sesión de compromiso hasta el gran día, nosotros nos encargamos de todo"
        buttons={[
          {
            text: "Solicitar Cotización",
            onClick: handleQuote,
            variant: "primary",
            size: "xl"
          },
          {
            text: "Ver Paquetes",
            href: "/weddings/paquetes",
            variant: "secondary",
            size: "lg"
          }
        ]}
        overlay={true}
        overlayOpacity={50}
        textAlignment="left"
        imagePosition="center"
        minHeight="min-h-[80vh]"
      />

      {/* Galería de Bodas */}
      <GalleryGrid
        tipoEvento="boda"
        variant="fullwidth"
        titulo="Momentos Inolvidables"
        descripcion="Cada boda cuenta una historia única. Aquí tienes algunos de nuestros trabajos más especiales"
        columns={4}
        gap="md"
        showCTA={true}
        ctaText="Ver Galería Completa"
        ctaAction={() => window.location.href = '/galeria/bodas'}
      />

      {/* Servicios con Video */}
      <ServiceSection
        titulo="Cinematografía de Boda"
        descripcion="Capturamos la esencia de tu historia de amor con la más alta calidad cinematográfica"
        titleGradient="from-rose-500 via-pink-500 to-rose-500"
      >
        <VideoSingle
          src="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/video/reels/weddings/reel_boda_2020.mp4"
          autoPlay={true}
          loop={true}
          muted={true}
          maxWidth="max-w-4xl"
        />
      </ServiceSection>

      {/* Hero Solo Texto - Proceso */}
      <HeroText
        title="Un Proceso Simple"
        subtitle="Cómo Trabajamos"
        description="Desde la primera consulta hasta la entrega final, te acompañamos en cada paso del camino"
        buttons={[
          {
            text: "Conocer Proceso",
            href: "/proceso",
            variant: "gradient",
            size: "lg"
          },
          {
            text: "Agendar Cita",
            onClick: handleContact,
            variant: "outline",
            size: "lg",
            withBorder: true
          }
        ]}
        backgroundVariant="gradient"
        backgroundGradient="from-rose-900 via-pink-900 to-purple-900"
        textAlignment="center"
        pattern="dots"
        patternOpacity={8}
        minHeight="min-h-[70vh]"
      />

      {/* Hero con Imagen - Testimonios */}
      <HeroImage
        imageSrc="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/boda/5.jpg"
        imageAlt="Pareja feliz"
        title="Historias de Amor"
        subtitle="Lo que Dicen Nuestras Parejas"
        description="Más de 100 parejas han confiado en nosotros para capturar su día especial"
        buttons={[
          {
            text: "Leer Testimonios",
            href: "/testimonios",
            variant: "primary",
            size: "lg"
          }
        ]}
        overlay={true}
        overlayOpacity={60}
        textAlignment="right"
        imagePosition="center"
        minHeight="min-h-[60vh]"
      />

      {/* Hero Final - Contacto */}
      <HeroText
        title="¿Listos para Empezar?"
        subtitle="Tu Historia de Amor Merece lo Mejor"
        description="Contáctanos ahora y comencemos a planear la documentación perfecta de tu día especial"
        buttons={[
          {
            text: "5544546582",
            href: "tel:5544546582",
            variant: "primary",
            size: "xl",
            fullWidth: false
          },
          {
            text: "contacto@prosocial.mx",
            href: "mailto:contacto@prosocial.mx",
            variant: "secondary",
            size: "lg",
            fullWidth: false
          },
          {
            text: "WhatsApp",
            href: "https://wa.me/5544546582",
            variant: "ghost",
            size: "lg",
            target: "_blank",
            withBorder: true,
            fullWidth: false
          }
        ]}
        backgroundVariant="solid"
        backgroundColor="bg-gradient-to-br from-zinc-900 to-zinc-800"
        textAlignment="center"
        pattern="grid"
        patternOpacity={5}
        minHeight="min-h-[60vh]"
        contentMaxWidth="max-w-3xl"
      />
    </>
  )
}

export default WeddingsPage
