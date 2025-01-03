import React from 'react'
import { Metadata } from 'next'
import ListaCotizaciones from '../../components/ListaCotizaciones'

export const metadata: Metadata = {
    title: 'Cotización personalizada'
}

export default async function page({ params }: { params: Promise<{ eventoId: string }> }) {
    const { eventoId } = await params
    return <ListaCotizaciones eventoId={eventoId} />
}
