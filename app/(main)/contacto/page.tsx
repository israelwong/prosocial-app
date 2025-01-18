import React from 'react'
// import FormContacto from '@/app/ui/main/FormContacto';
import LeadForm from './_components/LeadForm';
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contactanos hoy mismo',
}

async function page() {

  return (
    <div>

      <section className="container mx-auto mt-10 max-w-screen-sm">

        <div className="mx-auto">
          <LeadForm />
        </div>
      </section>

    </div>
  )
}

export default page