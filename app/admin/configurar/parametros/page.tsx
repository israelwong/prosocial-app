import React from 'react'
import { Metadata } from 'next'
import ListaConfiguracion from './components/ListaConfiguracion'


export const metadata: Metadata = {
    title: 'Configurar Parámetros',
}

function page() {
    return <ListaConfiguracion />
}

export default page
