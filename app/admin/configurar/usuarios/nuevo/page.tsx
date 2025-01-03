import React from 'react'
import { Metadata } from 'next'
import FormUsuarioNuevo from '../components/FormUsuarioNuevo'

export const metadata: Metadata = {
    title: 'Nuevo usuario',
}

export default function page() {
    return <FormUsuarioNuevo />
}
