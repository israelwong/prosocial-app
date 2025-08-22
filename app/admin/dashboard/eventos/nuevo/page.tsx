import React from 'react'
import { Metadata } from 'next';
import FormEventoNuevoFinal from './components/FormEventoNuevoFinal';

export const metadata: Metadata = {
    title: 'Nuevo evento',
}

export default function Page() {
    return <FormEventoNuevoFinal />
}
