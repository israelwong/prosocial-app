import React, { useState, useEffect } from 'react'
import { CotizacionServicio } from '@/app/admin/_lib/types'
import { obtenerServicio } from '@/app/admin/_lib/servicio.actions'
import { obtenerCotizacionServicio } from '@/app/admin/_lib/cotizacion.actions'

interface Props {
    cotizacionServicioId: string | undefined,
}

export default function FichaServicioContrato({ cotizacionServicioId }: Props) {

    const [servicio, setServicio] = useState<CotizacionServicio | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {

            if (!cotizacionServicioId) return

            try {
                const cotizacionServicio = await obtenerCotizacionServicio(cotizacionServicioId)
                if (!cotizacionServicio) return

                const servicioData = await obtenerServicio(cotizacionServicio.servicioId);

                if (servicioData) {
                    setServicio({
                        ...cotizacionServicio,
                        nombre: servicioData.nombre,
                        cantidad: cotizacionServicio.cantidad,
                        precio: servicioData.precio_publico
                    });
                }

            } catch (error) {
                console.error('Error fetching data:', error)
                setError('Error fetching data')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [cotizacionServicioId])

    if (loading) {
        return <div className='text-sm text-zinc-700'>Cargando servicio...</div>
    }

    if (error) {
        return <div className='text-sm text-red-500'>{error}</div>
    }

    return (
        <>
            <div className="flex items-center space-x-2 mb-0">
                <div className='flex items-center space-x-2 justify-between w-full border-b border-zinc-800 pb-2'>
                    <p className="mb-0 pr-5 leading-5">
                        {servicio?.nombre ?? "N/A"}
                    </p>
                    <div className="text-sm text-zinc-600 w-1/6 text-right ">
                        Cant. {servicio?.cantidad}
                    </div>
                </div>
            </div>


        </>
    )
}
