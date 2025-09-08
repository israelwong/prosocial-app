import React from 'react'
import type { Metadata } from 'next'
import Testimonios from '@/app/components/main/Testimonios'
import LeadFormMOFU from './components/LeadFormMOFU'
import CTASection from '@/app/components/main/CTASection'
import { ContactHero } from '@/app/components/shared/heroes'

export const metadata: Metadata = {
  title: 'Contáctanos Hoy Mismo - ProSocial',
  description: 'Nos emociona saber que nos estás considerando para cubrir tu evento. Verificamos disponibilidad y te enviamos nuestros paquetes personalizados.',
  keywords: ['contacto', 'cotización', 'disponibilidad', 'paquetes', 'fotografía profesional', 'video profesional'],
  openGraph: {
    title: 'Contáctanos Hoy Mismo - ProSocial',
    description: 'Verificamos disponibilidad para tu fecha y te enviamos nuestros paquetes personalizados.',
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
          evento: "XV Años",
          titulo: "¡Tu Celebración de XV Años te Espera!",
          descripcion: "Especialistas en quinceañeras con más de 10 años de experiencia. Capturamos cada momento especial de esta fecha única.",
          gradientFrom: "from-purple-600",
          gradientTo: "to-pink-600"
        }
      case 'weddings':
        return {
          evento: "Bodas",
          titulo: "¡Tu Boda Perfecta te Espera!",
          descripcion: "Especialistas en bodas con más de 10 años de experiencia. Documentamos tu historia de amor de manera única.",
          gradientFrom: "from-blue-600",
          gradientTo: "to-purple-600"
        }
      default:
        return {
          evento: "Eventos",
          titulo: "Contáctanos Hoy Mismo",
          descripcion: "Nos emociona saber que nos estás considerando para cubrir tu evento. Especialistas en bodas, XV años y eventos corporativos.",
          gradientFrom: "from-purple-600",
          gradientTo: "to-blue-600"
        }
    }
  }

  const heroContent = getHeroContent()

  return (
    <div className="min-h-screen bg-black">

      {/* Hero Section */}
      <ContactHero
        evento={heroContent.evento}
        titulo={heroContent.titulo}
        descripcion={heroContent.descripcion}
        gradientFrom={heroContent.gradientFrom}
        gradientTo={heroContent.gradientTo}
        showScrollIndicator={true}
      />

      {/* Lead Form Section */}
      <section className="py-20 bg-zinc-900 relative">
        {/* Background accent */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800/20 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <LeadFormMOFU refSource={ref} />
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonios />

      {/* CTA Final - Componente reutilizable */}
      <CTASection
        badge="✨ Listo para Comenzar"
        title="Estamos Aquí Para Ti"
        description="No esperes más para crear recuerdos únicos. Contáctanos ahora y comencemos a planificar la cobertura perfecta para tu evento."
        whatsappNumber="5215512345678"
        phoneNumber="+525512345678"
        whatsappText="WhatsApp Directo"
        phoneText="Llamar Ahora"
        additionalInfo="Respuesta inmediata • Disponibilidad en tiempo real • Paquetes personalizados"
        variant="purple"
      />
    </div>
  )
}