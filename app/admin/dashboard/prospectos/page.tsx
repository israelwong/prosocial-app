import React from 'react'
import { Metadata } from 'next'
import ListaProspectos from './components/ListaProspectos'

export const metadata: Metadata = {
    title: 'Prospectos',
    description: 'Prospectos'
}

function Prospectos() {
    return <ListaProspectos />
}

export default Prospectos
