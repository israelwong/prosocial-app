import React from 'react'
import { Metadata } from 'next'
import FormContactoNuevo from '../components/FormContactoNuevo'

export const metadata: Metadata = {
    title: 'Nuevo Contacto - ProSocial',
    description: 'Registrar nuevo prospecto o cliente'
}

export default function NuevoContactoPage() {
    return <FormContactoNuevo />
}
