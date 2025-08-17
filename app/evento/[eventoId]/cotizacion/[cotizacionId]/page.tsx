import React from 'react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { obtenerCotizacion } from '@/app/admin/_lib/cotizacion.actions'
import { obtenerEventoPorId } from '@/app/admin/_lib/evento.actions'
import CotizacionDetalle from './components/CotizacionDetalle'


export const metadata: Metadata = {
    title: 'Detalle de Cotización'
}

interface PageProps {
    params: Promise<{ eventoId: string, cotizacionId: string }>
    searchParams: Promise<{ realtime?: string, admin?: string, legacy?: string }>
}

export default async function CotizacionDetallePage({ params, searchParams }: PageProps) {
    const { eventoId, cotizacionId } = await params
    const { realtime, admin, legacy } = await searchParams

    try {
        // Obtener información del evento y cotización
        const [evento, cotizacion] = await Promise.all([
            obtenerEventoPorId(eventoId),
            obtenerCotizacion(cotizacionId)
        ])

        if (!evento || !cotizacion) {
            redirect('/404')
        }

        // Verificar que la cotización pertenece al evento
        if (cotizacion.eventoId !== eventoId) {
            redirect('/404')
        }

        // Verificar si el evento ya está contratado
        if (evento.status === 'contratado') {
            redirect('/cliente/login')
        }

        // Verificar si la cotización está expirada
        const hoy = new Date()
        const expira = cotizacion.expiresAt ? new Date(cotizacion.expiresAt) : null
        const estaExpirada = expira && expira < hoy

        // Verificar disponibilidad de fecha
        const fechaOcupada = evento.status === 'contratado'

        return (
            <div>
                <h1>Detalle de Cotización</h1>
                <p>Evento: {evento.nombre}</p>
                <p>Cotización: {cotizacion.nombre}</p>
                <p>Estado: {cotizacion.status}</p>
                <p>Fecha de creación: {cotizacion.createdAt.toString()}</p>
                <p>Fecha de expiración: {cotizacion.expiresAt?.toString()}</p>
            </div>
            // <CotizacionDetalle
            //     cotizacion={cotizacion}
            //     evento={evento}
            //     esRealtime={realtime === 'true'}
            //     esAdmin={admin === 'true'}
            //     esLegacy={legacy === 'true'}
            //     estaExpirada={estaExpirada}
            //     fechaOcupada={fechaOcupada}
            // />
        )

    } catch (error) {
        console.error('Error al cargar detalle de cotización:', error)
        redirect('/404')
    }
}
