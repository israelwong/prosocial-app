import React from 'react'
import { Metadata } from 'next'
import FormMetodoPagoNuevo from '../components/FormMetodoPagoNuevo'

export const metadata: Metadata = {
    title: 'Nuevo método de pago',
    description: 'Agrega un nuevo método de pago',
}

export default function MetodoPagoNuevo() {
    return <FormMetodoPagoNuevo />
}
