'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { EventoCompleto } from '@/app/admin/_lib/actions/evento/evento.schemas'
import { COTIZACION_STATUS } from '@/app/admin/_lib/constants/status'

// Nuevos componentes unificados
import EventoHeader from './EventoHeader'
import FichaClienteUnificada from './FichaClienteUnificada'
import FichaEventoUnificada from './FichaEventoUnificada'
import FichaBitacoraUnificada from './FichaBitacoraUnificada'
import FichaCotizacionesUnificada from './FichaCotizacionesUnificada'
import FichaPaquetesCompartir from './FichaPaquetesCompartir'
import EventoMobileNavigation from './EventoMobileNavigation'

interface Props {
    eventoCompleto: EventoCompleto
}

export default function EventoDetailView({ eventoCompleto }: Props) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // Verificar que tenemos los datos mínimos requeridos
    if (!eventoCompleto.Cliente) {
        return <div className="p-4 text-red-500">Error: Datos del cliente no disponibles</div>
    }

    // Para compatibilidad con FichaClienteUnificada, necesitamos un cliente con más propiedades
    const clienteExtendido = {
        ...eventoCompleto.Cliente,
        // Solo usar valores por defecto si los campos no existen en los datos reales
        direccion: eventoCompleto.Cliente.direccion || null,
        status: eventoCompleto.Cliente.status || 'prospecto',
        canalId: eventoCompleto.Cliente.canalId || null,
        userId: eventoCompleto.Cliente.userId || null,
        createdAt: eventoCompleto.Cliente.createdAt || new Date(),
        updatedAt: eventoCompleto.Cliente.updatedAt || new Date(),
        Canal: eventoCompleto.Cliente.Canal || null
    }

    const eventoCompletoExtendido = {
        ...eventoCompleto,
        Cliente: clienteExtendido
    }

    // Extraer datos del evento completo
    const eventoData = {
        id: eventoCompleto.id,
        clienteId: eventoCompleto.clienteId,
        eventoTipoId: eventoCompleto.eventoTipoId ?? '',
        nombreCliente: eventoCompleto.Cliente?.nombre || '',
        telefono: eventoCompleto.Cliente?.telefono ?? '',
        email: eventoCompleto.Cliente?.email ?? '',
        nombreEtapa: eventoCompleto.EventoEtapa?.nombre ?? '',
        eventoAsignado: !!eventoCompleto.userId,
        nombreEvento: eventoCompleto.nombre ?? '',
        fechaEvento: eventoCompleto.fecha_evento,
        status: eventoCompleto.status,
        totalPagado: (eventoCompleto.Cotizacion || []).reduce((acc: number, cot: any) => {
            const totalPagos = (cot.Pago || []).reduce((sum: number, pago: any) => sum + pago.monto, 0)
            return acc + totalPagos
        }, 0)
    }

    const eventoId = eventoCompleto.id

    if (!eventoId) {
        return <div className="p-4 text-red-500">Error: ID de evento no encontrado</div>
    }

    // Verificar si hay cotizaciones aprobadas o autorizadas
    const tieneCotizacionAprobada = (eventoCompleto.Cotizacion || []).some(cotizacion =>
        cotizacion.status === COTIZACION_STATUS.APROBADA ||
        cotizacion.status === COTIZACION_STATUS.AUTORIZADO
    )

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
        <div className="min-h-screen bg-zinc-950 w-full">
            {/* Header Unificado */}
            <EventoHeader
                eventoData={eventoData}
                onAbrirConversacion={handleAbrirConversacion}
                onCerrar={() => router.push('/admin/dashboard/eventos')}
                onGestionarEvento={() => router.push(`/admin/dashboard/seguimiento/${eventoId}`)}
            />

            {/* Contenido Principal */}
            <div className="container  mx-auto px-4 py-6">
                {/* Desktop: Grid de 4 columnas */}
                <div className="hidden lg:grid lg:grid-cols-4 gap-6">

                    {/* Columna 1: Información del Cliente */}
                    <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-4">
                        <FichaClienteUnificada
                            eventoCompleto={eventoCompletoExtendido}
                        />
                    </div>

                    {/* Columna 2: Información del Evento */}
                    <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-4">
                        <FichaEventoUnificada
                            eventoCompleto={eventoCompleto}
                            onAsignacionEvento={handleEventoAsignado}
                        />
                    </div>

                    {/* Columna 3: Cotizaciones */}
                    <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-4">
                        {!tieneCotizacionAprobada && (
                            <FichaPaquetesCompartir eventoCompleto={eventoCompleto} />
                        )}
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
                            <FichaClienteUnificada eventoCompleto={eventoCompletoExtendido} />
                            <hr className="border-zinc-800" />
                            <FichaEventoUnificada
                                eventoCompleto={eventoCompleto}
                                onAsignacionEvento={handleEventoAsignado}
                            />
                        </div>
                    }
                    cotizacionesContent={
                        <div className="p-4">
                            {!tieneCotizacionAprobada && (
                                <FichaPaquetesCompartir eventoCompleto={eventoCompleto} />
                            )}
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
