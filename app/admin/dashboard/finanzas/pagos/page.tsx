'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
    Calendar,
    Filter,
    Search,
    Download,
    Eye,
    CreditCard,
    AlertCircle,
    Trash2,
    CheckCircle,
    X
} from 'lucide-react';
import Link from 'next/link';
import { obtenerPagosEntrantes } from '@/app/admin/_lib/actions/finanzas';
import { eliminarPago } from '@/app/admin/_lib/actions/pagos';
import { cambiarStatusPago } from '@/app/admin/_lib/actions/seguimiento/pagos.actions';
import { PAGO_STATUS } from '@/app/admin/_lib/constants/status';
import { toast } from 'sonner';



interface PagoEntrante {
    id: string;
    concepto: string;
    monto: number;
    status: string;
    fecha: Date;
    cliente?: string;
    metodoPago?: string;
    eventoNombre?: string;
    eventoId?: string;
}

export default function PagosPage() {
    const [pagos, setPagos] = useState<PagoEntrante[]>([]);
    const [filtroMes, setFiltroMes] = useState<number>(new Date().getMonth() + 1);
    const [filtroAño, setFiltroAño] = useState<number>(new Date().getFullYear());
    const [isLoading, setIsLoading] = useState(true);
    const [eliminandoPago, setEliminandoPago] = useState<string | null>(null);
    const [pagosSeleccionados, setPagosSeleccionados] = useState<string[]>([]);
    const [eliminandoMultiples, setEliminandoMultiples] = useState(false);
    const [autorizandoPago, setAutorizandoPago] = useState<string | null>(null);

    // Estados para filtros
    const [terminoBusqueda, setTerminoBusqueda] = useState<string>('');
    const [soloPendientes, setSoloPendientes] = useState<boolean>(false);

    // Establecer el título de la página
    useEffect(() => {
        document.title = 'Pagos Entrantes';
    }, []);

    // Cargar pagos
    useEffect(() => {
        const cargarPagos = async () => {
            try {
                setIsLoading(true);
                // Limpiar selecciones al cambiar de período
                setPagosSeleccionados([]);
                const pagosData = await obtenerPagosEntrantes(filtroAño, filtroMes);
                setPagos(pagosData);
            } catch (error) {
                console.error('Error al cargar pagos:', error);
            } finally {
                setIsLoading(false);
            }
        };

        cargarPagos();
    }, [filtroMes, filtroAño]);

    const formatearMoneda = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };

    const formatearFecha = (fecha: Date) => {
        return fecha.toLocaleDateString('es-MX', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const obtenerBadgeStatus = (status: string) => {
        switch (status) {
            case PAGO_STATUS.PAID:
            case 'confirmed': // Legacy support
                return <Badge variant="success">Pagado</Badge>;
            case PAGO_STATUS.PENDING:
            case PAGO_STATUS.PENDIENTE:
                return <Badge variant="warning">Pendiente</Badge>;
            case 'processing':
                return <Badge variant="default">Procesando</Badge>;
            case PAGO_STATUS.FAILED:
                return <Badge variant="destructive">Fallido</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatearMetodoPago = (metodo: string | undefined) => {
        if (!metodo) return 'No especificado';

        switch (metodo.toLowerCase()) {
            case 'tarjeta_credito':
                return 'Tarjeta de crédito';
            case 'spei':
                return 'SPEI';
            case 'transferencia interbancaria':
                return 'Transferencia interbancaria';
            default:
                return metodo;
        }
    };

    const manejarAutorizarPago = async (pagoId: string, concepto: string) => {
        const confirmacion = confirm(
            `¿Estás seguro de que deseas autorizar el pago "${concepto}"?`
        );

        if (confirmacion) {
            try {
                setAutorizandoPago(pagoId);
                const resultado = await cambiarStatusPago(pagoId, PAGO_STATUS.PAID);

                if (resultado.success) {
                    // Actualizar el estado local del pago
                    setPagos(prevPagos =>
                        prevPagos.map(pago =>
                            pago.id === pagoId
                                ? { ...pago, status: PAGO_STATUS.PAID }
                                : pago
                        )
                    );

                    // Mostrar mensaje con detalles de los cambios
                    let mensaje = 'Pago autorizado exitosamente';
                    if (resultado.cambiosAdicionales) {
                        const cambios = resultado.cambiosAdicionales;
                        const detalles = [];
                        if (cambios.cotizacionActualizada) detalles.push('cotización aprobada');
                        if (cambios.eventoActualizado) detalles.push('evento aprobado');
                        if (cambios.eventoEtapaActualizada) detalles.push('movido a etapa APROBADO');
                        if (cambios.agendaActualizada) detalles.push('agenda confirmada');

                        if (detalles.length > 0) {
                            mensaje += ` - Cambios aplicados: ${detalles.join(', ')}`;
                        }
                    }

                    toast.success(mensaje);
                } else {
                    toast.error('Error al autorizar el pago: ' + resultado.error);
                }
            } catch (error) {
                console.error('Error al autorizar pago:', error);
                toast.error('Error al autorizar el pago');
            } finally {
                setAutorizandoPago(null);
            }
        }
    };

    const manejarEliminarPago = async (pagoId: string, concepto: string) => {
        const confirmacion = confirm(
            `¿Estás seguro de que deseas eliminar el pago "${concepto}"?\n\nEsta acción no se puede deshacer.`
        );

        if (confirmacion) {
            try {
                setEliminandoPago(pagoId);
                const resultado = await eliminarPago(pagoId);

                if (resultado.success) {
                    // Recargar la lista de pagos
                    setPagos(pagos.filter(p => p.id !== pagoId));
                    toast.success('Pago eliminado exitosamente');
                } else {
                    toast.error('Error al eliminar el pago: ' + resultado.error);
                }
            } catch (error) {
                console.error('Error al eliminar pago:', error);
                toast.error('Error al eliminar el pago');
            } finally {
                setEliminandoPago(null);
            }
        }
    };

    const manejarCancelarPago = async (pagoId: string, concepto: string) => {
        const confirmacion = confirm(
            `¿Estás seguro de que deseas cancelar el pago "${concepto}"?`
        );

        if (confirmacion) {
            try {
                setAutorizandoPago(pagoId);
                const resultado = await cambiarStatusPago(pagoId, PAGO_STATUS.FAILED);

                if (resultado.success) {
                    // Actualizar el estado local del pago
                    setPagos(prevPagos =>
                        prevPagos.map(pago =>
                            pago.id === pagoId
                                ? { ...pago, status: PAGO_STATUS.FAILED }
                                : pago
                        )
                    );
                    toast.success('Pago cancelado exitosamente');
                } else {
                    toast.error('Error al cancelar el pago: ' + resultado.error);
                }
            } catch (error) {
                console.error('Error al cancelar pago:', error);
                toast.error('Error al cancelar el pago');
            } finally {
                setAutorizandoPago(null);
            }
        }
    };

    const manejarVerEvento = (eventoId: string | undefined) => {
        console.log('🔍 manejarVerEvento - eventoId recibido:', eventoId);
        if (eventoId) {
            window.open(`/admin/dashboard/seguimiento/${eventoId}`, '_self');
        } else {
            toast.error('No hay evento asociado a este pago');
        }
    };

    const manejarSeleccionPago = (pagoId: string) => {
        setPagosSeleccionados(prev =>
            prev.includes(pagoId)
                ? prev.filter(id => id !== pagoId)
                : [...prev, pagoId]
        );
    };

    const manejarSeleccionarTodos = () => {
        const pagosFiltradosIds = pagosFiltrados.map(p => p.id);
        const todosFiltradosSeleccionados = pagosFiltradosIds.every(id => pagosSeleccionados.includes(id));

        if (todosFiltradosSeleccionados) {
            // Deseleccionar todos los filtrados
            setPagosSeleccionados(prev => prev.filter(id => !pagosFiltradosIds.includes(id)));
        } else {
            // Seleccionar todos los filtrados
            setPagosSeleccionados(prev => [...new Set([...prev, ...pagosFiltradosIds])]);
        }
    };

    const manejarEliminarSeleccionados = async () => {
        if (pagosSeleccionados.length === 0) return;

        const confirmacion = confirm(
            `¿Estás seguro de que deseas eliminar ${pagosSeleccionados.length} pagos seleccionados?\n\nEsta acción no se puede deshacer.`
        );

        if (confirmacion) {
            try {
                setEliminandoMultiples(true);

                // Eliminar uno por uno
                for (const pagoId of pagosSeleccionados) {
                    await eliminarPago(pagoId);
                }

                // Actualizar la lista
                setPagos(pagos.filter(p => !pagosSeleccionados.includes(p.id)));
                setPagosSeleccionados([]);
                toast.success(`${pagosSeleccionados.length} pagos eliminados exitosamente`);
            } catch (error) {
                console.error('Error al eliminar pagos:', error);
                toast.error('Error al eliminar algunos pagos');
            } finally {
                setEliminandoMultiples(false);
            }
        }
    };

    // Función para filtrar pagos
    const pagosFiltrados = pagos.filter(pago => {
        // Filtro de búsqueda por concepto y nombre de evento
        const cumpleBusqueda = terminoBusqueda === '' ||
            pago.concepto.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
            (pago.eventoNombre && pago.eventoNombre.toLowerCase().includes(terminoBusqueda.toLowerCase())) ||
            (pago.cliente && pago.cliente.toLowerCase().includes(terminoBusqueda.toLowerCase()));

        // Filtro de solo pendientes
        const cumplePendientes = !soloPendientes ||
            [PAGO_STATUS.PENDING, PAGO_STATUS.PENDIENTE, 'processing'].includes(pago.status as any);

        return cumpleBusqueda && cumplePendientes;
    });

    const totalPagos = pagosFiltrados.reduce((sum, pago) => sum + pago.monto, 0);
    const pagosPagados = pagosFiltrados.filter(p => [PAGO_STATUS.PAID, 'confirmed'].includes(p.status as any));
    const pagosPendientes = pagosFiltrados.filter(p => [PAGO_STATUS.PENDING, PAGO_STATUS.PENDIENTE, 'processing'].includes(p.status as any));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Pagos Entrantes
                    </h1>
                    <p className="text-zinc-400">
                        Gestión de ingresos por servicios
                    </p>
                </div>

                <div className="flex gap-2">
                    <div className="flex gap-2">
                        <select
                            value={filtroMes}
                            onChange={(e) => setFiltroMes(parseInt(e.target.value))}
                            className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(mes => (
                                <option key={mes} value={mes}>
                                    {new Date(2024, mes - 1).toLocaleDateString('es-MX', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                        <select
                            value={filtroAño}
                            onChange={(e) => setFiltroAño(parseInt(e.target.value))}
                            className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white"
                        >
                            {[2024, 2025, 2026].map(año => (
                                <option key={año} value={año}>{año}</option>
                            ))}
                        </select>
                    </div>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Controles de filtro */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        {/* Buscador */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar por concepto, evento o cliente..."
                                value={terminoBusqueda}
                                onChange={(e) => setTerminoBusqueda(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        {/* Toggle para solo pendientes */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="solo-pendientes"
                                checked={soloPendientes}
                                onChange={(e) => setSoloPendientes(e.target.checked)}
                                className="rounded border-zinc-600 text-yellow-500 focus:ring-yellow-500 bg-zinc-800"
                            />
                            <label htmlFor="solo-pendientes" className="text-sm text-zinc-300 cursor-pointer">
                                Solo pendientes
                            </label>
                        </div>

                        {/* Contador de resultados */}
                        <div className="text-sm text-zinc-400">
                            {pagosFiltrados.length} de {pagos.length} pagos
                        </div>
                    </div>

                    {/* Indicadores de filtros activos */}
                    {(terminoBusqueda || soloPendientes) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {terminoBusqueda && (
                                <Badge variant="outline" className="text-blue-400 border-blue-400">
                                    <Search className="w-3 h-3 mr-1" />
                                    "{terminoBusqueda}"
                                    <button
                                        onClick={() => setTerminoBusqueda('')}
                                        className="ml-2 hover:text-red-400"
                                    >
                                        ×
                                    </button>
                                </Badge>
                            )}
                            {soloPendientes && (
                                <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                                    <Filter className="w-3 h-3 mr-1" />
                                    Solo pendientes
                                    <button
                                        onClick={() => setSoloPendientes(false)}
                                        className="ml-2 hover:text-red-400"
                                    >
                                        ×
                                    </button>
                                </Badge>
                            )}
                            <button
                                onClick={() => {
                                    setTerminoBusqueda('');
                                    setSoloPendientes(false);
                                }}
                                className="text-xs text-zinc-400 hover:text-white underline"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-zinc-400">
                            Total del Mes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {formatearMoneda(totalPagos)}
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">
                            {pagos.length} transacciones
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-zinc-400">
                            Confirmados
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                            {formatearMoneda(pagosPagados.reduce((sum, p) => sum + p.monto, 0))}
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                            {pagosPagados.length} pagos
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-zinc-400">
                            Pendientes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-500">
                            {formatearMoneda(pagosPendientes.reduce((sum, p) => sum + p.monto, 0))}
                        </div>
                        <p className="text-xs text-yellow-600 mt-1">
                            {pagosPendientes.length} pendientes
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Alertas */}
            {pagosPendientes.length > 0 && (
                <Card className="bg-yellow-900/20 border-yellow-600">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-yellow-400" />
                            <span className="text-yellow-200">
                                Tienes {pagosPendientes.length} pagos pendientes de confirmación
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Lista de pagos */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-white">
                            Historial de Pagos - {new Date(filtroAño, filtroMes - 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                        </CardTitle>
                        {pagosSeleccionados.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-zinc-400">
                                    {pagosSeleccionados.length} seleccionados
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={manejarEliminarSeleccionados}
                                    disabled={eliminandoMultiples}
                                    className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                                >
                                    {eliminandoMultiples ? (
                                        <>
                                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Eliminando...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Eliminar Seleccionados
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                    {pagosFiltrados.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                            <input
                                type="checkbox"
                                checked={pagosFiltrados.length > 0 && pagosFiltrados.every(pago => pagosSeleccionados.includes(pago.id))}
                                onChange={manejarSeleccionarTodos}
                                className="rounded"
                            />
                            <span className="text-sm text-zinc-400">
                                Seleccionar todos los filtrados
                            </span>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4 animate-pulse">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-16 bg-zinc-800 rounded"></div>
                            ))}
                        </div>
                    ) : pagosFiltrados.length > 0 ? (
                        <div className="space-y-3">
                            {pagosFiltrados.map(pago => {
                                console.log('🔍 Renderizando pago:', { id: pago.id, eventoId: pago.eventoId, eventoNombre: pago.eventoNombre });
                                return (
                                    <div key={pago.id} className="flex items-center gap-3 p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={pagosSeleccionados.includes(pago.id)}
                                            onChange={() => manejarSeleccionPago(pago.id)}
                                            className="rounded"
                                        />
                                        <div className="flex-1 flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-medium text-white">{pago.concepto}</h3>
                                                    {obtenerBadgeStatus(pago.status)}
                                                </div>
                                                <div className="text-sm text-zinc-400 space-y-1">
                                                    <p>Cliente: {pago.cliente || 'No especificado'}</p>
                                                    <p>Evento: {pago.eventoNombre || 'No especificado'}</p>
                                                    <p>Método: {formatearMetodoPago(pago.metodoPago)}</p>
                                                    <p>Fecha: {formatearFecha(pago.fecha)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right space-y-2">
                                                <p className="text-2xl font-bold text-white">
                                                    {formatearMoneda(pago.monto)}
                                                </p>
                                                <div className="flex gap-2">
                                                    {/* Botón Ver Evento */}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            console.log('🔍 Click en Ver Evento - pago completo:', pago);
                                                            console.log('🔍 Click en Ver Evento - eventoId específico:', pago.eventoId);
                                                            manejarVerEvento(pago.eventoId);
                                                        }}
                                                        className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                                                    >
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Ver Evento
                                                    </Button>

                                                    {/* Botón de autorizar para pagos SPEI pendientes */}
                                                    {(pago.status === PAGO_STATUS.PENDING || pago.status === PAGO_STATUS.PENDIENTE) &&
                                                        (pago.metodoPago === 'spei' || pago.metodoPago === 'transferencia interbancaria') && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => manejarAutorizarPago(pago.id, pago.concepto)}
                                                                disabled={autorizandoPago === pago.id}
                                                                className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white disabled:opacity-50"
                                                            >
                                                                {autorizandoPago === pago.id ? (
                                                                    <>
                                                                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                                        Autorizando...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                                        Autorizar
                                                                    </>
                                                                )}
                                                            </Button>
                                                        )}

                                                    {/* Botón Cancelar Pago */}
                                                    {(pago.status === PAGO_STATUS.PENDING || pago.status === PAGO_STATUS.PENDIENTE || pago.status === 'processing' || pago.status === PAGO_STATUS.PAID || pago.status === 'confirmed') && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => manejarCancelarPago(pago.id, pago.concepto)}
                                                            disabled={autorizandoPago === pago.id}
                                                            className="border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white disabled:opacity-50"
                                                        >
                                                            {autorizandoPago === pago.id ? (
                                                                <>
                                                                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                                    Cancelando...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <X className="w-4 h-4 mr-2" />
                                                                    Cancelar
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}

                                                    {/* Botón Eliminar */}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => manejarEliminarPago(pago.id, pago.concepto)}
                                                        disabled={eliminandoPago === pago.id}
                                                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white disabled:opacity-50"
                                                    >
                                                        {eliminandoPago === pago.id ? (
                                                            <>
                                                                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                                Eliminando...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Eliminar
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : pagos.length > 0 ? (
                        // Hay pagos pero no coinciden con los filtros
                        <div className="text-center py-12">
                            <Filter className="h-16 w-16 mx-auto mb-4 text-zinc-600" />
                            <h3 className="text-lg font-medium text-zinc-300 mb-2">
                                No se encontraron pagos
                            </h3>
                            <p className="text-zinc-500 mb-4">
                                No hay pagos que coincidan con los filtros aplicados
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setTerminoBusqueda('');
                                    setSoloPendientes(false);
                                }}
                                className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white"
                            >
                                Limpiar filtros
                            </Button>
                        </div>
                    ) : (
                        // No hay pagos en absoluto
                        <div className="text-center py-12">
                            <CreditCard className="h-16 w-16 mx-auto mb-4 text-zinc-600" />
                            <h3 className="text-lg font-medium text-zinc-300 mb-2">
                                No hay pagos registrados
                            </h3>
                            <p className="text-zinc-500">
                                Los pagos aparecerán aquí cuando se registren en el sistema
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
