import React from 'react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { obtenerEventoDetalleCompleto } from '@/app/admin/_lib/actions/seguimiento/seguimiento-detalle.actions'
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
        
        // Obtener todos los datos del evento usando la función unificada
        const resultado = await obtenerEventoDetalleCompleto(eventoId)
        
        console.log('🔍 PAGE: Resultado obtenido:', {
            eventoId: resultado.evento.id,
            clienteNombre: resultado.cliente.nombre,
            totalCotizaciones: resultado.cotizacion ? 1 : 0,
            cotizacionId: resultado.cotizacion?.id,
            totalServicios: resultado.serviciosDetalle.length
        })

        if (!resultado.evento || !resultado.cotizacion) {
            console.log('❌ PAGE: No se encontró evento o cotización')
            redirect('/404')
        }

        // Verificar que la cotización que buscamos sea la que está en el resultado
        if (resultado.cotizacion.id !== cotizacionId) {
            console.log('❌ PAGE: La cotización encontrada no coincide con la solicitada')
            redirect('/404')
        }

        // Verificar si el evento ya está contratado
        if (resultado.evento.status === 'contratado') {
            redirect('/cliente/login')
        }

        // Verificar si la cotización está expirada
        const hoy = new Date()
        const expira = resultado.cotizacion.expiresAt ? new Date(resultado.cotizacion.expiresAt) : null
        const estaExpirada = expira && expira < hoy

        // Verificar disponibilidad de fecha
        const fechaOcupada = resultado.evento.status === 'contratado'

        return (
            <CotizacionDetalle
                cotizacion={resultado.cotizacion}
                evento={resultado.evento}
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
