import React from 'react'
import { Metadata } from 'next'
import ListaMetodosPago from './components/ListaMetodosPago'

export const metadata: Metadata = {
    title: 'Configurar Métodos de Pago',
}

export default function page() {
    return <ListaMetodosPago />
}
