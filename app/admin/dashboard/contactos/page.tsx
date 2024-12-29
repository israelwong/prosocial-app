import React from 'react'
import { Metadata } from 'next'
import ListaContactos from './components/ListaContactos'

export const metadata: Metadata = {
    title: 'Prospectos',
    description: 'Prospectos'
}

function Prospectos() {
    return <ListaContactos />
}

export default Prospectos
