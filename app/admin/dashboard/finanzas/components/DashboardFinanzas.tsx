'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { formatearMoneda } from '@/app/admin/_lib/utils/moneda';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Users,
    FileText,
    CreditCard,
    BarChart3,
    ArrowRight,
    Activity,
    PieChart,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { obtenerPagosEntrantes, obtenerMetricasDelMes, obtenerProyeccionFinanciera } from '@/app/admin/_lib/actions/finanzas';

interface UltimoPago {
    id: string;
    concepto: string;
    monto: number;
    status: string;
    fecha: Date;
    cliente?: string;
    eventoNombre?: string;
}

interface MetricasFinancieras {
    ingresos: {
        total: number;
        cantidad: number;
        cambioMesAnterior: number;
    };
    nomina: {
        total: number;
        cantidad: number;
        pendiente: number;
    };
    gastos: {
        total: number;
        cantidad: number;
        cambioMesAnterior: number;
    };
    balance: {
        neto: number;
        utilidadBruta: number;
        porcentajeMargen: number;
    };
}

interface ProyeccionFinanciera {
    mesActual: {
        año: number;
        mes: number;
        nombre: string;
    };
    ingresosCobrados: {
        total: number;
        cantidad: number;
    };
    pendientesPorCobrar: {
        total: number;
        cantidad: number;
    };
    pagosProgramados: {
        total: number;
        cantidad: number;
    };
    utilidadProyectada: {
        bruta: number;
        porcentaje: number;
    };
}

