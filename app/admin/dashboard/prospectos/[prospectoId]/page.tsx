import React from 'react'
import { Metadata } from 'next';
import DashbaordProspecto from '../components/DashboardProspecto';


export const metadata: Metadata = {
    title: 'Prospecto',
}

export default async function Page({ params }: { params: Promise<{ prospectoId: string }> }) {
    const { prospectoId } = await params;
    return <DashbaordProspecto prospectoId={prospectoId} />
}
