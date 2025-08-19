'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/app/components/ui/Header'
import Footer from '@/app/components/ui/Footer'

export default function Page() {
    const [isClient, setIsClient] = useState(false)
    const searchParams = useSearchParams()
    const cotizacionId = searchParams ? searchParams.get('cotizacionId') : null

    useEffect(() => {
        setIsClient(true)
    }, [])

    const handleVolverACotizacion = () => {
        if (cotizacionId) {
            // Si tenemos cotizacionId, volver a la cotización específica
            window.location.href = `/evento/cotizacion/${cotizacionId}`
        } else {
            // Si no, volver a la página principal
            window.location.href = '/'
        }
    }

    return (
        <div>
            {/* HEADER */}
            <Header asunto='Pago Cancelado' />

            {/* BODY */}
            <div className='max-w-screen-sm mx-auto mt-10 mb-16 md:p-0 p-5'>
                <p className='font-Bebas-Neue text-2xl text-left mb-10 text-red-600'>
                    Pago cancelado
                </p>

                <p className='mb-5 text-xl'>
                    Tu pago ha sido cancelado.
                </p>

                <p className='mb-10 leading-6 text-zinc-400'>
                    No se ha realizado ningún cargo a tu cuenta. Puedes volver a intentar el pago cuando gustes.
                </p>

                <button 
                    className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 px-6 rounded mb-10"
                    onClick={handleVolverACotizacion}
                >
                    Volver a la cotización
                </button>

                <p className='text-zinc-300'>
                    Si tienes alguna duda, no dudes en contactarnos.
                </p>
            </div>

            {/* FOOTER */}
            {isClient && <Footer telefono='55 4454 6582' asunto='Hola, tengo una duda sobre el pago...' />}
        </div>
    )
}
