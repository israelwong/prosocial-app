import React from 'react'
import { Metadata } from 'next'
import FormContactoNuevoV2 from '../components/FormContactoNuevoV2'

export const metadata: Metadata = {
    title: 'Nuevo Contacto - ProSocial',
    description: 'Registrar nuevo prospecto o cliente'
}

export default function NuevoContactoPage() {
    return <FormContactoNuevoV2 />
}
