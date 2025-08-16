// Ruta: app/admin/dashboard/seguimiento/[eventoId]/components/FichaDetalleV3.tsx

'use client';

import React, { useState, useEffect } from 'react';
import type { EventoDetalleCompleto } from '@/app/admin/_lib/actions/seguimiento/seguimiento-detalle.schemas';

// Función utilitaria para formatear fechas de manera consistente
const formatearFecha = (fecha: Date): string => {
    return fecha.toISOString().replace('T', ' ').slice(0, 19);
};

// Componente para mostrar timestamps que se hidrata en el cliente
const TimestampDisplay = ({ fecha, label }: { fecha: Date; label: string }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <span>{label}: {formatearFecha(fecha)}</span>;
    }

    return <span>{label}: {fecha.toLocaleString()}</span>;
};

// Componentes temporales - serán reemplazados en FASE 3
// TODO: Importar componentes v3 reales cuando estén creados
// import EventoHeaderV3 from './v3/EventoHeaderV3';
// import ResumenFinancieroV3 from './v3/ResumenFinancieroV3';
// import EtapasGestionV3 from './v3/EtapasGestionV3';
// import AgendaSeguimientoV3 from './v3/AgendaSeguimientoV3';
// import ServiciosListaV3 from './v3/ServiciosListaV3';
// import PagosHistorialV3 from './v3/PagosHistorialV3';

interface FichaDetalleV3Props {
    datosIniciales: EventoDetalleCompleto;
}

/**
 * Componente principal refactorizado para detalle de evento
 * 
 * CARACTERÍSTICAS V3:
 * - Recibe todos los datos como props iniciales (server-side)
 * - No hace llamadas API al montar
 * - Estado local para actualizaciones en tiempo real
 * - Componentes modulares y reutilizables
 * - Optimistic updates para mejor UX
 */
export default function FichaDetalleV3({ datosIniciales }: FichaDetalleV3Props) {
    // Estado local para manejar actualizaciones
    const [datosEvento, setDatosEvento] = useState<EventoDetalleCompleto>(datosIniciales);
    const [isLoading, setIsLoading] = useState(false);

    // Función para actualizar datos específicos sin recargar toda la página
    const actualizarDatos = async (seccion: keyof EventoDetalleCompleto, nuevosDatos: any) => {
        setDatosEvento(prev => ({
            ...prev,
            [seccion]: nuevosDatos,
            ultimaActualizacion: new Date()
        }));
    };

    // Handler para recargar datos completos cuando sea necesario
    const recargarDatos = async () => {
        setIsLoading(true);
        try {
            // Aquí podríamos hacer una recarga completa si es necesario
            // const nuevosdatos = await obtenerEventoDetalleCompleto(datosEvento.evento.id);
            // setDatosEvento(nuevosdatos);
            console.log('🔄 Recarga de datos implementar si es necesario');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* PLACEHOLDER - Header con información básica del evento */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            📋 {datosEvento.evento.nombre}
                        </h1>
                        <p className="text-gray-600">
                            Cliente: {datosEvento.cliente?.nombre || 'Sin cliente'}
                        </p>
                        <p className="text-gray-600">
                            Tipo: {datosEvento.tipoEvento?.nombre || 'Sin tipo'}
                        </p>
                        <p className="text-gray-600">
                            Fecha evento: {datosEvento.evento.fecha_evento
                                ? new Date(datosEvento.evento.fecha_evento).toLocaleDateString()
                                : 'Sin fecha'}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            v3 - Server-side loaded
                        </span>
                        <button
                            onClick={recargarDatos}
                            disabled={isLoading}
                            className="ml-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                        >
                            {isLoading ? '🔄' : '↻'}
                        </button>
                    </div>
                </div>

                <div className="text-sm text-gray-500">
                    Etapa actual: <span className="font-medium">{datosEvento.etapaActual?.nombre || 'Sin etapa'}</span>
                </div>
            </div>

            {/* Grid principal con columnas responsivas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Columna izquierda - Información principal */}
                <div className="lg:col-span-2 space-y-6">

                    {/* PLACEHOLDER - Resumen financiero */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">💰 Resumen Financiero</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Precio total</p>
                                <p className="text-xl font-bold">${datosEvento.resumenFinanciero.precio.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total pagado</p>
                                <p className="text-xl font-bold text-green-600">${datosEvento.resumenFinanciero.totalPagado.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Balance</p>
                                <p className="text-xl font-bold text-orange-600">${datosEvento.resumenFinanciero.balance.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">% Pagado</p>
                                <p className="text-xl font-bold">{datosEvento.resumenFinanciero.porcentajePagado}%</p>
                            </div>
                        </div>
                    </div>

                    {/* PLACEHOLDER - Servicios */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">🛠️ Servicios ({datosEvento.serviciosDetalle.length})</h2>
                        <div className="space-y-2">
                            {datosEvento.serviciosDetalle.slice(0, 3).map((servicio, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <span>{servicio.nombre}</span>
                                    <span className="font-semibold">${servicio.precio.toLocaleString()}</span>
                                </div>
                            ))}
                            {datosEvento.serviciosDetalle.length > 3 && (
                                <p className="text-sm text-gray-500">... y {datosEvento.serviciosDetalle.length - 3} más</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Columna derecha - Seguimiento y acciones */}
                <div className="space-y-6">

                    {/* PLACEHOLDER - Agenda */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">📅 Agenda ({datosEvento.agenda.length})</h2>
                        <div className="space-y-2">
                            {datosEvento.agenda.slice(0, 3).map((item, index) => (
                                <div key={index} className="p-2 bg-gray-50 rounded">
                                    <p className="font-medium">{item.concepto}</p>
                                    <p className="text-sm text-gray-600">Tipo: {item.tipoNombre}</p>
                                    <p className="text-sm text-gray-600">Responsable: {item.responsableNombre}</p>
                                </div>
                            ))}
                            {datosEvento.agenda.length > 3 && (
                                <p className="text-sm text-gray-500">... y {datosEvento.agenda.length - 3} más</p>
                            )}
                        </div>
                    </div>

                    {/* PLACEHOLDER - Pagos */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">💳 Pagos ({datosEvento.pagos.length})</h2>
                        <div className="space-y-2">
                            {datosEvento.pagos.slice(0, 3).map((pago, index) => (
                                <div key={index} className="p-2 bg-gray-50 rounded">
                                    <div className="flex justify-between">
                                        <span className="font-medium">
                                            {pago.monto != null ? `$${pago.monto.toLocaleString()}` : 'Sin monto'}
                                        </span>
                                        <span className="text-sm text-gray-600">{pago.status}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{pago.metodo_pago}</p>
                                </div>
                            ))}
                            {datosEvento.pagos.length > 3 && (
                                <p className="text-sm text-gray-500">... y {datosEvento.pagos.length - 3} más</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer con metadatos */}
            <div className="text-sm text-gray-500 border-t pt-4">
                <div className="flex justify-between items-center">
                    <TimestampDisplay
                        fecha={datosEvento.fechaCargaDatos}
                        label="📊 Datos cargados"
                    />
                    <TimestampDisplay
                        fecha={datosEvento.ultimaActualizacion}
                        label="🔄 Última actualización"
                    />
                </div>
                <div className="mt-2 text-center">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        ✅ FASE 2 COMPLETADA - Server-side data loading implementado
                    </span>
                </div>
            </div>
        </div>
    );
}
