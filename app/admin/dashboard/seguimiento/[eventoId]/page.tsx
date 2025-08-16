import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { obtenerEventoDetalleCompleto } from '@/app/admin/_lib/actions/seguimiento/seguimiento-detalle.actions'
import { HeaderSimple } from '@/app/admin/_components/seguimiento-detalle-v3/HeaderSimple'
import { DetallesCliente } from '@/app/admin/_components/seguimiento-detalle-v3/DetallesCliente'
import { DetallesEvento } from '@/app/admin/_components/seguimiento-detalle-v3/DetallesEvento'
import { BitacoraSimple } from '@/app/admin/_components/seguimiento-detalle-v3/BitacoraSimple'
import { BalanceFinancieroPlaceholder } from '@/app/admin/_components/seguimiento-detalle-v3/BalanceFinancieroPlaceholder'
import { ServiciosAsociadosPlaceholder } from '@/app/admin/_components/seguimiento-detalle-v3/ServiciosAsociadosPlaceholder'

export const metadata: Metadata = {
    title: 'Detalle del evento',
}

interface PageProps {
    params: Promise<{ eventoId: string }>
}

export default async function Page({ params }: PageProps) {
    try {
        const { eventoId } = await params;

        // Cargar todos los datos del evento en el servidor
        console.log('🔄 Cargando datos del evento en el servidor:', eventoId);
        const datos = await obtenerEventoDetalleCompleto(eventoId);

        // Convertir datos para compatibilidad con componentes
        const clienteData = datos.cliente ? {
            id: datos.cliente.id,
            nombre: datos.cliente.nombre || undefined,
            telefono: datos.cliente.telefono || undefined,
            email: datos.cliente.email || undefined,
            direccion: datos.cliente.direccion || undefined
        } : null

        const eventoData = datos.evento ? {
            id: datos.evento.id,
            nombre: datos.evento.nombre || undefined,
            fecha_evento: datos.evento.fecha_evento,
            status: datos.evento.status || undefined,
            createdAt: datos.evento.createdAt,
            updatedAt: datos.evento.updatedAt
        } : null

        // Mostrar datos con componentes V3 simples
        return (
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Header Simple */}
                <HeaderSimple
                    eventoNombre={datos.evento?.nombre || 'Evento sin nombre'}
                    eventoId={eventoId}
                    clienteNombre={datos.cliente?.nombre || undefined}
                    tipoEvento={datos.tipoEvento?.nombre || undefined}
                    status={datos.evento?.status || undefined}
                    fechaEvento={datos.evento?.fecha_evento}
                />

                {/* Grid de información */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Detalles del Cliente */}
                    <DetallesCliente cliente={clienteData} />

                    {/* Detalles del Evento */}
                    <DetallesEvento
                        evento={eventoData}
                        tipoEvento={datos.tipoEvento}
                        etapa={null} // Placeholder hasta implementar
                    />
                </div>

                {/* Grid de información financiera y servicios */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Balance Financiero (Placeholder) */}
                    <BalanceFinancieroPlaceholder
                        cotizacion={datos.cotizacion}
                        totalPagos={datos.pagos?.reduce((sum, pago) => sum + (pago.monto || 0), 0) || 0}
                        numeroPagos={datos.pagos?.length || 0}
                    />

                    {/* Servicios Asociados (Placeholder) */}
                    <ServiciosAsociadosPlaceholder
                        servicios={datos.serviciosDetalle}
                    />
                </div>

                {/* Bitácora (Placeholder hasta implementar) */}
                <BitacoraSimple bitacora={null} />

                {/* Debug Data (Colapsable) */}
                <details className="bg-gray-50 rounded-lg p-4">
                    <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                        🔍 Ver estructura de datos completa (debug)
                    </summary>
                    <pre className="mt-4 text-xs overflow-auto bg-white p-4 rounded border">
                        {JSON.stringify(datos, null, 2)}
                    </pre>
                </details>
            </div>
        );

    } catch (error) {
        console.error('❌ Error cargando página de detalle:', error);
        notFound();
    }
}