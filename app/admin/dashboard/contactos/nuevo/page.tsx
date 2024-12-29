import React from 'react'
import { Metadata } from 'next'
import FormContactoNuevo from '../components/FormContactoNuevo'

export const metadata: Metadata = {
    title: 'Nuevo contacto',
}

export default function page() {
    return <FormContactoNuevo />
}
