import React from 'react'
import { Metadata } from 'next'
import TarjetaSPEI from '@/app/cotizacion/components/TarjetaSPEI'

export const metadata: Metadata = {
    title: 'Datos para pago en SPEI'
}

export default async function page({ params }: { params: Promise<{ cotizacionId: string }> }) {
    const { cotizacionId } = await params
    return <TarjetaSPEI cotizacionId={cotizacionId} />
}
