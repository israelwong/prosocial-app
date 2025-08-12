import React from 'react'
import { Metadata } from 'next'
import ListaContactosV2 from './components/ListaContactosV2'

export const metadata: Metadata = {
    title: 'Contactos - ProSocial',
    description: 'Gestión de prospectos y clientes'
}

function ContactosPage() {
    return <ListaContactosV2 />
}

export default ContactosPage
