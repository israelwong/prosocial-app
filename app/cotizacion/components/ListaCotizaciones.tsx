'use client'
import React, { useState, useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import { Evento, Cliente, Cotizacion } from '@/app/admin/_lib/types'
import { obtenerEventoCotizaciones } from '@/app/admin/_lib/evento.actions'
import Skeleton from './skeleton'
import { useRouter } from 'next/navigation'

interface Props {
    eventoId: string
}

export default function ListaCotizaciones({ eventoId }: Props) {

    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [evento, setEvento] = useState<Evento | null>(null)
    const [cliente, setCliente] = useState<Cliente | null>(null)
    const [eventoTipo, setEventoTipo] = useState<string | null>(null)
    const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const data = await obtenerEventoCotizaciones(eventoId)

            setEvento(data.evento ?? null)
            setCliente(data.cliente ?? null)
            setCotizaciones(data.cotizaciones ?? [])
            setEventoTipo(data.tipoEvento ?? null)

            setLoading(false)
        }
        fetchData()
    }, [eventoId])

    const handleOpenCotizacion = (cotizacionId: string) => {
        router.push(`/cotizacion/${cotizacionId}?param=lista`)
    }

    if (loading) {
        return <Skeleton footer='Cargando las cotizaciones disponibless...' />
    }

    return (
        <div>
            <Header asunto='Cotizaciones' />

            <div className='container mx-auto max-w-screen-sm pt-10 pb-5'>

                <div className='mb-0 md:mb-5 md:p-0 p-5'>
                    <h1 className='font-Bebas-Neue text-4xl mb-2'>
                        <span className='text-zinc-500'>Hola </span> {cliente?.nombre.split(' ')[0]}!
                    </h1>
                    <p className='text-lg text-zinc-400'>
                        Te compartimos el listado de cotizaciones que hemos generado para el evento {evento?.tipoEvento} de {eventoTipo} de {evento?.nombre} que celebrarás el {evento?.fecha_evento ? new Date(evento.fecha_evento.getTime() + 86400000).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                    </p>
                </div>

                <div className='w-full md:p-0 px-5'>
                    {cotizaciones.map(cotizacion => (
                        <div className='bg-zinc-900 border border-zinc-800 rounded my-3 w-full text-left mb-3 justify-between items-center p-5' key={cotizacion.id}>

                            <div className='mb-2'>
                                <h4 className='text-lg md:text-xl md:pr-14'>
                                    {cotizacion.nombre} <span className='text-md text-zinc-500'> por presupuesto de {cotizacion.precio.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                                </h4>
                            </div>

                            <button key={cotizacion.id} className='px-3 py-2 bg-purple-900 text-white rounded-md text-sm'
                                onClick={() => cotizacion.id && handleOpenCotizacion(cotizacion.id)}>
                                Ver cotización
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <Footer telefono='5544546582' asunto='Listado de cotizaciones' />
        </div>
    )
}