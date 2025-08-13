import React from 'react'
import { Metadata } from 'next'
import Cotizacion from '../components/Cotizacion'

export const metadata: Metadata = {
    title: 'Cotización personalizada'
}

interface PageProps { params: Promise<{ cotizacionId: string }> }

export default async function page({ params }: PageProps) {
    const { cotizacionId } = await params
    return <Cotizacion cotizacionId={cotizacionId} />
}
