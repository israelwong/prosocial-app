import React from 'react'
// import FormContacto from '@/app/ui/main/FormContacto';
// import LeadForm from './components/LeadForm';
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contáctanos para conocer nuestros servicios de fotografía y video profesional. Te ayudamos a crear el evento perfecto.',
  keywords: ['contacto', 'cotización', 'presupuesto', 'fotografía profesional', 'video profesional'],
  openGraph: {
    title: 'Contacto - ProSocial',
    description: 'Contáctanos para conocer nuestros servicios de fotografía y video profesional.',
  },
}

async function page() {

  return (
    <div>

      <section className="container mx-auto mt-10 max-w-screen-sm">

        <div className="mx-auto">
          {/* <LeadForm /> */}
        </div>
      </section>

    </div>
  )
}

export default page