// Página de testing para validar las nuevas actions
import React from 'react'
import { obtenerEventoDetalleCompleto } from '@/app/admin/_lib/actions/seguimiento'

interface Props {
    searchParams: Promise<{ eventoId?: string }>
}

export default async function TestSeguimientoDetalle({
    searchParams
}: {
    searchParams: Promise<{ eventoId?: string }>
}) {
    const params = await searchParams;
    const eventoId = params.eventoId || '1'; // ID por defecto para prueba

    try {
        console.log('Cargando datos para evento:', eventoId);
        const datos = await obtenerEventoDetalleCompleto(eventoId);

        // 🔍 DEBUG: Vamos a ver exactamente qué datos llegan
        console.log('📊 DATOS COMPLETOS:', JSON.stringify({
            evento: datos.evento.nombre,
            cotizacion: {
                existe: !!datos.cotizacion,
                id: datos.cotizacion?.id,
                status: datos.cotizacion?.status,
                precio: datos.cotizacion?.precio
            },
            servicios: {
                cantidad: datos.serviciosDetalle.length,
                lista: datos.serviciosDetalle.map(s => ({
                    id: s.id,
                    nombre: s.nombre,
                    precio: s.precio,
                    status: s.status
                }))
            },
            pagos: {
                cantidad: datos.pagos.length,
                lista: datos.pagos.map((p: any) => ({
                    id: p.id,
                    monto: p.monto,
                    cantidad: p.cantidad,
                    status: p.status,
                    metodoPago: p.metodoPago,
                    concepto: p.concepto,
                    campos: Object.keys(p)  // Ver qué campos tiene realmente
                }))
            }
        }, null, 2));

        return (
            <div className="p-4 space-y-6">
                <h1 className="text-2xl font-bold text-green-600">✅ Datos cargados exitosamente</h1>

                <div className="bg-gray-100 p-4 rounded">
                    <h2 className="font-semibold">Información básica:</h2>
                    <p>Evento: {datos.evento.nombre}</p>
                    <p>Cliente: {datos.cliente?.nombre || 'Sin cliente'}</p>
                    <p>Tipo: {datos.tipoEvento?.nombre || 'Sin tipo'}</p>
                    <p>Fecha: {datos.evento.fecha_evento ? new Date(datos.evento.fecha_evento).toLocaleDateString() : 'Sin fecha'}</p>
                </div>

                <div className="bg-blue-100 p-4 rounded">
                    <h2 className="font-semibold">Resumen financiero:</h2>
                    <p>Precio: ${datos.resumenFinanciero.precio.toLocaleString()}</p>
                    <p>Pagado: ${datos.resumenFinanciero.totalPagado.toLocaleString()}</p>
                    <p>Balance: ${datos.resumenFinanciero.balance.toLocaleString()}</p>
                    <p>Porcentaje pagado: {datos.resumenFinanciero.porcentajePagado}%</p>
                    <p>Cantidad de pagos: {datos.resumenFinanciero.cantidadPagos}</p>
                </div>

                <div className="bg-orange-100 p-4 rounded">
                    <h2 className="font-semibold">📄 Información de cotización:</h2>
                    {datos.cotizacion ? (
                        <div>
                            <p>ID: {datos.cotizacion.id}</p>
                            <p>Status: {datos.cotizacion.status}</p>
                            <p>Precio total: ${datos.cotizacion.precio?.toLocaleString() || '0'}</p>
                            <p>Condición comercial: {datos.condicionComercial || 'Sin condición'}</p>
                            <p>Fecha creación: {datos.cotizacion.createdAt ? new Date(datos.cotizacion.createdAt).toLocaleDateString() : 'Sin fecha'}</p>
                        </div>
                    ) : (
                        <p>No hay cotización aprobada</p>
                    )}
                </div>

                <div className="bg-yellow-100 p-4 rounded">
                    <h2 className="font-semibold">Agenda ({datos.agenda.length} entradas):</h2>
                    {datos.agenda.slice(0, 3).map((item: any, index: number) => (
                        <div key={index} className="border-b py-2">
                            <p><strong>{item.titulo}</strong></p>
                            <p>Tipo: {item.tipoNombre}</p>
                            <p>Responsable: {item.responsableNombre}</p>
                            <p>Status: {item.statusDisplay}</p>
                        </div>
                    ))}
                    {datos.agenda.length > 3 && (
                        <p className="text-sm text-gray-500">... y {datos.agenda.length - 3} más</p>
                    )}
                </div>

                <div className="bg-green-100 p-4 rounded">
                    <h2 className="font-semibold">📋 Servicios de la cotización ({datos.serviciosDetalle.length}):</h2>
                    {datos.serviciosDetalle.slice(0, 5).map((servicio: any, index: number) => (
                        <div key={index} className="border-b py-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p><strong>{servicio.nombre}</strong></p>
                                    <p className="text-sm text-gray-600">Categoría: {servicio.categoriaNombre}</p>
                                    <p className="text-sm text-gray-600">Responsable: {servicio.responsableNombre || 'Sin asignar'}</p>
                                    <p className="text-sm text-gray-600">Estado: {servicio.statusDisplay}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">${servicio.precio.toLocaleString()}</p>
                                    <p className="text-sm text-gray-600">Cant: {servicio.cantidad}</p>
                                    <p className="text-sm font-medium">Subtotal: ${servicio.subtotal.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {datos.serviciosDetalle.length > 5 && (
                        <p className="text-sm text-gray-500">... y {datos.serviciosDetalle.length - 5} más servicios</p>
                    )}
                </div>

                <div className="bg-purple-100 p-4 rounded">
                    <h2 className="font-semibold">💳 Historial de pagos ({datos.pagos.length}):</h2>
                    {datos.pagos.slice(0, 4).map((pago: any, index: number) => (
                        <div key={index} className="border-b py-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p><strong>${pago.cantidad ? pago.cantidad.toLocaleString() : 'Sin monto'}</strong></p>
                                    <p className="text-sm text-gray-600">Método: {pago.metodoPago}</p>
                                    <p className="text-sm text-gray-600">Concepto: {pago.concepto || 'Sin concepto'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">{pago.fechaFormateada}</p>
                                    <p className="text-sm font-medium">Estado: {pago.statusDisplay}</p>
                                    <p className="text-sm text-gray-600">Tipo: {pago.tipoTransaccionDisplay}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {datos.pagos.length > 4 && (
                        <p className="text-sm text-gray-500">... y {datos.pagos.length - 4} más pagos</p>
                    )}
                </div>

                <div className="bg-red-100 p-4 rounded">
                    <h2 className="font-semibold">🔍 DEBUG - Datos RAW:</h2>
                    <details>
                        <summary className="cursor-pointer font-medium">Ver datos de cotización</summary>
                        <pre className="text-xs bg-gray-100 p-2 mt-2 overflow-auto">
                            {JSON.stringify(datos.cotizacion, null, 2)}
                        </pre>
                    </details>
                    <details>
                        <summary className="cursor-pointer font-medium">Ver servicios detalle</summary>
                        <pre className="text-xs bg-gray-100 p-2 mt-2 overflow-auto">
                            {JSON.stringify(datos.serviciosDetalle, null, 2)}
                        </pre>
                    </details>
                    <details>
                        <summary className="cursor-pointer font-medium">Ver pagos</summary>
                        <pre className="text-xs bg-gray-100 p-2 mt-2 overflow-auto">
                            {JSON.stringify(datos.pagos, null, 2)}
                        </pre>
                    </details>
                </div>

                <p className="text-sm text-gray-500">
                    Cargado: {datos.fechaCargaDatos.toLocaleString()}
                </p>
            </div>
        );

    } catch (error) {
        console.error('Error cargando datos:', error);
        return (
            <div className="p-4">
                <h1 className="text-2xl font-bold text-red-600">❌ Error de carga</h1>
                <p className="text-red-500">Error: {error instanceof Error ? error.message : 'Error desconocido'}</p>
                <p className="text-sm text-gray-500">Evento ID: {eventoId}</p>
            </div>
        );
    }
}