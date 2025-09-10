import React from 'react'
import type { Metadata } from "next";
import { ArrowRight } from 'lucide-react'
import HeroVideo from '@/app/components/shared/heroes/HeroVideo';
import QuoteSection from '@/app/components/main/QuoteSection';
import PorqueNosotros from '@/app/components/main/PorqueNosotros';
import Servicios from './components/ServiciosRefactorizado';
import Entregas from '@/app/components/main/Entregas';
import Testimonios from '@/app/components/main/Testimonios';
import { FAQSection, TrustBadges, Garantias } from '@/app/components/shared';
import { CTASection, CTAPaquetes, ctaConfigs } from '@/app/components/cta';
// import Galeria from '@/app/components/main/Galeria';

export const metadata: Metadata = {
  title: "XV Años",
  description: "Fotografía y video profesional para XV años. Capturamos cada momento especial de tu celebración con el mejor equipo y experiencia.",
  keywords: ["XV años", "quince años", "fotografía XV años", "video XV años", "celebración", "fiesta"],
  openGraph: {
    title: "XV Años - Fotografía y Video Profesional | ProSocial",
    description: "Especialistas en fotografía y video para XV años. Hacemos de tu celebración un recuerdo inolvidable.",
    images: [
      {
        url: "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/logotipo_blanco.svg",
        width: 1200,
        height: 630,
        alt: "XV Años - ProSocial",
      },
    ],
  },
};

function page() {

  return (
    <div className=''>

      <section>
        <HeroVideo
          videoSrc="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/video/hero-30fps.webm?t=2024-09-28T23%3A53%3A21.149Z"
          title="XV Años Inolvidables"
          subtitle="Fotografía y Video Profesional"
          description="Capturamos la magia de tu celebración de XV años con el mejor equipo profesional y años de experiencia"
          buttons={[
            {
              text: (
                <span className="flex items-center gap-2">
                  Ver Paquetes
                  <ArrowRight className="w-5 h-5" />
                </span>
              ),
              href: "/contacto?ref=fifteen-hero",
              variant: "translucent" as const,
              size: "lg" as const
            },
            {
              text: "Ver Galería",
              href: "/galeria?categoria=xv-anos",
              variant: "outline" as const,
              size: "lg" as const
            }
          ]}
          autoPlay={true}
          muted={true}
          loop={true}
        />
      </section>

      <section>
        <CTAPaquetes
          title="¡Contacta hoy mismo!"
          subtitle="tenemos fechas limitadas."
          buttonText="Ver Paquetes XV Años"
          buttonHref="/contacto?ref=fifteen"
          buttonId="btn-contacto-desde-hero-fifteens"
          showTopSeparator={true}
          showBottomSeparator={true}
        />
        {/* <QuoteSection message="Este momento especial solo se vive una vez, nosotros somos expertos en capturarlo." /> */}
      </section>

      <section>
        <PorqueNosotros />
      </section>

      <section>
        {/* <CTAPaquetes
          title="¡Reserva tu fecha ahora!"
          subtitle="cupos limitados disponibles."
          buttonText="Ver Paquetes XV Años"
          buttonHref="/contacto?ref=fifteen"
          buttonId="btn-cta-porque-nosotros"
          showTopSeparator={true}
          showBottomSeparator={true}
        /> */}

        <QuoteSection message="Cuidamos todos los detalles para entregarte los mejores resultados." />      </section>

      <section>
        <Servicios />
      </section>

      <CTAPaquetes
        title="¡Reserva tu fecha ahora!"
        subtitle="cupos limitados disponibles."
        buttonText="Ver Paquetes XV Años"
        buttonHref="/contacto?ref=fifteen"
        buttonId="btn-cta-video-servicios"
        showTopSeparator={true}
        showBottomSeparator={true}
      />

      <section>
        <Entregas />
      </section>

      <section>
        <Testimonios />
      </section>

      {/* Sección de Garantías */}
      <Garantias
        variant="full"
        title="Nuestras Garantías"
        subtitle="Trabajamos con la confianza y tranquilidad que mereces para tu celebración de XV años"
        showBadges={true}
        ctaBadgeText="✨ XV Años Únicos"
        backgroundClassName="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900"
      />

      {/* Sección de Preguntas Frecuentes */}
      <FAQSection
        variant="full"
        showCategories={false}
        title="Preguntas Frecuentes"
        subtitle="Resolvemos las dudas más comunes sobre nuestros servicios para XV años"
        className="py-20"
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

    </div>
  )
}

export default page