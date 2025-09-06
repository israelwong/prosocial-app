import React from 'react'
import type { Metadata } from "next";
import HeroRefactorizado from './components/HeroRefactorizado';
import CTA from './components/CTA';
import Hook from '@/app/ui/main/Hook';
import Nosotros from '@/app/ui/main/Nosotros';
import Servicios from './components/ServiciosRefactorizado';
import Entregas from '@/app/ui/main/Entregas';
import Testomonios from '@/app/ui/main/Testomonios';
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
      <section>
        <div className="">
          <div className="px-10 mx-auto md:max-w-screen-md text-center pt-10">

            <h2 className="font-Bebas-Neue text-4xl md:text-6xl text-pink-700">
              ¿Listos para contratar?
            </h2>
            <p className="font-light text-xl md:text-2xl mb-10 text-slate-300">
              Ofrecemos paquetes preconfigurados, pero si necesitas algo especial podemos armar un paquete a tu medida.
            </p>
            <CTA />
          </div>
        </div>
      </section>


    </div>
  )
}

export default page