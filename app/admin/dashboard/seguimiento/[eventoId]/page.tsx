import React from 'react'
import { Metadata } from 'next'
import FichaDetalle from '../components/FichaDetalle'

export const metadata: Metadata = {
    title: 'Detalle del evento',
}

interface PageProps { params: { eventoId: string } }

export default async function Page({ params }: { params: Promise<{ eventoId: string }> }) {
    const { eventoId } = await params
    return <FichaDetalle eventoId={eventoId} />
}
