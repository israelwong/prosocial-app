import React from 'react'
import { Metadata } from 'next'
import FormCondicionComercialNueva from '../components/FormCondicionComercialNueva'

export const metadata: Metadata = {
    title: 'Nueva Condición Comercial',
    description: 'Crear una nueva condición comercial',
}

export default function page() {
    return <FormCondicionComercialNueva />
}
