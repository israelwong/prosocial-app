'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/app/components/ui/Header'
import Footer from '@/app/components/ui/Footer'

export default function Page() {
    const [isClient, setIsClient] = useState(false)
    const searchParams = useSearchParams()
    const cotizacionId = searchParams ? searchParams.get('cotizacionId') : null
    const paymentMethod = searchParams ? searchParams.get('method') : null

    useEffect(() => {
        setIsClient(true)
    }, [])

    const handleVolverACotizacion = () => {
        if (cotizacionId) {
            window.location.href = `/evento/cotizacion/${cotizacionId}`
        } else {
            window.location.href = '/'
        }
    }

    const getPendingMessage = () => {
        if (paymentMethod === 'spei') {
            return {
                title: 'Pago SPEI en proceso',
                message: 'Tu pago SPEI está siendo procesado. Esto puede tomar hasta 1 hora en horario bancario.',
                detail: 'Te notificaremos por correo electrónico una vez que el pago sea confirmado.'
            }
        }
        return {
            title: 'Pago pendiente',
            message: 'Tu pago está siendo procesado.',
            detail: 'Te notificaremos una vez que el pago sea confirmado.'
        }
    }

    const { title, message, detail } = getPendingMessage()

    return (
        <div>
            {/* HEADER */}
            <Header asunto='Pago Pendiente' />

            {/* BODY */}
            <div className='max-w-screen-sm mx-auto mt-10 mb-16 md:p-0 p-5'>
                <p className='font-Bebas-Neue text-2xl text-left mb-10 text-yellow-600'>
                    {title}
                </p>

                <p className='mb-5 text-xl'>
                    {message}
                </p>

                <div className='p-5 bg-zinc-900 rounded-md mb-5 text-sm text-zinc-400 border border-zinc-800'>
                    <p className='mb-3'>
                        <strong className='text-zinc-300'>Estado:</strong> Pendiente
                    </p>
                    <p>
                        {detail}
                    </p>
                </div>

                <p className='mb-10 leading-6 text-zinc-400'>
                    Mientras tanto, puedes revisar los detalles de tu cotización.
                </p>

                <button
                    className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 px-6 rounded mb-10"
                    onClick={handleVolverACotizacion}
                >
                    Ver mi cotización
                </button>

                <p className='text-zinc-300'>
                    Si tienes alguna duda, no dudes en contactarnos.
                </p>
            </div>

            {/* FOOTER */}
            {isClient && <Footer telefono='55 4454 6582' asunto='Hola, tengo una duda sobre mi pago pendiente...' />}
        </div>
    )
}
