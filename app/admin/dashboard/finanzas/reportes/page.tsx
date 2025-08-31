'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
    Calendar,
    TrendingUp,
    TrendingDown,
    DollarSign,
    PieChart,
    BarChart3,
    Download,
    Filter,
    AlertCircle
} from 'lucide-react';
import { obtenerBalanceGeneral } from '@/app/admin/_lib/actions/finanzas';

interface ResumenFinanciero {
    periodo: {
        fechaInicio: Date;
        fechaFin: Date;
    };
    ingresos: {
        total: number;
        pagosConfirmados: number;
        pagosPendientes: number;
        cantidad: number;
    };
    egresos: {
        total: number;
        nomina: number;
        gastos: number;
        cantidad: number;
    };
    balance: {
        neto: number;
        porcentajeUtilidad: number;
    };
    comparacion?: {
        periodoAnterior: {
            ingresos: number;
            egresos: number;
            balance: number;
        };
        variacion: {
            ingresos: number;
            egresos: number;
            balance: number;
        };
    };
}

export default function ReportesPage() {
    const [resumen, setResumen] = useState<ResumenFinanciero | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fechaInicio, setFechaInicio] = useState(() => {
        const fecha = new Date();
        fecha.setDate(1); // Primer día del mes actual
        return fecha.toISOString().split('T')[0];
    });
    const [fechaFin, setFechaFin] = useState(() => {
        const fecha = new Date();
        fecha.setMonth(fecha.getMonth() + 1, 0); // Último día del mes actual
        return fecha.toISOString().split('T')[0];
    });

    // Cargar balance general
    useEffect(() => {
        const cargarBalance = async () => {
            try {
                setIsLoading(true);
                const filtros = {
                    fechaInicio: new Date(fechaInicio),
                    fechaFin: new Date(fechaFin),
                    incluirNomina: true,
                    incluirGastos: true
                };
                const balanceData = await obtenerBalanceGeneral(filtros);
                setResumen(balanceData);
            } catch (error) {
                console.error('Error al cargar balance general:', error);
            } finally {
                setIsLoading(false);
            }
        };

        cargarBalance();
    }, [fechaInicio, fechaFin]);

    const formatearMoneda = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };

    const formatearPorcentaje = (valor: number) => {
        const signo = valor >= 0 ? '+' : '';
        return `${signo}${valor.toFixed(1)}%`;
    };

    const obtenerColorVariacion = (valor: number) => {
        if (valor > 0) return 'text-green-500';
        if (valor < 0) return 'text-red-500';
        return 'text-zinc-400';
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

    if (!resumen) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-zinc-600" />
                <h3 className="text-lg font-medium text-zinc-300 mb-2">
                    Error al cargar datos
                </h3>
                <p className="text-zinc-500">
                    No se pudieron cargar los datos del reporte
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Reportes Financieros
                    </h1>
                    <p className="text-zinc-400">
                        Análisis de balance y rendimiento financiero
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar PDF
                    </Button>
                </div>
            </div>

            {/* Filtros de fecha */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Período de Análisis
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
                                />
                                <span className="text-zinc-400 self-center">hasta</span>
                                <input
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
                                />
                            </div>
                        </div>
                        <Button variant="outline" size="sm">
                            <Filter className="w-4 h-4 mr-2" />
                            Aplicar filtros
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Ingresos */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">
                            Ingresos Totales
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                            {formatearMoneda(resumen.ingresos.total)}
                        </div>
                        {resumen.comparacion && (
                            <p className={`text-xs mt-1 ${obtenerColorVariacion(resumen.comparacion.variacion.ingresos)}`}>
                                {formatearPorcentaje(resumen.comparacion.variacion.ingresos)} vs período anterior
                            </p>
                        )}
                        <div className="mt-2 text-xs text-zinc-400">
                            <p>Confirmados: {formatearMoneda(resumen.ingresos.pagosConfirmados)}</p>
                            <p>Pendientes: {formatearMoneda(resumen.ingresos.pagosPendientes)}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Egresos */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">
                            Egresos Totales
                        </CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">
                            {formatearMoneda(resumen.egresos.total)}
                        </div>
                        {resumen.comparacion && (
                            <p className={`text-xs mt-1 ${obtenerColorVariacion(-resumen.comparacion.variacion.egresos)}`}>
                                {formatearPorcentaje(resumen.comparacion.variacion.egresos)} vs período anterior
                            </p>
                        )}
                        <div className="mt-2 text-xs text-zinc-400">
                            <p>Nómina: {formatearMoneda(resumen.egresos.nomina)}</p>
                            <p>Gastos: {formatearMoneda(resumen.egresos.gastos)}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Balance neto */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">
                            Balance Neto
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${resumen.balance.neto >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatearMoneda(resumen.balance.neto)}
                        </div>
                        {resumen.comparacion && (
                            <p className={`text-xs mt-1 ${obtenerColorVariacion(resumen.comparacion.variacion.balance)}`}>
                                {formatearPorcentaje(resumen.comparacion.variacion.balance)} vs período anterior
                            </p>
                        )}
                        <div className="mt-2 text-xs text-zinc-400">
                            <p>Margen de utilidad: {resumen.balance.porcentajeUtilidad.toFixed(1)}%</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Análisis de rendimiento */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white">Análisis de Rendimiento</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Composición de ingresos */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white">Composición de Ingresos</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center p-3 bg-zinc-800 rounded">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                                        <span className="text-zinc-300">Pagos Confirmados</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-semibold">
                                            {formatearMoneda(resumen.ingresos.pagosConfirmados)}
                                        </p>
                                        <p className="text-xs text-zinc-400">
                                            {((resumen.ingresos.pagosConfirmados / resumen.ingresos.total) * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-zinc-800 rounded">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                                        <span className="text-zinc-300">Pagos Pendientes</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-semibold">
                                            {formatearMoneda(resumen.ingresos.pagosPendientes)}
                                        </p>
                                        <p className="text-xs text-zinc-400">
                                            {((resumen.ingresos.pagosPendientes / resumen.ingresos.total) * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Composición de egresos */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white">Composición de Egresos</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center p-3 bg-zinc-800 rounded">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                        <span className="text-zinc-300">Nómina</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-semibold">
                                            {formatearMoneda(resumen.egresos.nomina)}
                                        </p>
                                        <p className="text-xs text-zinc-400">
                                            {resumen.egresos.total > 0 ? ((resumen.egresos.nomina / resumen.egresos.total) * 100).toFixed(1) : 0}%
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-zinc-800 rounded">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                                        <span className="text-zinc-300">Gastos Operativos</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-semibold">
                                            {formatearMoneda(resumen.egresos.gastos)}
                                        </p>
                                        <p className="text-xs text-zinc-400">
                                            {resumen.egresos.total > 0 ? ((resumen.egresos.gastos / resumen.egresos.total) * 100).toFixed(1) : 0}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>


        </div>
    );
}
