'use client'
import React, { useState, useEffect } from 'react'
import { Cotizacion as CotizacionType } from '@/app/admin/_lib/types'
import { cotizacionDetalle as getCotizacionDetalle } from '@/app/admin/_lib/cotizacion.actions'

import { CotizacionDetalleEvento } from '@/app/admin/_lib/types'


interface Props {
    cotizacion: CotizacionType
}

export default function CotizacionAutorizada({ cotizacion }: Props) {

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

            <p className='font-Bebas-Neue text-xl text-left mb-10 text-zinc-600'>
                Cotización autorizada
            </p>

            <p className='mb-5 text-2xl'>
                Hola {cotizacionDetalle?.cliente?.nombre}!,
            </p>

            <p className='mb-5 leading-6'>
                La cotización para tu evento de {cotizacionDetalle?.eventoTipo?.nombre} de <b>{cotizacionDetalle?.evento?.nombre}</b> con fecha de celebración del <u>{cotizacionDetalle?.evento?.fecha_evento?.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</u> ya ha sido validada.</p>


            <p className='mb-5 leading-6'>
                Para conocer todos los detalles de tu servicio por favor ingresa a tu cuenta en nuestra plataforma.
            </p>


            <button className="bg-zinc-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => { window.location.href = '/login/' }
                }>
                Ingresar ahora
            </button>
        </div>
    )
}
