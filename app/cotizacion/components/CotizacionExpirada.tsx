'use client'
import React, { useState, useEffect } from 'react'
import { Cotizacion as CotizacionType } from '@/app/admin/_lib/types'
import { cotizacionDetalle as getCotizacionDetalle } from '@/app/admin/_lib/cotizacion.actions'

import { CotizacionDetalleEvento } from '@/app/admin/_lib/types'


interface Props {
    cotizacion: CotizacionType
}

export default function CotizacionExpirada({ cotizacion }: Props) {

    const [cotizacionDetalle, setCotizacionDetalle] = useState<CotizacionDetalleEvento | null>(null)


    useEffect(() => {
        if (cotizacion.id) {
            getCotizacionDetalle(cotizacion.id).then((response: CotizacionDetalleEvento) => {
                setCotizacionDetalle(response)
            })
        }
    }, [cotizacion.id])



    return (
        <div className="mt-10 mb-16">

            <p className='font-Bebas-Neue text-xl text-left mb-10 text-red-600'>
                Cotización expirada
            </p>

            <p className='mb-5 text-2xl'>
                Hola {cotizacionDetalle?.cliente?.nombre}!,
            </p>

            <p className='mb-5 leading-6'>
                Lamentamos los inconvenientes, esta cotización ha expirado, por favor solicita una nueva.
            </p>

        </div>
    )
}
