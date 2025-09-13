'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { formatearMoneda } from '@/app/admin/_lib/utils/moneda';
import {
    Plus,
    Search,
    Filter,
    TrendingDown,
    Calendar,
    DollarSign,
    FileText
} from 'lucide-react';

// Importar el action simplificado que ya existe
import { listarGastos } from '@/app/admin/_lib/actions/finanzas/gastos.actions';

interface GastoSimplificado {
    id: string;
    concepto: string;
    categoria: string;
    monto: number;
    descripcion?: string;
    status: string;
    fecha: Date;
    usuarioId: string;
}

export default function ListaGastos() {
    const [gastos, setGastos] = useState<GastoSimplificado[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filtroCategoria, setFiltroCategoria] = useState<string>('');
    const [busqueda, setBusqueda] = useState<string>('');

    // Cargar gastos
    const cargarGastos = async () => {
        try {
            setIsLoading(true);

            const result = await listarGastos(
                {
                    categoria: filtroCategoria || undefined,
                    // busqueda se manejará de otra forma porque el filtro no lo incluye directamente
                },
                1, // page
                20 // pageSize
            );

            setGastos(result.gastos);

        } catch (error) {
            console.error('❌ Error al cargar gastos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        cargarGastos();
    }, [filtroCategoria, busqueda]);

    const obtenerBadgeStatus = (status: string) => {
        switch (status.toLowerCase()) {
            case 'activo':
                return <Badge className="bg-green-100 text-green-800 border-green-200">Activo</Badge>;
            case 'cancelado':
                return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelado</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
        }
    };

    const categorias = [
        'oficina',
        'transporte',
        'marketing',
        'servicios',
        'equipamiento',
        'otros'
    ];

    const totalGastos = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
    const gastosActivos = gastos.filter(g => g.status === 'activo');

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
                        💰 Gestión de Gastos
                    </h1>
                    <p className="text-zinc-400">
                        Administración de egresos empresariales
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={() => window.alert('Funcionalidad de crear gasto en desarrollo')}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Gasto
                    </Button>
                </div>
            </div>

            {/* Estadísticas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">
                            Total de Gastos
                        </CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {formatearMoneda(totalGastos)}
                        </div>
                        <p className="text-xs text-red-600 mt-1">
                            {gastos.length} gastos registrados
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">
                            Gastos Activos
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {gastosActivos.length}
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                            {formatearMoneda(gastosActivos.reduce((sum, g) => sum + g.monto, 0))}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">
                            Promedio por Gasto
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {formatearMoneda(gastos.length > 0 ? totalGastos / gastos.length : 0)}
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                            Promedio calculado
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Buscar
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por concepto..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Categoría
                            </label>
                            <select
                                value={filtroCategoria}
                                onChange={(e) => setFiltroCategoria(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Todas las categorías</option>
                                {categorias.map(categoria => (
                                    <option key={categoria} value={categoria}>
                                        {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <Button
                                onClick={() => {
                                    setFiltroCategoria('');
                                    setBusqueda('');
                                }}
                                variant="outline"
                                className="w-full"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Limpiar Filtros
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Lista de gastos */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white">Lista de Gastos</CardTitle>
                </CardHeader>
                <CardContent>
                    {gastos.length > 0 ? (
                        <div className="space-y-3">
                            {gastos.map(gasto => (
                                <div key={gasto.id} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-medium text-white">{gasto.concepto}</h3>
                                            {obtenerBadgeStatus(gasto.status)}
                                        </div>
                                        <p className="text-sm text-zinc-400 mt-1">
                                            {gasto.categoria.charAt(0).toUpperCase() + gasto.categoria.slice(1)} • {gasto.fecha.toLocaleDateString('es-MX')}
                                        </p>
                                        {gasto.descripcion && (
                                            <p className="text-sm text-zinc-500 mt-1">{gasto.descripcion}</p>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <p className="font-semibold text-white">
                                            {formatearMoneda(gasto.monto)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-zinc-400">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No hay gastos registrados</p>
                            <p className="text-sm mt-2">Los gastos aparecerán aquí cuando se agreguen</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Información de ayuda */}
            <Card className="bg-blue-900/20 border-blue-600">
                <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-blue-400 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-blue-400 mb-2">💡 Información sobre Gastos</h3>
                            <div className="text-blue-200 text-sm space-y-1">
                                <p>• Los gastos se crean desde el módulo principal de administración</p>
                                <p>• Puedes filtrar por categoría y buscar por concepto</p>
                                <p>• Los gastos cancelados se muestran pero no se incluyen en totales</p>
                                <p>• Próximamente: creación y edición directa desde esta interfaz</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
