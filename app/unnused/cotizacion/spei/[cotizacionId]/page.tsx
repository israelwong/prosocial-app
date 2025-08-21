import React from 'react'
import { Metadata } from 'next'
import TarjetaSPEI from '@/app/cotizacion/components/TarjetaSPEI'

export const metadata: Metadata = {
    title: 'Datos para pago en SPEI'
}

interface PageProps { params: Promise<{ cotizacionId: string }> }

export default async function page({ params }: PageProps) {
    const { cotizacionId } = await params
    return <TarjetaSPEI cotizacionId={cotizacionId} />
}
