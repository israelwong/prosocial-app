import React from 'react'
import { Metadata } from 'next'
import Cotizacion from './components/Cotizacion'

export const metadata: Metadata = {
    title: 'Cotización personalizada'
}

export default async function page({ params }: { params: Promise<{ cotizacionId: string }> }) {
    const { cotizacionId } = await params
    return <Cotizacion cotizacionId={cotizacionId} />
}
