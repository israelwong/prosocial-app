'use client'
import { useEffect, useState } from 'react'
import Header from './Header'
import Footer from './Footer'
import EventoActivo from '@/app/cotizacion/components/EventoAcivo'
import EventoInactivo from './EventoInactivo'
import { obtenerStatusEvento } from '@/app/admin/_lib/evento.actions'

interface Props {
    eventoId: string
}

export default function ListaCotizaciones({ eventoId }: Props) {
    const [eventoStatus, setEventoStatus] = useState<string | null>('')

    useEffect(() => {
        obtenerStatusEvento(eventoId).then((data) => {
            setEventoStatus(data ?? null)
        }).catch((error) => {
            console.error('Error fetching event status:', error)
        });
    }, [eventoId])

    return (
        <div>
            <Header asunto='Cotizaciones' />
            {eventoStatus === 'active' ? <EventoActivo eventoId={eventoId} /> : <EventoInactivo />}
            <Footer telefono='5544546582' asunto='Listado de cotizaciones' />
        </div>
    )
}