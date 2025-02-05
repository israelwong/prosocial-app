'use client'
import { useEffect, useState } from 'react'
import Header from './Header'
import Footer from './Footer'
import EventoActivo from './EventoActivo'
import EventoInactivo from './EventoInactivo'
import { obtenerStatusEvento } from '@/app/admin/_lib/evento.actions'

interface Props {
    eventoId: string
}

export default function ListaCotizaciones({ eventoId }: Props) {
    const [eventoStatus, setEventoStatus] = useState<string | null>('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setIsLoading(true)
        obtenerStatusEvento(eventoId).then((data) => {
            setEventoStatus(data ?? null)
            setIsLoading(false)
        }).catch((error) => {
            console.error('Error fetching event status:', error)
        });
    }, [eventoId])

    return (
        <>
            <Header asunto='Cotizaciones' />
            {isLoading ? (
                <>
                    <p className='text-center text-zinc-600 py-24'>
                        Un momento porfavor...
                    </p>
                </>
            ) : (
                <>
                    {eventoStatus === 'active' ? <EventoActivo eventoId={eventoId} /> : <EventoInactivo />}
                </>
            )}
            <Footer telefono='5544546582' asunto='Listado de cotizaciones' />
        </>
    )
}

