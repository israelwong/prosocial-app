import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { obtenerPaqueteDetalleParaCliente } from '@/app/admin/_lib/actions/paquetes/paquetes.actions'
import PaqueteDetalle from './components/PaqueteDetalle'

interface PageProps {
    params: Promise<{ paqueteId: string }>
}

export const metadata: Metadata = {
    title: 'Detalle del Paquete - Prosocial'
}

export default async function PaqueteDetallePage({ params }: PageProps) {
    try {
        const { paqueteId } = await params
        const paquete = await obtenerPaqueteDetalleParaCliente(paqueteId)

        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
                <PaqueteDetalle paquete={paquete} />
            </div>
        )
    } catch (error) {
        console.error('Error al cargar detalle del paquete:', error)
        notFound()
    }
}
