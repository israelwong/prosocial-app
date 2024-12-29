import React from 'react'
import { Metadata } from 'next';
import DashbaordContactos from '../components/DashboardContactos';


export const metadata: Metadata = {
    title: 'Contacto',
}

export default async function Page({ params }: { params: Promise<{ contactoId: string }> }) {
    const { contactoId } = await params;
    return <DashbaordContactos contactoId={contactoId} />
}
