import React from 'react'
import FormContacto from '@/app/ui/main/FormContacto';
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contactanos hoy mismo',
}

async function page(
  props: {
    searchParams: Promise<{
      paquete: number;
      asunto: number;
      tipo_evento: number;
    }>;
  }
) {
  const searchParams = await props.searchParams;
  return (
    <div>

      <section className="container mx-auto mt-10 max-w-screen-sm">
        <p
          className="
        text-center 
        text-6xl 
        font-Bebas-Neue
        text-gray-500
        px-8
        mb-5
        ">
          Contactanos hoy mismo
        </p>

        <div className="mx-auto">
          <p className="px-8 text-lg font-light">
            Por favor, compartenos la siguiente información brindarte una menor atención.
          </p>
          <FormContacto params={searchParams} />
        </div>
      </section>

    </div>
  )
}

export default page
