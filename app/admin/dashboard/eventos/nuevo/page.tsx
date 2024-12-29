import React from 'react'
import { Metadata } from 'next';
import FormEventoNuevo from '../components/FormEventoNuevo';

export const metadata: Metadata = {
    title: 'Nuevo evento',
}

export default function Page() {
    return <FormEventoNuevo />
}
