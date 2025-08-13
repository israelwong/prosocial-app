'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { EventoCompleto } from '@/app/admin/_lib/actions/evento/evento.schemas'

// Componentes existentes (mantenemos la funcionalidad)
import ListaCotizaciones from '../cotizaciones/components/ListaCotizacionesV2'

// Nuevos componentes unificados
import EventoHeader from './EventoHeader'
import FichaClienteUnificada from './FichaClienteUnificada'
import FichaClienteUnificadaV2 from './FichaClienteUnificadaV2'
import FichaEventoUnificada from './FichaEventoUnificada'
import FichaEventoUnificadaV2 from './FichaEventoUnificadaV2'
import FichaBitacoraUnificada from './FichaBitacoraUnificada'
import FichaCotizacionesUnificada from './FichaCotizacionesUnificada'
import EventoMobileNavigation from './EventoMobileNavigation'

interface Props {
    eventoCompleto: EventoCompleto
}

export default function EventoDetailView({ eventoCompleto }: Props) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // Extraer datos del evento completo
    const eventoData = {
        clienteId: eventoCompleto.clienteId,
        eventoTipoId: eventoCompleto.eventoTipoId ?? '',
        nombreCliente: eventoCompleto.Cliente.nombre,
        telefono: eventoCompleto.Cliente.telefono ?? '',
        email: eventoCompleto.Cliente.email ?? '',
        nombreEtapa: eventoCompleto.EventoEtapa?.nombre ?? '',
        eventoAsignado: !!eventoCompleto.userId,
        nombreEvento: eventoCompleto.nombre ?? '',
        fechaEvento: eventoCompleto.fecha_evento,
        status: eventoCompleto.status,
        totalPagado: (eventoCompleto.Cotizacion || []).reduce((acc, cot) => {
            const totalPagos = (cot.Pago || []).reduce((sum, pago) => sum + pago.monto, 0)
            return acc + totalPagos
        }, 0)
    }

    const eventoId = eventoCompleto.id

    if (!eventoId) {
        return <div className="p-4 text-red-500">Error: ID de evento no encontrado</div>
    }

    const handleAbrirConversacion = () => {
        const mensaje = `Hola ${eventoData.nombreCliente}, ¿Cómo estás?`
        window.open(`https://wa.me/${eventoData.telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')
    }

    const handleEventoAsignado = (status: boolean) => {
        // TODO: Implementar actualización de asignación
        console.log('Actualizar asignación:', status)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-zinc-400">Cargando evento...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Header Unificado */}
            <EventoHeader
                eventoData={eventoData}
                onAbrirConversacion={handleAbrirConversacion}
                onCerrar={() => router.back()}
                onGestionarEvento={() => router.push(`/admin/dashboard/seguimiento/${eventoId}`)}
            />

            {/* Contenido Principal */}
            <div className="container mx-auto px-4 py-6">
                {/* Desktop: Grid de 4 columnas */}
                <div className="hidden lg:grid lg:grid-cols-4 gap-6">

                    {/* Columna 1: Información del Cliente */}
                    <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-4">
                        <FichaClienteUnificadaV2
                            eventoCompleto={eventoCompleto}
                        />
                    </div>

                    {/* Columna 2: Información del Evento */}
                    <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-4">
                        <FichaEventoUnificadaV2
                            eventoCompleto={eventoCompleto}
                            onAsignacionEvento={handleEventoAsignado}
                        />
                    </div>

                    {/* Columna 3: Cotizaciones */}
                    <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-4">
                        <FichaCotizacionesUnificada
                            eventoCompleto={eventoCompleto}
                            eventoAsignado={eventoData.eventoAsignado}
                        />
                    </div>

                    {/* Columna 4: Seguimiento (Bitácora) */}
                    <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-4">
                        <FichaBitacoraUnificada eventoCompleto={eventoCompleto} />
                    </div>
                </div>

                {/* Mobile/Tablet: Navegación con Tabs */}
                <EventoMobileNavigation
                    gestionContent={
                        <div className="p-4 space-y-6">
                            <FichaClienteUnificadaV2 eventoCompleto={eventoCompleto} />
                            <hr className="border-zinc-800" />
                            <FichaEventoUnificadaV2
                                eventoCompleto={eventoCompleto}
                                onAsignacionEvento={handleEventoAsignado}
                            />
                        </div>
                    }
                    cotizacionesContent={
                        <div className="p-4">
                            <FichaCotizacionesUnificada
                                eventoCompleto={eventoCompleto}
                                eventoAsignado={eventoData.eventoAsignado}
                            />
                        </div>
                    }
                    seguimientoContent={
                        <div className="p-4">
                            <FichaBitacoraUnificada eventoCompleto={eventoCompleto} />
                        </div>
                    }
                />
            </div>
        </div>
    )
}
