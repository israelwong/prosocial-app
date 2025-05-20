'use client'
import React, { useEffect, useState } from 'react'
import { obtenerCotizacion } from '@/app/admin/_lib/cotizacion.actions'
import { Cotizacion as CotizacionType } from '@/app/admin/_lib/types'

import CotizacionPendiente from './CotizacionPendiente-v2'
import CotizacionAutorizada from './CotizacionAutorizada'
import CotizacionExpirada from './CotizacionExpirada'
import CotizacionNoDisponible from './CotizacionNoDisponible'

import Header from './Header';
import Footer from './Footer';
import Skeleton from './skeleton'

interface Props {
    cotizacionId: string
}

export default function Cotizacion({ cotizacionId }: Props) {

    const [cotizacion, setCotizacion] = useState<CotizacionType | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        obtenerCotizacion(cotizacionId).then((response) => {
            setCotizacion(response)
            setLoading(false)
        })
    }, [cotizacionId])

    if (loading) {
        return <Skeleton footer='Validando cotización' />
    }

    if (!cotizacion || !cotizacion.eventoStatus) {
        return <div>
            {/* HEADER */}
            <Header asunto='Cotización' />
            <div className='max-w-screen-sm mx-auto md:px-0 px-5 '>
                <CotizacionNoDisponible />
            </div>
            {/* FOOTER */}
            <Footer telefono='55 4454 6582' asunto='Hola, estoy en al pagina de cotización...' />
        </div>
    }

    return (
        <div>
            {/* HEADER */}
            <Header asunto='Cotización' />
            {/* BODY */}
            <div className='max-w-screen-sm mx-auto'>
                {cotizacion.status == 'aprobada' && cotizacion.id && <CotizacionAutorizada cotizacionId={cotizacion.id} />}
                {cotizacion.status == 'pendiente' && cotizacion.id && <CotizacionPendiente cotizacionId={cotizacion.id} />}
                {cotizacion.status == 'expirada' && <CotizacionExpirada />}

            </div>
            {/* FOOTER */}
            <Footer telefono='55 4454 6582' asunto='Hola, estoy en al pagina de cotización...' />
        </div>
    )


}