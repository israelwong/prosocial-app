'use client'
import React, { useState, useEffect } from 'react'
import { Cotizacion as CotizacionType } from '@/app/admin/_lib/types'
import { cotizacionDetalle } from '@/app/admin/_lib/cotizacion.actions'

interface Props {
    cotizacion: CotizacionType
}

export default function CotizacionAutorizada({ cotizacion }: Props) {
    const [nombreCliente, setNombreCliente] = useState('')
    const [nombreEvento, setNombreEvento] = useState('')
    const [fechaEvento, setFechaEvento] = useState('')
    const [eventoTipo, setEventoTipo] = useState('')

    useEffect(() => {
        if (cotizacion.id) {

            cotizacionDetalle(cotizacion.id).then((response) => {
                if (response.cliente) {
                    setNombreCliente(response.cliente.nombre)
                }

                if (response.evento) {
                    setFechaEvento(response.evento.fecha_evento.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }))
                    setNombreEvento(response.evento.nombre || '')
                }

                if (response.eventoTipo) {
                    setEventoTipo(response.eventoTipo.nombre || '')
                }

            })

        }

    }, [cotizacion.id])


    return (
        <div className="mt-10 mb-16 p-8">

            <p className='font-Bebas-Neue text-xl text-left mb-10 text-green-600'>
                Cotización autorizada
            </p>

            <p className='mb-5 text-2xl'>
                Hola {nombreCliente}!,
            </p>

            <p className='mb-5 leading-6'>
                La cotización para tu evento de {eventoTipo} de <b>{nombreEvento}</b> con fecha de celebración del <u>{fechaEvento}</u> ya ha sido validada.</p>


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
