import React from 'react'
import { Metadata } from 'next'
import FormMetodoPagoEditar from '../components/FormMetodoPagoEditar'

export const metadata: Metadata = {
    title: 'Configurar Método de Pago',
}

export default async function page({ params }: { params: Promise<{ metodoPagoId: string }> }) {
    const { metodoPagoId } = await params
    return <FormMetodoPagoEditar metodoPagoId={metodoPagoId} />
}
