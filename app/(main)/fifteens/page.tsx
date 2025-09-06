import React from 'react'
import type { Metadata } from "next";
import HeroRefactorizado from './components/HeroRefactorizado';
import CTA from './components/CTA';
import Hook from '@/app/ui/main/Hook';
import Nosotros from '@/app/ui/main/Nosotros';
import Servicios from './components/ServiciosRefactorizado';
import Entregas from '@/app/ui/main/Entregas';
import Testomonios from '@/app/ui/main/Testomonios';
import { FAQSection, GuaranteesSection, TrustBadges } from '@/app/components/shared';
// import Galeria from '@/app/ui/main/Galeria';

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
        <Nosotros />
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
        <Testomonios />
      </section>

      {/* Sección de Garantías */}
      <section className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <GuaranteesSection
            variant="full"
            className="mb-16"
          />
          <TrustBadges variant="inline" />
        </div>
      </section>

      {/* Sección de Preguntas Frecuentes */}
      <section className="py-20 bg-zinc-900">
        <div className="max-w-4xl mx-auto px-6">
          <FAQSection
            variant="full"
            showCategories={false}
            title="Preguntas Frecuentes"
            subtitle="Resolvemos las dudas más comunes sobre nuestros servicios para XV años"
          />
        </div>
      </section>

      <section>
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 py-20">
          <div className="px-10 mx-auto md:max-w-screen-md text-center">

            <h2 className="font-Bebas-Neue text-4xl md:text-6xl text-white mb-6">
              ¿Listos para Empezar?
            </h2>
            <p className="font-light text-xl md:text-2xl mb-10 text-zinc-300">
              Ofrecemos paquetes preconfigurados, pero si necesitas algo especial podemos armar un paquete a tu medida.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <a
                href="https://calendly.com/prosocial-mx"
                target="_blank"
                className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors duration-300"
              >
                Agenda una Cita Virtual
              </a>
              <a
                href="/fifteens/paquetes"
                className="border-2 border-zinc-400 hover:border-white text-zinc-300 hover:text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors duration-300"
              >
                Ver Paquetes
              </a>
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}

export default page