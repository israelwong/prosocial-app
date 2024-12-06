import React from 'react'
import type { Metadata } from "next";
import Hero from '@/app/ui/main/Fifteens/Hero';
import CTA from '@/app/ui/main/Fifteens/CTA';
import Hook from '@/app/ui/main/Hook';
import Nosotros from '@/app/ui/main/Nosotros';
import Servicios from '@/app/ui/main/Fifteens/Servicios';
import Entregas from '@/app/ui/main/Entregas';
import Testomonios from '@/app/ui/main/Testomonios';
// import Galeria from '@/app/ui/main/Galeria';

export const metadata: Metadata = {
  title: "Fifteens",
  description: "Fifteens",
};

function page() {

  return (
    <div className='space-y-14'>

      <section>
        <Hero />
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

      {/* <Galeria
        ruta={'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/porfatolio/'}
        num_fotos={52}
        rowHeight={250}
      /> */}

    </div>
  )
}

export default page