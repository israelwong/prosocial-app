'use client'

import { EventoHeaderV3 } from './EventoHeaderV3'
import { ResumenFinancieroV3 } from './ResumenFinancieroV3'
import { ServiciosListaV3 } from './ServiciosListaV3'
import { HistorialPagosV3 } from './HistorialPagosV3'
import { BitacoraEventosV3 } from './BitacoraEventosV3'
import { AccionesRapidasV3 } from './AccionesRapidasV3'

interface SeguimientoDetalleV3Props {
    data: {
        evento: {
            id: string
            nombre: string
            fecha: string
            fecha_evento: string
            hora?: string
            locacion?: string
            cliente: {
                nombre: string
                telefono?: string
                email?: string
            }
            status: string
            eventoTipo: {
                nombre: string
            }
        }
        cotizacion: {
            existe: boolean
            id?: string
            status?: string
            precio?: number
        }
        servicios: {
            cantidad: number
            lista: Array<{
                id: string
                nombre: string
                precio: number
                status: string
            }>
        }
        pagos: {
            cantidad: number
            lista: Array<{
                id: string
                cantidad: number
                status: string
                metodoPago: string
                concepto?: string
                fechaFormateada?: string
                montoFormateado?: string
            }>
        }
    }
    bitacora?: Array<{
        id: string
        fecha: string
        tipo: string
        titulo: string
        descripcion: string
        usuario?: string
        status?: string
    }>
    onEditarEvento?: () => void
    onAgregarServicio?: () => void
    onEditarServicio?: (servicioId: string) => void
    onAgregarPago?: () => void
    onVerDetallePago?: (pagoId: string) => void
    onDescargarRecibo?: (pagoId: string) => void
    onAgregarEntradaBitacora?: () => void
    onVerDetalleBitacora?: (entradaId: string) => void
    onGenerarContrato?: () => void
    onDescargarReporte?: () => void
    onCompartirEvento?: () => void
    onImprimirResumen?: () => void
    onConfiguracionAvanzada?: () => void
    isLoading?: boolean
}

export function SeguimientoDetalleV3({
    data,
    bitacora,
    onEditarEvento,
    onAgregarServicio,
    onEditarServicio,
    onAgregarPago,
    onVerDetallePago,
    onDescargarRecibo,
    onAgregarEntradaBitacora,
    onVerDetalleBitacora,
    onGenerarContrato,
    onDescargarReporte,
    onCompartirEvento,
    onImprimirResumen,
    onConfiguracionAvanzada,
    isLoading = false
}: SeguimientoDetalleV3Props) {

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando información del evento...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header del Evento */}
            <EventoHeaderV3 evento={data.evento} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Principal (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Resumen Financiero */}
                    <ResumenFinancieroV3
                        cotizacion={data.cotizacion}
                        pagos={data.pagos}
                    />

                    {/* Lista de Servicios */}
                    <ServiciosListaV3
                        servicios={data.servicios}
                        onAgregarServicio={onAgregarServicio}
                        onEditarServicio={onEditarServicio}
                        isLoading={isLoading}
                    />

                    {/* Historial de Pagos */}
                    <HistorialPagosV3
                        pagos={data.pagos}
                        onAgregarPago={onAgregarPago}
                        onVerDetalle={onVerDetallePago}
                        onDescargarRecibo={onDescargarRecibo}
                        isLoading={isLoading}
                    />
                </div>

                {/* Columna Lateral (1/3) */}
                <div className="space-y-6">
                    {/* Acciones Rápidas */}
                    <AccionesRapidasV3
                        eventoId={data.evento.id}
                        cotizacionId={data.cotizacion.id}
                        onEditarEvento={onEditarEvento}
                        onGenerarContrato={onGenerarContrato}
                        onDescargarReporte={onDescargarReporte}
                        onCompartirEvento={onCompartirEvento}
                        onImprimirResumen={onImprimirResumen}
                        onConfiguracionAvanzada={onConfiguracionAvanzada}
                        isLoading={isLoading}
                    />

                    {/* Bitácora de Eventos */}
                    <BitacoraEventosV3
                        eventoId={data.evento.id}
                        bitacora={bitacora}
                        onAgregarEntrada={onAgregarEntradaBitacora}
                        onVerDetalle={onVerDetalleBitacora}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    )
}
