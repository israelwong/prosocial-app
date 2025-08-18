import React from 'react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { obtenerCotizacionCompleta } from '@/app/admin/_lib/actions/cotizacion/cotizacion.actions'
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
        console.log('🔍 PAGE: Cargando página con IDs:', { eventoId, cotizacionId })

        // Obtener la cotización completa directamente (igual que en el admin)
        const datosCotizacion = await obtenerCotizacionCompleta(cotizacionId)

        console.log('🔍 PAGE: Cotización obtenida:', {
            cotizacionId: datosCotizacion?.cotizacion?.id,
            eventoId: datosCotizacion?.cotizacion?.Evento?.id,
            clienteNombre: datosCotizacion?.cotizacion?.Evento?.Cliente?.nombre,
            totalServicios: datosCotizacion?.cotizacion?.Servicio?.length || 0
        })

        if (!datosCotizacion.cotizacion || !datosCotizacion.cotizacion.Evento) {
            console.log('❌ PAGE: No se encontró cotización o evento')
            redirect('/404')
        }

        // Verificar que el evento coincida
        if (datosCotizacion.cotizacion.Evento.id !== eventoId) {
            console.log('❌ PAGE: El evento de la cotización no coincide con el solicitado')
            redirect('/404')
        }

        // Verificar si el evento ya está contratado
        if (datosCotizacion.cotizacion.Evento.status === 'contratado') {
            redirect('/cliente/login')
        }

        // Verificar si la cotización está expirada
        const hoy = new Date()
        const expira = datosCotizacion.cotizacion.expiresAt ? new Date(datosCotizacion.cotizacion.expiresAt) : null
        const estaExpirada = expira && expira < hoy

        // Verificar disponibilidad de fecha
        const fechaOcupada = datosCotizacion.cotizacion.Evento.status === 'contratado'

        return (
            <CotizacionDetalle
                cotizacion={datosCotizacion.cotizacion}
                evento={datosCotizacion.cotizacion.Evento}
                esRealtime={realtime === 'true'}
                esAdmin={admin === 'true'}
                esLegacy={legacy === 'true'}
                estaExpirada={estaExpirada}
                fechaOcupada={fechaOcupada}
            />
        )

    } catch (error) {
        console.error('Error al cargar detalle de cotización:', error)
        redirect('/404')
    }
}
