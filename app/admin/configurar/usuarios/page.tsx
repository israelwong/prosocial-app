import React from 'react'
import { Metadata } from 'next'
import ListaUsuarios from './components/ListaUsuarios'

export const metadata: Metadata = {
    title: 'Usuarios',
    description: 'Usuarios',
}

export default function page() {
    return <ListaUsuarios />
}
