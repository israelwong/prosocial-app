import React from 'react'
import { Metadata } from 'next'
import ListaContactos from './components/ListaContactos'

export const metadata: Metadata = {
    title: 'Contactos - ProSocial',
    description: 'Gestión de prospectos y clientes'
}

function ContactosPage() {
    return <ListaContactos />
}

export default ContactosPage
