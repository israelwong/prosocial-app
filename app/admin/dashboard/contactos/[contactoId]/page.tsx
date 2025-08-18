import React from 'react'
import { Metadata } from 'next';
import DashboardContactos from '../components/DashboardContactos';


export const metadata: Metadata = {
    title: 'Contacto',
}

interface PageProps { params: Promise<{ contactoId: string }> }

export default async function Page({ params }: PageProps) {
    const { contactoId } = await params;
    return <DashboardContactos contactoId={contactoId} />
}
