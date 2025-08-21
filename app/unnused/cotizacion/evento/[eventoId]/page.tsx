import React from 'react'
import { Metadata } from 'next'
import ListaCotizaciones from '../../components/ListaCotizaciones'

export const metadata: Metadata = {
    title: 'Lista de cotizaciones'
}

interface PageProps { params: Promise<{ eventoId: string }> }

export default async function page({ params }: PageProps) {
    const { eventoId } = await params
    return <ListaCotizaciones eventoId={eventoId} />
}
