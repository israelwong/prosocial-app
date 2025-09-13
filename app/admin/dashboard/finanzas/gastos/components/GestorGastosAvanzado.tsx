'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    Filter,
    TrendingUp,
    TrendingDown,
    DollarSign,
    BarChart3,
    FileText
} from 'lucide-react';
import {
    listarGastos,
    crearGasto,
    actualizarGasto,
    cancelarGasto,
    obtenerEstadisticasGastos
} from '@/app/admin/_lib/actions/finanzas/gastos.actions';
import {
    Gasto,
    EstadisticasGastos,
    GASTO_STATUS,
    GASTO_CATEGORIAS
} from '@/app/admin/_lib/actions/finanzas/finanzas.schemas';
import { formatearFecha } from '@/app/admin/_lib/utils/fechas';
import { formatearMoneda } from '@/app/admin/_lib/utils/moneda';

// =====================================
// INTERFACES
// =====================================

interface GastoConUsuario extends Gasto {
    usuario: {
        nombre: string;
    };
}

interface GastoFormulario {
    concepto: string;
    categoria: 'oficina' | 'transporte' | 'marketing' | 'servicios' | 'equipamiento' | 'otros';
    monto: number;
    descripcion: string;
    fecha: Date;
    usuarioId: string;
}

export default function GestorGastosAvanzado() {
    const [gastos, setGastos] = useState<GastoConUsuario[]>([]);
    const [estadisticas, setEstadisticas] = useState<EstadisticasGastos | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filtroCategoria, setFiltroCategoria] = useState<string>('');
    const [filtroStatus, setFiltroStatus] = useState<'activo' | 'cancelado' | ''>('');
    const [busqueda, setBusqueda] = useState<string>('');
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [gastoEditar, setGastoEditar] = useState<GastoConUsuario | null>(null);

    // Estado del formulario
    const [formulario, setFormulario] = useState<GastoFormulario>({
        concepto: '',
        categoria: 'oficina',
        monto: 0,
        descripcion: '',
        fecha: new Date(),
        usuarioId: ''
    });

    // =====================================
    // EFECTOS
    // =====================================

    useEffect(() => {
        cargarDatos();
    }, [filtroCategoria, filtroStatus]);

    // =====================================
    // FUNCIONES
    // =====================================

    const cargarDatos = async () => {
        setIsLoading(true);
        try {
            const [gastosData, estadisticasData] = await Promise.all([
                listarGastos({
                    categoria: filtroCategoria || undefined,
                    status: filtroStatus || undefined,
                }),
                obtenerEstadisticasGastos(
                    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    new Date()
                )
            ]);

            setGastos(gastosData.gastos as GastoConUsuario[]);
            setEstadisticas(estadisticasData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const manejarEnvioFormulario = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (gastoEditar) {
                await actualizarGasto({
                    id: gastoEditar.id,
                    concepto: formulario.concepto,
                    categoria: formulario.categoria,
                    monto: formulario.monto,
                    descripcion: formulario.descripcion,
                    fecha: formulario.fecha,
                    usuarioId: formulario.usuarioId
                });
            } else {
                await crearGasto(formulario);
            }

            setFormulario({
                concepto: '',
                categoria: 'oficina',
                monto: 0,
                descripcion: '',
                fecha: new Date(),
                usuarioId: ''
            });
            setMostrarFormulario(false);
            setGastoEditar(null);
            cargarDatos();
        } catch (error) {
            console.error('Error al guardar gasto:', error);
        }
    };

    const abrirFormularioEdicion = (gasto: GastoConUsuario) => {
        setGastoEditar(gasto);
        setFormulario({
            concepto: gasto.concepto,
            categoria: gasto.categoria as any,
            monto: gasto.monto,
            descripcion: gasto.descripcion || '',
            fecha: gasto.fecha,
            usuarioId: gasto.usuarioId
        });
        setMostrarFormulario(true);
    };

    const eliminar = async (gastoId: string) => {
        if (confirm('¿Estás seguro de que deseas cancelar este gasto?')) {
            try {
                await cancelarGasto(gastoId);
                cargarDatos();
            } catch (error) {
                console.error('Error al cancelar gasto:', error);
            }
        }
    };

    const obtenerVarianteBadgeStatus = (status: string) => {
        switch (status) {
            case GASTO_STATUS.ACTIVO:
                return 'default';
            case GASTO_STATUS.CANCELADO:
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const gastosFiltrados = gastos.filter(gasto => {
        const coincideBusqueda = busqueda === '' ||
            gasto.concepto.toLowerCase().includes(busqueda.toLowerCase()) ||
            gasto.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
            (gasto.usuario?.nombre && gasto.usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()));

        return coincideBusqueda;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando datos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Estadísticas */}
            {estadisticas && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatearMoneda(estadisticas.totalMonto)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {estadisticas.cantidadGastos} gastos registrados
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Promedio</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatearMoneda(estadisticas.promedioMonto)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Por gasto
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {estadisticas.gastoPorCategoria.length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Categorías activas
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Proveedores</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {estadisticas.topProveedores.length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Proveedores activos
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Controles */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Gestión de Gastos</CardTitle>
                        <Button onClick={() => setMostrarFormulario(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Gasto
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar gastos..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={filtroCategoria}
                                onChange={(e) => setFiltroCategoria(e.target.value)}
                                className="px-3 py-2 border rounded-md"
                            >
                                <option value="">Todas las categorías</option>
                                {Object.entries(GASTO_CATEGORIAS).map(([key, value]) => (
                                    <option key={key} value={value}>{value}</option>
                                ))}
                            </select>
                            <select
                                value={filtroStatus}
                                onChange={(e) => setFiltroStatus(e.target.value as 'activo' | 'cancelado' | '')}
                                className="px-3 py-2 border rounded-md"
                            >
                                <option value="">Todos los estados</option>
                                <option value={GASTO_STATUS.ACTIVO}>Activo</option>
                                <option value={GASTO_STATUS.CANCELADO}>Cancelado</option>
                            </select>
                        </div>
                    </div>

                    {/* Lista de gastos */}
                    <div className="space-y-4">
                        {gastosFiltrados.map((gasto) => (
                            <div key={gasto.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-medium">{gasto.concepto}</h3>
                                        <Badge variant={obtenerVarianteBadgeStatus(gasto.status)}>
                                            {gasto.status}
                                        </Badge>
                                        <Badge variant="outline">
                                            {gasto.categoria}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">
                                        {gasto.descripcion}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>📅 {formatearFecha(gasto.fecha)}</span>
                                        <span>👤 {gasto.usuario?.nombre || 'Sin usuario'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-green-600">
                                            {formatearMoneda(gasto.monto)}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => abrirFormularioEdicion(gasto)}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => eliminar(gasto.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {gastosFiltrados.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No se encontraron gastos con los filtros aplicados
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Modal de formulario */}
            {mostrarFormulario && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-lg font-bold mb-4">
                            {gastoEditar ? 'Editar Gasto' : 'Nuevo Gasto'}
                        </h2>

                        <form onSubmit={manejarEnvioFormulario} className="space-y-4">
                            <div>
                                <Label htmlFor="concepto">Concepto</Label>
                                <Input
                                    id="concepto"
                                    value={formulario.concepto}
                                    onChange={(e) => setFormulario(prev => ({
                                        ...prev,
                                        concepto: e.target.value
                                    }))}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="categoria">Categoría</Label>
                                <select
                                    id="categoria"
                                    value={formulario.categoria}
                                    onChange={(e) => setFormulario(prev => ({
                                        ...prev,
                                        categoria: e.target.value as any
                                    }))}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                >
                                    {Object.entries(GASTO_CATEGORIAS).map(([key, value]) => (
                                        <option key={key} value={value}>{value}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="monto">Monto</Label>
                                <Input
                                    id="monto"
                                    type="number"
                                    step="0.01"
                                    value={formulario.monto}
                                    onChange={(e) => setFormulario(prev => ({
                                        ...prev,
                                        monto: parseFloat(e.target.value) || 0
                                    }))}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="descripcion">Descripción</Label>
                                <Textarea
                                    id="descripcion"
                                    value={formulario.descripcion}
                                    onChange={(e) => setFormulario(prev => ({
                                        ...prev,
                                        descripcion: e.target.value
                                    }))}
                                />
                            </div>

                            <div>
                                <Label htmlFor="fecha">Fecha</Label>
                                <Input
                                    id="fecha"
                                    type="date"
                                    value={formulario.fecha.toISOString().split('T')[0]}
                                    onChange={(e) => setFormulario(prev => ({
                                        ...prev,
                                        fecha: new Date(e.target.value)
                                    }))}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="usuarioId">Usuario ID</Label>
                                <Input
                                    id="usuarioId"
                                    value={formulario.usuarioId}
                                    onChange={(e) => setFormulario(prev => ({
                                        ...prev,
                                        usuarioId: e.target.value
                                    }))}
                                    required
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button type="submit" className="flex-1">
                                    {gastoEditar ? 'Actualizar' : 'Crear'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setMostrarFormulario(false);
                                        setGastoEditar(null);
                                    }}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
