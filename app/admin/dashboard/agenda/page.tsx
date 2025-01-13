import React from 'react'
import { Metadata } from 'next'
import ListaAgenda from './components/ListaAgenda'

export const metadata: Metadata = {
    title: 'Agenda',
}

export default function page() {
    return <ListaAgenda />
}
