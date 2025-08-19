'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { obtenerPagoSesionStripe } from '@/app/admin/_lib/pago.actions'
import { Pago as PagoType, Cliente as ClienteType } from '@/app/admin/_lib/types'
import Skeleton from '@/app/components/ui/Skeleton'

export default function PagoExitoso() {

    const searchParams = useSearchParams()
    const sessionId = searchParams ? searchParams.get('session_id') : null
    const [pago, setPago] = useState<PagoType | null>(null)
    const [cliente, setCliente] = useState<ClienteType | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (sessionId) {
            obtenerPagoSesionStripe(sessionId).then((response) => {
                setPago(response.pago)
                setCliente(response.cliente)
                setLoading(false)
            })
        }
    }, [sessionId])

    if (loading) {
        return <Skeleton footer='Cargando información' />
    }

    return (
        <div className="mt-10 mb-16 md:p-0  p-5">

            <p className='font-Bebas-Neue text-2xl text-left mb-10 text-green-700'>
                Pago exitoso
            </p>

            <p className='mb-5 text-2xl'>
                Hola {cliente?.nombre}!,
            </p>

            <p className='mb-5 leading-6'>
                Tu pago por <b>{pago?.monto?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</b> MXN ha sido procesado exitosamente.
            </p>

            <div className='p-5 bg-zinc-900 rounded-md mb-5 text-sm text-zinc-500 border border-zinc-800'>
                <p className='mb-5'>
                    <u>Concepto:</u> {pago?.concepto}.
                </p>

                <p className=''>
                    {pago?.descripcion}
                </p>
            </div>

            <p className='mb-5 leading-6'>
                También te hemos enviado un correo con los detalles de tu pago.
            </p>

            <p className='mb-10'>
                Para conocer todos los detalles de tu servicio por favor ingresa a tu cuenta en nuestra plataforma.
            </p>

            <button className="bg-zinc-700 text-white font-bold py-2 px-4 rounded mb-10"
                onClick={() => { window.location.href = '/login/' }
                }>
                Ingresar ahora
            </button>

            <p className='text-zinc-300'>
                ¡Nos saludamos muy pronto!
            </p>
        </div>
    )
}