export default function DashboardFinanzas() {
    const [ultimosPagos, setUltimosPagos] = useState<UltimoPago[]>([]);
    const [metricas, setMetricas] = useState<MetricasFinancieras>({
        ingresos: { total: 0, cantidad: 0, cambioMesAnterior: 0 },
        nomina: { total: 0, cantidad: 0, pendiente: 0 },
        gastos: { total: 0, cantidad: 0, cambioMesAnterior: 0 },
        balance: { neto: 0, utilidadBruta: 0, porcentajeMargen: 0 }
    });
    const [proyeccion, setProyeccion] = useState<ProyeccionFinanciera | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Establecer título de la página
    useEffect(() => {
        document.title = 'Dashboard Financiero - ProSocial Admin';
    }, []);

    // Cargar datos del dashboard
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setIsLoading(true);
                const fechaActual = new Date();
                const año = fechaActual.getFullYear();
                const mes = fechaActual.getMonth() + 1;

                // Cargar últimos pagos
                const pagosData = await obtenerPagosEntrantes(año, mes);
                const ultimosPagosData = pagosData.slice(0, 5).map(pago => ({
                    id: pago.id,
                    concepto: pago.concepto,
                    monto: pago.monto,
                    status: pago.status,
                    fecha: pago.fecha,
                    cliente: pago.cliente,
                    eventoNombre: pago.eventoNombre
                }));
                setUltimosPagos(ultimosPagosData);

                // Cargar métricas del mes usando datos reales y adaptarlas
                const metricasRaw = await obtenerMetricasDelMes(año, mes);
                const totalNomina = metricasRaw.nominaTotal || 0;
                const totalGastos = 0; // TODO: Implementar gastos del mes
                const totalIngresos = metricasRaw.ingresosCobrados || 0;
                const balanceNeto = totalIngresos - totalNomina - totalGastos;
                const utilidadBruta = totalIngresos - totalGastos;
                const margen = totalIngresos > 0 ? (utilidadBruta / totalIngresos) * 100 : 0;

                setMetricas({
                    ingresos: {
                        total: totalIngresos,
                        cantidad: metricasRaw.cantidadPagosCobrados,
                        cambioMesAnterior: 0 // TODO: Calcular cambio vs mes anterior 
                    },
                    nomina: {
                        total: totalNomina,
                        cantidad: metricasRaw.cantidadNominaTotal,
                        pendiente: metricasRaw.nominaPendiente
                    },
                    gastos: {
                        total: totalGastos,
                        cantidad: 0,
                        cambioMesAnterior: 0
                    },
                    balance: {
                        neto: balanceNeto,
                        utilidadBruta: utilidadBruta,
                        porcentajeMargen: margen
                    }
                });

                // Cargar proyección financiera usando datos reales y adaptarla
                const proyeccionRaw = await obtenerProyeccionFinanciera(año, mes);
                const utilidadProyectadaBruta = proyeccionRaw.ingresosCobrados.total + proyeccionRaw.pendientesPorCobrar.total - proyeccionRaw.pagosProgramados.total;
                const totalProyectado = proyeccionRaw.ingresosCobrados.total + proyeccionRaw.pendientesPorCobrar.total;
                const margenProyectado = totalProyectado > 0 ? (utilidadProyectadaBruta / totalProyectado) * 100 : 0;

                setProyeccion({
                    ...proyeccionRaw,
                    utilidadProyectada: {
                        bruta: utilidadProyectadaBruta,
                        porcentaje: margenProyectado
                    }
                });

            } catch (error) {
                console.error('Error al cargar datos del dashboard:', error);
            } finally {
                setIsLoading(false);
            }
        };

        cargarDatos();
    }, []);

    const obtenerBadgeStatus = (status: string) => {
        switch (status) {
            case 'paid':
            case 'confirmed':
                return <Badge variant="success">Pagado</Badge>;
            case 'pending':
            case 'pendiente':
                return <Badge variant="warning">Pendiente</Badge>;
            case 'processing':
                return <Badge variant="default">Procesando</Badge>;
            case 'failed':
                return <Badge variant="destructive">Fallido</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6 bg-zinc-900 min-h-screen p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-100">Dashboard Financiero</h1>
                        <p className="text-zinc-400">
                            Resumen financiero y gestión de recursos
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-zinc-800 rounded-lg border border-zinc-700"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 bg-zinc-900 min-h-screen p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-100">Dashboard Financiero</h1>
                    <p className="text-zinc-400">
                        Resumen financiero y proyecciones del mes
                    </p>
                </div>
                <div className="text-sm text-zinc-500">
                    {proyeccion?.mesActual.nombre} {proyeccion?.mesActual.año}
                </div>
            </div>

            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Ingresos */}
                <Link href="/admin/dashboard/finanzas/pagos">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent className="flex flex-col justify-between h-full">
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {formatearMoneda(metricas.ingresos.total)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {metricas.ingresos.cantidad} transacciones
                                </p>
                            </div>
                            <div className="flex items-center mt-2">
                                {metricas.ingresos.cambioMesAnterior >= 0 ? (
                                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                                ) : (
                                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                                )}
                                <span className={`text-xs ${metricas.ingresos.cambioMesAnterior >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {Math.abs(metricas.ingresos.cambioMesAnterior)}% vs mes anterior
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* Nómina */}
                <Link href="/admin/dashboard/finanzas/nomina">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Nómina</CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent className="flex flex-col justify-between h-full">
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {formatearMoneda(metricas.nomina.total)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {metricas.nomina.cantidad} pagos realizados
                                </p>
                            </div>
                            <div className="flex items-center mt-2 min-h-[20px]">
                                {metricas.nomina.pendiente > 0 ? (
                                    <>
                                        <AlertCircle className="h-3 w-3 text-yellow-500 mr-1" />
                                        <span className="text-xs text-yellow-600">
                                            {formatearMoneda(metricas.nomina.pendiente)} pendiente
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-xs text-green-600">
                                        Todo al día
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* Gastos */}
                <Link href="/admin/dashboard/finanzas/gastos">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Gastos</CardTitle>
                            <FileText className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent className="flex flex-col justify-between h-full">
                            <div>
                                <div className="text-2xl font-bold text-red-600">
                                    {formatearMoneda(metricas.gastos.total)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {metricas.gastos.cantidad} gastos registrados
                                </p>
                            </div>
                            <div className="flex items-center mt-2">
                                {metricas.gastos.cambioMesAnterior <= 0 ? (
                                    <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
                                ) : (
                                    <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                                )}
                                <span className={`text-xs ${metricas.gastos.cambioMesAnterior <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {Math.abs(metricas.gastos.cambioMesAnterior)}% vs mes anterior
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* Balance Neto */}
                <Link href="/admin/dashboard/finanzas/reportes">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Balance Neto</CardTitle>
                            <Activity className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent className="flex flex-col justify-between h-full">
                            <div>
                                <div className={`text-2xl font-bold ${metricas.balance.neto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatearMoneda(metricas.balance.neto)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Margen: {metricas.balance.porcentajeMargen.toFixed(1)}%
                                </p>
                            </div>
                            <div className="flex items-center mt-2">
                                <PieChart className="h-3 w-3 text-purple-500 mr-1" />
                                <span className="text-xs text-purple-600">
                                    Utilidad bruta: {formatearMoneda(metricas.balance.utilidadBruta)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Sección principal con últimos pagos y proyección */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Últimos pagos */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Últimos Pagos del Mes</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Total: {formatearMoneda(ultimosPagos.reduce((sum, pago) => sum + pago.monto, 0))}
                                </p>
                            </div>
                            <Link href="/admin/dashboard/finanzas/pagos">
                                <Button variant="outline" size="sm">
                                    Ver todos
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {ultimosPagos.length > 0 ? (
                                <div className="space-y-4">
                                    {ultimosPagos.map((pago, index) => (
                                        <div key={pago.id} className="flex items-center justify-between p-3 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-medium text-zinc-400">
                                                        #{index + 1}
                                                    </span>
                                                    <div>
                                                        <p className="font-medium text-zinc-100">{pago.concepto}</p>
                                                        <p className="text-sm text-zinc-400">
                                                            {pago.cliente} • {pago.eventoNombre}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-lg text-zinc-100">
                                                    {formatearMoneda(pago.monto)}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    {obtenerBadgeStatus(pago.status)}
                                                    <span className="text-xs text-zinc-400">
                                                        {pago.fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No hay pagos registrados este mes</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Proyección financiera */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PieChart className="h-5 w-5" />
                                Proyección del Mes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {proyeccion && (
                                <>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Ingresos cobrados</span>
                                            <span className="font-medium text-green-600">
                                                {formatearMoneda(proyeccion.ingresosCobrados.total)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Pendiente por cobrar</span>
                                            <span className="font-medium text-yellow-600">
                                                {formatearMoneda(proyeccion.pendientesPorCobrar.total)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Pagos programados</span>
                                            <span className="font-medium text-red-600">
                                                {formatearMoneda(proyeccion.pagosProgramados.total)}
                                            </span>
                                        </div>
                                        <hr className="my-3" />
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Utilidad proyectada</span>
                                            <span className={`font-bold ${proyeccion.utilidadProyectada.bruta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatearMoneda(proyeccion.utilidadProyectada.bruta)}
                                            </span>
                                        </div>
                                        <div className="text-center">
                                            <span className="text-xs text-muted-foreground">
                                                Margen proyectado: {proyeccion.utilidadProyectada.porcentaje.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
