import React from 'react'
import { Metadata } from 'next';
import FormCotizaacionEditar from '../components/FormCotizacionEditar';

export const metadata: Metadata = {
    title: 'Cotizacion',
    description: 'Cotizacion',
}

export default async function page({ params }: { params: Promise<{ cotizacionId: string }> }) {
    const { cotizacionId } = await params
    return <FormCotizaacionEditar cotizacionId={cotizacionId} />
}
