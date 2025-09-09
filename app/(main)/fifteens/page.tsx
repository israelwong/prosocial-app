import React from 'react'
import type { Metadata } from "next";
import HeroRefactorizado from './components/HeroRefactorizado';
import CTA from './components/CTA';
import Hook from '@/app/components/main/Hook';
import PorqueNosotros from '@/app/components/main/PorqueNosotros';
import Servicios from './components/ServiciosRefactorizado';
import Entregas from '@/app/components/main/Entregas';
// import Testomonios from '@/app/components/main/Testomonios';
import { FAQSection, TrustBadges, Garantias } from '@/app/components/shared';
import { CTASection, ctaConfigs } from '@/app/components/cta';
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
    <div className='space-y-14'>

      <section>
        <HeroRefactorizado />
      </section>
      <section>
        <CTA />
        <Hook message={"Este momento especial solo se vive una vez, nosotros somos expertos en capturarlo."} />
      </section>
      <section>
        <PorqueNosotros />
      </section>
      <section>
        <CTA />
        <span className='my-5 flex'>
          <Hook message={"Cuidamos todos los detalles para entregarte los mejores resultados."} />
        </span>
      </section>
      <section>
        <Servicios />
      </section>
      <section>
        <CTA />
      </section>
      <section>
        <Entregas />
      </section>
      <section>
        {/* <Testomonios /> */}
      </section>

      {/* Sección de Garantías */}
      <section className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        <Garantias
          variant="full"
          title="Nuestras Garantías"
          subtitle="Trabajamos con la confianza y tranquilidad que mereces para tu celebración de XV años"
          showBadges={true}
          ctaBadgeText="✨ XV Años Únicos"
        />
      </section>

      {/* Sección de Preguntas Frecuentes */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <FAQSection
            variant="full"
            showCategories={false}
            title="Preguntas Frecuentes"
            subtitle="Resolvemos las dudas más comunes sobre nuestros servicios para XV años"
          />
        </div>
      </section>

      {/* CTA Final Unificado */}
      <CTASection
        {...ctaConfigs.fifteens}
        title="¿Listos para Empezar?"
        description="Ofrecemos paquetes preconfigurados, pero si necesitas algo especial podemos armar un paquete a tu medida."
        additionalInfo="Agenda tu cita virtual gratuita • Consulta paquetes disponibles • Cotización personalizada"
        showAdditionalInfo={true}
      />


    </div>
  )
}

export default page