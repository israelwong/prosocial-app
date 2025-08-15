import React from 'react'
import { Metadata } from 'next'
import FichaDetalle from './components/FichaDetalle'

export const metadata: Metadata = {
    title: 'Detalle del evento',
}

interface PageProps { params: Promise<{ eventoId: string }> }

export default async function Page({ params }: PageProps) {
    const { eventoId } = await params
    return <FichaDetalle eventoId={eventoId} />
}
