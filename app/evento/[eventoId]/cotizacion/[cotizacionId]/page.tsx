import React from 'react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { obtenerCotizacionCompleta } from '@/app/admin/_lib/actions/cotizacion/cotizacion.actions'
import CotizacionDetalle from './components/CotizacionDetalle'
import RedirectCliente from './components/RedirectCliente'
import EventoMetadataProvider from '../../components/EventoMetadataProvider'


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

        // 🎯 VALIDACIÓN: Si el evento ya está aprobado, mostrar redirección al cliente
        const eventoAprobado = datosCotizacion.cotizacion.Evento.status === 'aprobado' ||
            datosCotizacion.cotizacion.Evento.status === 'contratado'

        if (eventoAprobado) {
            console.log('🔄 Evento aprobado/contratado, mostrando redirección al cliente');
            return <RedirectCliente motivo="Evento ya aprobado/contratado" />
        }

        // Verificar si la cotización está expirada
        const hoy = new Date()
        const expira = datosCotizacion.cotizacion.expiresAt ? new Date(datosCotizacion.cotizacion.expiresAt) : null
        const estaExpirada = expira && expira < hoy

        // Verificar disponibilidad de fecha
        const fechaOcupada = datosCotizacion.cotizacion.Evento.status === 'contratado'

        return (
            <>
                {/* Metadata provider para guardar contexto del evento */}
                <EventoMetadataProvider
                    metadata={{
                        eventoId: datosCotizacion.cotizacion.Evento.id,
                        eventoTipoId: datosCotizacion.cotizacion.Evento.eventoTipoId || '',
                        eventoTipoNombre: datosCotizacion.cotizacion.Evento.EventoTipo?.nombre || 'Evento',
                        cotizacionId: datosCotizacion.cotizacion.id
                    }}
                />

                <CotizacionDetalle
                    cotizacion={datosCotizacion.cotizacion}
                    evento={datosCotizacion.cotizacion.Evento}
                    esRealtime={realtime === 'true'}
                    esAdmin={admin === 'true'}
                    esLegacy={legacy === 'true'}
                />
            </>
        )

    } catch (error) {
        console.error('Error al cargar detalle de cotización:', error)
        redirect('/404')
    }
}
