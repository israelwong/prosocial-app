import React from 'react'
import { Metadata } from 'next'
import EventosList from './_components/EventosList'

export const metadata: Metadata = {
    title: 'Cotizaciones de Eventos',
    description: 'Listado de eventos en etapa de cotización y prospección.'
}

export default function EventosPage() {
    return <EventosList />
}
