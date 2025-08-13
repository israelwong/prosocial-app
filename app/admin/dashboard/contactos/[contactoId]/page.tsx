import React from 'react'
import { Metadata } from 'next';
import DashbaordContactos from '../components/DashboardContactos';


export const metadata: Metadata = {
    title: 'Contacto',
}

interface PageProps { params: { contactoId: string } }

export default async function Page({ params }: PageProps) {
    const { contactoId } = params;
    return <DashbaordContactos contactoId={contactoId} />
}
