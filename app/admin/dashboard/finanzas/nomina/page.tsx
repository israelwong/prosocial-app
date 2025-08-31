'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
    Users,
    Clock,
    CheckCircle,
    AlertCircle,
    Calendar,
    DollarSign,
    Filter,
    Download,
    Trash2,
    X,
    Check,
    CheckSquare
} from 'lucide-react';
import Link from 'next/link';
import { obtenerResumenNomina } from '@/app/admin/_lib/actions/finanzas';
import { autorizarPago, cancelarPago, eliminarNomina } from '@/app/admin/_lib/actions/seguimiento/nomina.actions';
import { toast } from 'sonner';

interface NominaResumen {
    totalPendiente: number;
    totalAutorizado: number;
    totalPagado: number;
    cantidadPendiente: number;
    cantidadAutorizada: number;
    cantidadPagada: number;
    proximosPagos: Array<{
        id: string;
        usuario: string;
        monto: number;
        concepto: string;
        fechaAsignacion: Date;
        fechaPago?: Date;
        cliente?: string;
        evento?: string;
        fechaEvento?: Date;
        eventoId?: string;
    }>;
}

export default function NominaPage() {
    const [resumen, setResumen] = useState<NominaResumen>({
        totalPendiente: 0,
        totalAutorizado: 0,
        totalPagado: 0,
        cantidadPendiente: 0,
        cantidadAutorizada: 0,
        cantidadPagada: 0,
        proximosPagos: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [autorizando, setAutorizando] = useState<string | null>(null);
    const [cancelando, setCancelando] = useState<string | null>(null);
    const [eliminando, setEliminando] = useState<string | null>(null);
    const [pagosSeleccionados, setPagosSeleccionados] = useState<string[]>([]);
    const [autorizandoTodos, setAutorizandoTodos] = useState(false);

    // Establecer el título de la página
    useEffect(() => {
        document.title = 'Nómina - ProSocial Admin';
    }, []);

    // Cargar resumen de nómina
    useEffect(() => {
        const cargarResumen = async () => {
            try {
                setIsLoading(true);
                // Limpiar selecciones al recargar
                setPagosSeleccionados([]);
                const resumenData = await obtenerResumenNomina();
                setResumen(resumenData);
            } catch (error) {
                console.error('Error al cargar resumen de nómina:', error);
            } finally {
                setIsLoading(false);
            }
        };

        cargarResumen();
    }, []);

    const formatearMoneda = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };

    const formatearFecha = (fecha: Date | string) => {
        const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
        return date.toLocaleDateString('es-MX', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const manejarAutorizacion = async (nominaId: string, eventoId?: string) => {
        try {
            setAutorizando(nominaId);
            if (eventoId) {
                // TODO: Obtener el userId del usuario actual logueado
                const currentUserId = 'admin-user-id'; // Placeholder
                await autorizarPago(nominaId, currentUserId, eventoId);
                // Recargar datos
                const resumenData = await obtenerResumenNomina();
                setResumen(resumenData);
                toast.success('Pago autorizado exitosamente');
            } else {
                toast.error('Error: No se encontró el ID del evento para este pago');
            }
        } catch (error) {
            console.error('Error al autorizar pago:', error);
            toast.error('Error al autorizar el pago');
        } finally {
            setAutorizando(null);
        }
    };

    const manejarCancelacion = async (nominaId: string, eventoId?: string, concepto?: string) => {
        const confirmacion = confirm(
            `¿Estás seguro de que deseas cancelar el pago "${concepto}"?\n\nEsta acción cambiará el estado a cancelado.`
        );

        if (confirmacion) {
            try {
                setCancelando(nominaId);
                if (eventoId) {
                    await cancelarPago(nominaId, eventoId);
                    // Recargar datos
                    const resumenData = await obtenerResumenNomina();
                    setResumen(resumenData);
                    toast.success('Pago cancelado exitosamente');
                } else {
                    toast.error('Error: No se encontró el ID del evento para este pago');
                }
            } catch (error) {
                console.error('Error al cancelar pago:', error);
                toast.error('Error al cancelar el pago');
            } finally {
                setCancelando(null);
            }
        }
    };

    const manejarEliminacion = async (nominaId: string, concepto?: string) => {
        const confirmacion = confirm(
            `¿Estás seguro de que deseas eliminar permanentemente el pago "${concepto}"?\n\nEsta acción no se puede deshacer.`
        );

        if (confirmacion) {
            try {
                setEliminando(nominaId);
                await eliminarNomina(nominaId);
                // Recargar datos
                const resumenData = await obtenerResumenNomina();
                setResumen(resumenData);
                toast.success('Pago eliminado exitosamente');
            } catch (error) {
                console.error('Error al eliminar pago:', error);
                toast.error('Error al eliminar el pago');
            } finally {
                setEliminando(null);
            }
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
        setPagosSeleccionados(
            pagosSeleccionados.length === resumen.proximosPagos.length
                ? []
                : resumen.proximosPagos.map(p => p.id)
        );
    };

    const manejarAutorizarTodos = async () => {
        if (pagosSeleccionados.length === 0) {
            toast.error('Selecciona al menos un pago para autorizar');
            return;
        }

        const confirmacion = confirm(
            `¿Estás seguro de que deseas autorizar ${pagosSeleccionados.length} pagos seleccionados?`
        );

        if (confirmacion) {
            try {
                setAutorizandoTodos(true);

                // Autorizar uno por uno
                for (const pagoId of pagosSeleccionados) {
                    const pago = resumen.proximosPagos.find(p => p.id === pagoId);
                    if (pago && pago.eventoId) {
                        const currentUserId = 'admin-user-id'; // Placeholder
                        await autorizarPago(pagoId, currentUserId, pago.eventoId);
                    }
                }

                // Recargar datos
                const resumenData = await obtenerResumenNomina();
                setResumen(resumenData);
                setPagosSeleccionados([]);
                toast.success(`${pagosSeleccionados.length} pagos autorizados exitosamente`);
            } catch (error) {
                console.error('Error al autorizar pagos:', error);
                toast.error('Error al autorizar algunos pagos');
            } finally {
                setAutorizandoTodos(false);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-zinc-800 rounded-lg"></div>
                    ))}
                </div>
                <div className="h-64 bg-zinc-800 rounded-lg"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Gestión de Nómina
                    </h1>
                    <p className="text-zinc-400">
                        Administración de pagos al personal
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtros
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Reporte
                    </Button>
                </div>
            </div>

            {/* Métricas de nómina */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pendientes */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">
                            Pagos Pendientes
                        </CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-500">
                            {formatearMoneda(resumen.totalPendiente)}
                        </div>
                        <p className="text-xs text-yellow-600 mt-1">
                            {resumen.cantidadPendiente} personas
                        </p>
                    </CardContent>
                </Card>

                {/* Autorizados */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">
                            Autorizados
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">
                            {formatearMoneda(resumen.totalAutorizado)}
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                            {resumen.cantidadAutorizada} personas
                        </p>
                    </CardContent>
                </Card>

                {/* Pagados */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">
                            Pagados
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                            {formatearMoneda(resumen.totalPagado)}
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                            {resumen.cantidadPagada} personas
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Alertas */}
            {resumen.cantidadPendiente > 0 && (
                <Card className="bg-yellow-900/20 border-yellow-600">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-yellow-400" />
                            <span className="text-yellow-200">
                                Hay {resumen.cantidadPendiente} pagos de nómina pendientes de autorización
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Próximos pagos */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-white">Próximos Pagos Pendientes</CardTitle>
                        {pagosSeleccionados.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-zinc-400">
                                    {pagosSeleccionados.length} seleccionados
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={manejarAutorizarTodos}
                                    disabled={autorizandoTodos}
                                    className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                                >
                                    {autorizandoTodos ? (
                                        <>
                                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Autorizando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckSquare className="w-4 h-4 mr-2" />
                                            Autorizar Seleccionados
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                    {resumen.proximosPagos.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                            <input
                                type="checkbox"
                                checked={pagosSeleccionados.length === resumen.proximosPagos.length}
                                onChange={manejarSeleccionarTodos}
                                className="rounded"
                            />
                            <span className="text-sm text-zinc-400">
                                Seleccionar todos
                            </span>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    {resumen.proximosPagos.length > 0 ? (
                        <div className="space-y-4">
                            {resumen.proximosPagos.map(pago => (
                                <div key={pago.id} className="flex items-center gap-3 p-6 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={pagosSeleccionados.includes(pago.id)}
                                        onChange={() => manejarSeleccionPago(pago.id)}
                                        className="rounded"
                                    />
                                    <div className="flex-1 flex items-center justify-between">
                                        <div className="flex-1">
                                            {/* Header: Cliente - Evento - Fecha Evento */}
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium text-white text-lg">
                                                        {pago.cliente}
                                                    </h3>
                                                    <span className="text-zinc-500">-</span>
                                                    <span className="text-zinc-300">
                                                        {pago.evento}
                                                    </span>
                                                    {pago.fechaEvento && (
                                                        <>
                                                            <span className="text-zinc-500">-</span>
                                                            <span className="text-zinc-400 text-sm">
                                                                {formatearFecha(pago.fechaEvento)}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                <Badge variant="warning">Pendiente</Badge>
                                            </div>

                                            {/* Información del concepto y usuario */}
                                            <div className="text-sm text-zinc-400 space-y-2 mb-3">
                                                <p><span className="font-medium">Concepto:</span> {pago.concepto}</p>
                                                <p><span className="font-medium">Personal:</span> {pago.usuario}</p>
                                            </div>

                                            {/* Fechas */}
                                            <div className="flex items-center gap-6 text-sm text-zinc-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Asignado: {formatearFecha(pago.fechaAsignacion)}</span>
                                                </div>
                                                {pago.fechaPago && (
                                                    <div className="flex items-center gap-1">
                                                        <Check className="w-4 h-4" />
                                                        <span>Pagado: {formatearFecha(pago.fechaPago)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right space-y-3">
                                            <div className="p-3 rounded-lg">
                                                <p className="text-2xl font-bold text-green-400">
                                                    {formatearMoneda(pago.monto)}
                                                </p>
                                                <p className="text-xs text-zinc-500">Monto a pagar</p>
                                            </div>
                                            <div className="flex gap-2 flex-wrap justify-end">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => manejarAutorizacion(pago.id, pago.eventoId)}
                                                    disabled={autorizando === pago.id}
                                                    className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                                                >
                                                    {autorizando === pago.id ? (
                                                        <>
                                                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                            Autorizando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check className="w-4 h-4 mr-2" />
                                                            Autorizar
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => manejarCancelacion(pago.id, pago.eventoId, pago.concepto)}
                                                    disabled={cancelando === pago.id}
                                                    className="border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white"
                                                >
                                                    {cancelando === pago.id ? (
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
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => manejarEliminacion(pago.id, pago.concepto)}
                                                    disabled={eliminando === pago.id}
                                                    className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                                                >
                                                    {eliminando === pago.id ? (
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
                                                <Link href={`/admin/dashboard/finanzas/nomina/${pago.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        Ver detalle
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Users className="h-16 w-16 mx-auto mb-4 text-zinc-600" />
                            <h3 className="text-lg font-medium text-zinc-300 mb-2">
                                No hay pagos pendientes
                            </h3>
                            <p className="text-zinc-500">
                                Todos los pagos de nómina están al día
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Acciones rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/admin/dashboard/finanzas/nomina/historial">
                    <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer">
                        <CardContent className="p-6 text-center">
                            <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                            <h3 className="font-semibold text-white">Historial de Pagos</h3>
                            <p className="text-sm text-zinc-400">Ver pagos anteriores</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/dashboard/seguimiento">
                    <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer">
                        <CardContent className="p-6 text-center">
                            <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
                            <h3 className="font-semibold text-white">Gestión de Eventos</h3>
                            <p className="text-sm text-zinc-400">Asignar servicios</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
