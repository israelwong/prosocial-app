'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { PAGO_STATUS } from '@/app/admin/_lib/constants/status'
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    CreditCard,
    PieChart,
    BarChart3,
    Eye,
    Edit,
    Plus,
    Trash2,
    Download,
    Send,
    X,
    Loader2
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import FormularioPago from "./FormularioPago"
import FormularioCosto from "./FormularioCosto"
import { crearPago, actualizarPago, eliminarPago } from "@/app/admin/_lib/actions/seguimiento/pagos.actions"
import { crearCosto, actualizarCosto, eliminarCosto, obtenerCostosPorCotizacion, obtenerTotalCostosPorCotizacion } from "@/app/admin/_lib/actions/seguimiento/costos.actions"

interface BalanceFinancieroAvanzadoProps {
    cotizacion?: {
        id: string
        cliente_id?: string
        precio?: number
        total?: number
        descuento?: number | null // 🎯 Descuento congelado
        cliente?: {
            id: string
            nombre?: string
        }
        evento?: {
            id: string
            cotizaciones?: Array<{
                id: string
                nombre?: string
            }>
        }
        Servicio?: Array<{
            id: string
            cantidad: number
            costo_snapshot?: number
            gasto_snapshot?: number
            utilidad_snapshot?: number
            nombre_snapshot?: string
        }>
    } | null
    pagos?: Array<{
        id?: string
        concepto?: string
        descripcion?: string
        monto?: number
        cantidad?: number
        metodo_pago?: string
        status?: string
        cotizacion_id?: string
        cliente_id?: string
        createdAt?: Date | string
        fechaFormateada?: string
        montoFormateado?: string
        statusDisplay?: string
    }> | null
}

const STATUS_COLORS = {
    [PAGO_STATUS.PAID]: 'bg-green-900/20 text-green-400 border border-green-800',
    [PAGO_STATUS.PENDING]: 'bg-amber-900/20 text-amber-400 border border-amber-800',
    [PAGO_STATUS.FAILED]: 'bg-red-900/20 text-red-400 border border-red-800',
    [PAGO_STATUS.CANCELLED]: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
    'default': 'bg-zinc-800 text-zinc-500 border border-zinc-700'
} as const

const METODO_PAGO_ICONS = {
    'card': CreditCard,
    'transfer': BarChart3,
    'cash': DollarSign,
    'default': DollarSign
} as const

export function BalanceFinancieroAvanzado({ cotizacion, pagos = [] }: BalanceFinancieroAvanzadoProps) {
    const router = useRouter()
    const [vistaActiva, setVistaActiva] = useState<'resumen' | 'pagos' | 'costos' | 'analisis'>('resumen')
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [pagoEditando, setPagoEditando] = useState<any>(null)
    const [cargando, setCargando] = useState(false)
    const [actualizando, setActualizando] = useState(false)
    const [mensajeExito, setMensajeExito] = useState<string | null>(null)

    // Estados para costos
    const [mostrarFormularioCosto, setMostrarFormularioCosto] = useState(false)
    const [costoEditando, setCostoEditando] = useState<any>(null)
    const [costos, setCostos] = useState<any[]>([])
    const [totalCostos, setTotalCostos] = useState(0)
    const [cargandoCostos, setCargandoCostos] = useState(false)

    const manejarCrearPago = async (datosPago: any) => {
        setActualizando(true)
        setCargando(true)
        try {
            const resultado = await crearPago(datosPago)

            if (resultado.success) {
                setMostrarFormulario(false)
                setMensajeExito('Pago registrado exitosamente')
                router.refresh()
                setTimeout(() => setMensajeExito(null), 3000)
            } else {
                alert('Error al crear el pago: ' + (resultado.message || 'Error desconocido'))
            }
        } catch (error) {
            console.error('Error al crear pago:', error)
            alert('Error al crear el pago')
        } finally {
            setCargando(false)
            setTimeout(() => setActualizando(false), 1500)
        }
    }

    const manejarEditarPago = async (datosPago: any) => {
        setActualizando(true)
        setCargando(true)

        // Asegurar que incluya el ID del pago editando
        const datosConId = {
            ...datosPago,
            id: pagoEditando?.id || datosPago.id
        }

        try {
            const resultado = await actualizarPago(datosConId)

            if (resultado.success) {
                setMostrarFormulario(false)
                setPagoEditando(null)
                setMensajeExito('Pago actualizado exitosamente')
                router.refresh()
                setTimeout(() => setMensajeExito(null), 3000)
            } else {
                alert('Error al actualizar el pago: ' + (resultado.message || 'Error desconocido'))
            }
        } catch (error) {
            console.error('Error al actualizar pago:', error)
            alert('Error al actualizar el pago')
        } finally {
            setCargando(false)
            setTimeout(() => setActualizando(false), 1500)
        }
    }

    const manejarEliminarPago = async (pagoId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este pago?')) return
        setActualizando(true)
        setCargando(true)
        try {
            const resultado = await eliminarPago(pagoId)

            if (resultado.success) {
                router.refresh()
            } else {
                alert('Error al eliminar el pago: ' + (resultado.message || 'Error desconocido'))
            }
        } catch (error) {
            console.error('Error al eliminar pago:', error)
            alert('Error al eliminar el pago')
        } finally {
            setCargando(false)
            setTimeout(() => setActualizando(false), 1500)
        }
    }

    const abrirFormularioCrear = () => {
        setPagoEditando(null)
        setMostrarFormulario(true)
        setVistaActiva('pagos')
    }

    const abrirFormularioEditar = (pago: any) => {
        setPagoEditando(pago)
        setMostrarFormulario(true)
    }

    const cerrarFormulario = () => {
        setMostrarFormulario(false)
        setPagoEditando(null)
    }

    const navegarACotizaciones = () => {
        if (!cotizacion?.evento?.id) return

        const cotizaciones = cotizacion.evento.cotizaciones || []

        if (cotizaciones.length > 1) {
            // Si hay más de una cotización, ir a la vista general del evento
            router.push(`/admin/evento/${cotizacion.evento.id}`)
        } else if (cotizacion.id) {
            // Si solo hay una cotización, ir directamente a ella
            router.push(`/admin/evento/${cotizacion.evento.id}/cotizacion/${cotizacion.id}`)
        } else {
            // Fallback a la vista general del evento
            router.push(`/admin/evento/${cotizacion.evento.id}`)
        }
    }

    // Cálculos financieros con descuento congelado
    const precioOriginal = cotizacion?.precio || 0
    const descuentoCongelado = cotizacion?.descuento || null

    // 🎯 Calcular total con descuento congelado si existe
    const totalCotizacion = descuentoCongelado
        ? precioOriginal * (1 - descuentoCongelado / 100)  // Aplicar descuento congelado
        : precioOriginal  // Sin descuento, usar precio original
    const totalPagado = pagos
        ?.filter(pago => pago.status === PAGO_STATUS.PAID)
        .reduce((suma, pago) => suma + (pago.monto || pago.cantidad || 0), 0) || 0
    const saldoPendiente = Math.max(0, totalCotizacion - totalPagado)
    const porcentajePagado = totalCotizacion > 0 ? (totalPagado / totalCotizacion) * 100 : 0

    // Análisis de pagos
    const pagosExitosos = pagos?.filter(
        pago => pago.status === PAGO_STATUS.PAID && PAGO_STATUS.COMPLETADO
    ) || []
    const pagosPendientes = pagos?.filter(pago => pago.status === PAGO_STATUS.PENDING) || []
    const pagosFallidos = pagos?.filter(pago => pago.status === PAGO_STATUS.FAILED) || []

    const metodosPago = pagos?.reduce((acc, pago) => {
        const metodo = pago.metodo_pago || 'otro'
        acc[metodo] = (acc[metodo] || 0) + 1
        return acc
    }, {} as Record<string, number>) || {}

    // Formatear moneda
    const formatearMoneda = (cantidad: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(cantidad)
    }

    // Formatear fecha
    const formatearFecha = (fecha: Date | string) => {
        return new Date(fecha).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    // Cálculos de gastos operativos desde servicios
    const servicios = cotizacion?.Servicio || []
    const gastosOperativos = servicios.reduce((total, servicio) => {
        // El costo_snapshot representa lo que se le paga al empleado (gasto de la empresa)
        const costoServicio = servicio.costo_snapshot || 0
        const cantidad = servicio.cantidad || 1
        return total + (costoServicio * cantidad)
    }, 0)

    const costosOperativos = servicios.reduce((total, servicio) => {
        // Los gastos adicionales del servicio
        const gasto = servicio.gasto_snapshot || 0
        const cantidad = servicio.cantidad || 1
        return total + (gasto * cantidad)
    }, 0)

    const utilidadOperativa = servicios.reduce((total, servicio) => {
        const utilidad = servicio.utilidad_snapshot || 0
        const cantidad = servicio.cantidad || 1
        return total + (utilidad * cantidad)
    }, 0)

    // Cálculo de utilidad final
    const utilidadFinal = totalPagado - gastosOperativos - totalCostos

    // Datos para la gráfica de pastel (simplificada)
    const datosGraficaPastel = [
        {
            name: 'Utilidad Final',
            value: Math.max(0, utilidadFinal),
            color: '#22c55e', // green-500
            percentage: totalPagado > 0 ? ((Math.max(0, utilidadFinal) / totalPagado) * 100).toFixed(1) : '0'
        },
        {
            name: 'Gastos Operativos',
            value: gastosOperativos,
            color: '#f97316', // orange-500
            percentage: totalPagado > 0 ? ((gastosOperativos / totalPagado) * 100).toFixed(1) : '0'
        },
        {
            name: 'Costos Producción',
            value: totalCostos,
            color: '#ef4444', // red-500
            percentage: totalPagado > 0 ? ((totalCostos / totalPagado) * 100).toFixed(1) : '0'
        }
    ].filter(item => item.value > 0) // Solo mostrar elementos con valor

    // Custom label para la gráfica
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name, percentage }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize={12}
                fontWeight="500"
            >
                {`${percentage}%`}
            </text>
        );
    };

    // Custom tooltip para la gráfica
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-lg">
                    <p className="text-zinc-200 font-medium mb-1">{data.payload.name}</p>
                    <p className="text-zinc-100 font-bold">{formatearMoneda(data.value)}</p>
                    <p className="text-zinc-400 text-sm">{data.payload.percentage}% del total</p>
                </div>
            );
        }
        return null;
    };

    // Funciones para manejar costos
    const cargarCostos = async () => {
        if (!cotizacion?.id) return

        setCargandoCostos(true)
        try {
            const [resultadoCostos, resultadoTotal] = await Promise.all([
                obtenerCostosPorCotizacion(cotizacion.id),
                obtenerTotalCostosPorCotizacion(cotizacion.id)
            ])

            if (resultadoCostos.success && resultadoCostos.costos) {
                setCostos(resultadoCostos.costos)
            }

            if (resultadoTotal.success) {
                setTotalCostos(resultadoTotal.total)
            }
        } catch (error) {
            console.error('Error al cargar costos:', error)
        } finally {
            setCargandoCostos(false)
        }
    }

    const manejarCrearCosto = async (datosCosto: any) => {
        setActualizando(true)
        setCargando(true)
        try {
            const resultado = await crearCosto(datosCosto)

            if (resultado.success) {
                setMostrarFormularioCosto(false)
                setMensajeExito('Costo registrado exitosamente')
                await cargarCostos()
                router.refresh()
                setTimeout(() => setMensajeExito(null), 3000)
            } else {
                alert('Error al crear el costo: ' + (resultado.message || 'Error desconocido'))
            }
        } catch (error) {
            console.error('Error al crear costo:', error)
            alert('Error al crear el costo')
        } finally {
            setCargando(false)
            setTimeout(() => setActualizando(false), 1500)
        }
    }

    const manejarEditarCosto = async (datosCosto: any) => {
        setActualizando(true)
        setCargando(true)

        try {
            const resultado = await actualizarCosto(datosCosto)

            if (resultado.success) {
                setMostrarFormularioCosto(false)
                setCostoEditando(null)
                setMensajeExito('Costo actualizado exitosamente')
                await cargarCostos()
                router.refresh()
                setTimeout(() => setMensajeExito(null), 3000)
            } else {
                alert('Error al actualizar el costo: ' + (resultado.message || 'Error desconocido'))
            }
        } catch (error) {
            console.error('Error al actualizar costo:', error)
            alert('Error al actualizar el costo')
        } finally {
            setCargando(false)
            setTimeout(() => setActualizando(false), 1500)
        }
    }

    const manejarEliminarCosto = async (costoId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este costo?')) return
        setActualizando(true)
        setCargando(true)
        try {
            const resultado = await eliminarCosto(costoId)

            if (resultado.success) {
                setMensajeExito('Costo eliminado exitosamente')
                await cargarCostos()
                router.refresh()
                setTimeout(() => setMensajeExito(null), 3000)
            } else {
                alert('Error al eliminar el costo: ' + (resultado.message || 'Error desconocido'))
            }
        } catch (error) {
            console.error('Error al eliminar costo:', error)
            alert('Error al eliminar el costo')
        } finally {
            setCargando(false)
            setTimeout(() => setActualizando(false), 1500)
        }
    }

    const abrirFormularioCrearCosto = () => {
        setCostoEditando(null)
        setMostrarFormularioCosto(true)
    }

    const abrirFormularioEditarCosto = (costo: any) => {
        setCostoEditando(costo)
        setMostrarFormularioCosto(true)
    }

    const cerrarFormularioCosto = () => {
        setMostrarFormularioCosto(false)
        setCostoEditando(null)
    }

    // Cargar costos cuando se monta el componente o cambia la cotización
    useEffect(() => {
        if (cotizacion?.id) {
            cargarCostos()
        }
    }, [cotizacion?.id])

    const getStatusColor = (status?: string | null) => {
        if (!status) return STATUS_COLORS.default
        return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.default
    }

    const getMetodoIcon = (metodo?: string | null) => {
        if (!metodo) return METODO_PAGO_ICONS.default
        return METODO_PAGO_ICONS[metodo as keyof typeof METODO_PAGO_ICONS] || METODO_PAGO_ICONS.default
    }

    const estadoFinanciero = saldoPendiente <= 0 ? 'completo' : saldoPendiente <= totalCotizacion * 0.5 ? 'avanzado' : 'inicial'

    return (
        <Card className="relative bg-zinc-900 border-zinc-800">
            {/* Mensaje de éxito */}
            {mensajeExito && (
                <div className="absolute top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>{mensajeExito}</span>
                    <button
                        onClick={() => setMensajeExito(null)}
                        className="hover:bg-green-700 rounded p-1"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            )}

            <CardHeader className="border-b border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-lg flex items-center gap-2 text-zinc-100">
                        <DollarSign className="h-5 w-5 text-zinc-400" />
                        Balance Financiero
                        {actualizando && (
                            <div className="flex items-center gap-2 text-blue-400">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Actualizando...</span>
                            </div>
                        )}
                    </CardTitle>

                    <Badge className={`${estadoFinanciero === 'completo' ? 'bg-green-900/20 text-green-400 border border-green-800' :
                        estadoFinanciero === 'avanzado' ? 'bg-blue-900/20 text-blue-400 border border-blue-800' :
                            'bg-yellow-900/20 text-yellow-400 border border-yellow-800'
                        }`}>
                        {estadoFinanciero === 'completo' && 'Pagos completos'}
                        {estadoFinanciero === 'avanzado' && 'Progreso avanzado'}
                        {estadoFinanciero === 'inicial' && 'Fase inicial'}
                    </Badge>
                </div>

                {/* Navegación por pestañas */}
                <div className="mt-4">
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setVistaActiva('resumen')}
                            className={vistaActiva === 'resumen' ?
                                'bg-blue-600 hover:bg-blue-700 text-white' :
                                'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                            }
                        >
                            <PieChart className="h-4 w-4 mr-1" />
                            Resumen
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setVistaActiva('pagos')}
                            className={vistaActiva === 'pagos' ?
                                'bg-blue-600 hover:bg-blue-700 text-white' :
                                'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                            }
                        >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Pagos ({pagos?.length || 0})
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setVistaActiva('costos')}
                            className={vistaActiva === 'costos' ?
                                'bg-blue-600 hover:bg-blue-700 text-white' :
                                'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                            }
                        >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Costos
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setVistaActiva('analisis')}
                            className={vistaActiva === 'analisis' ?
                                'bg-blue-600 hover:bg-blue-700 text-white' :
                                'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                            }
                        >
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Análisis
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="overflow-visible">
                {/* Vista Resumen */}
                {vistaActiva === 'resumen' && (
                    <div className="space-y-6">
                        {/* Métricas principales */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                            {actualizando && (
                                <div className="absolute inset-0 bg-zinc-900/50 rounded-lg flex items-center justify-center z-10">
                                    <div className="bg-zinc-800 px-4 py-2 rounded-lg flex items-center gap-2 text-zinc-300">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="text-sm">Actualizando datos...</span>
                                    </div>
                                </div>
                            )}
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <DollarSign className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                                <p className="text-xs font-medium text-blue-800">
                                    Cotización
                                    {descuentoCongelado && (
                                        <span className="ml-1 text-xs text-blue-600">
                                            (-{descuentoCongelado}%)
                                        </span>
                                    )}
                                </p>
                                <p className="text-lg font-bold text-blue-900 leading-tight">
                                    {formatearMoneda(totalCotizacion)}
                                </p>
                                {descuentoCongelado && (
                                    <p className="text-xs text-blue-700 mt-1">
                                        Original: {formatearMoneda(precioOriginal)}
                                    </p>
                                )}
                            </div>

                            <div className="text-center p-3 bg-green-900/20 rounded-lg border border-green-800">
                                <CheckCircle className="h-5 w-5 text-green-400 mx-auto mb-2" />
                                <p className="text-xs font-medium text-green-300">Pagado</p>
                                <p className="text-lg font-bold text-green-100 leading-tight">
                                    {formatearMoneda(totalPagado)}
                                </p>
                            </div>

                            <div className="text-center p-3 bg-yellow-900/20 rounded-lg border border-yellow-800">
                                <AlertTriangle className="h-5 w-5 text-yellow-400 mx-auto mb-2" />
                                <p className="text-xs font-medium text-yellow-300">Saldo</p>
                                <p className="text-lg font-bold text-yellow-100 leading-tight">
                                    {formatearMoneda(saldoPendiente)}
                                </p>
                            </div>

                            <div className="text-center p-3 bg-purple-900/20 rounded-lg border border-purple-800">
                                <TrendingUp className="h-5 w-5 text-purple-400 mx-auto mb-2" />
                                <p className="text-xs font-medium text-purple-300">Progreso</p>
                                <p className="text-lg font-bold text-purple-100 leading-tight">
                                    {porcentajePagado.toFixed(1)}%
                                </p>
                            </div>
                        </div>

                        {/* Barra de progreso avanzada */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-zinc-400">
                                    Pagado: {formatearMoneda(totalPagado)} de {formatearMoneda(totalCotizacion)}
                                </span>
                            </div>

                            <div className="relative">
                                <div className="w-full bg-zinc-800 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full transition-all duration-500 ${porcentajePagado >= 100 ? 'bg-green-500' :
                                            porcentajePagado >= 75 ? 'bg-blue-500' :
                                                porcentajePagado >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                                            }`}
                                        style={{ width: `${Math.min(porcentajePagado, 100)}%` }}
                                    />
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-medium text-zinc-100 drop-shadow">
                                        {porcentajePagado.toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            {/* Indicador de estado financiero */}
                            <div className="flex items-center gap-2 mt-4">
                                {estadoFinanciero === 'completo' && (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                )}
                                {estadoFinanciero === 'avanzado' && (
                                    <TrendingUp className="h-5 w-5 text-blue-600" />
                                )}
                                {estadoFinanciero === 'inicial' && (
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                )}
                                <span className={`font-medium ${estadoFinanciero === 'completo' ? 'text-green-800' :
                                    estadoFinanciero === 'avanzado' ? 'text-blue-800' :
                                        'text-yellow-800'
                                    }`}>
                                    {estadoFinanciero === 'completo' && 'Pagos completos - Evento totalmente financiado'}
                                    {estadoFinanciero === 'avanzado' && `Progreso avanzado - ${porcentajePagado.toFixed(1)}% pagado`}
                                    {estadoFinanciero === 'inicial' && `Fase inicial - ${porcentajePagado.toFixed(1)}% pagado`}
                                </span>
                            </div>
                        </div>

                        {/* Alertas y notificaciones */}
                        {saldoPendiente > 0 && porcentajePagado < 50 && (
                            <div className="p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                                    <span className="text-sm font-medium text-yellow-300">
                                        Seguimiento requerido
                                    </span>
                                </div>
                                <p className="text-sm text-yellow-100 mt-1">
                                    El evento tiene un saldo pendiente de {formatearMoneda(saldoPendiente)} ({(100 - porcentajePagado).toFixed(1)}% del total).
                                    Considera contactar al cliente para el siguiente pago.
                                </p>
                            </div>
                        )}

                        {porcentajePagado >= 50 && porcentajePagado < 100 && saldoPendiente > 0 && (
                            <div className="p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-blue-400" />
                                    <span className="text-sm font-medium text-blue-300">
                                        {porcentajePagado >= 75 ? 'Casi completo' : 'Buen progreso'}
                                    </span>
                                </div>
                                <p className="text-sm text-blue-100 mt-1">
                                    {porcentajePagado >= 75
                                        ? `¡Excelente progreso! Solo falta ${formatearMoneda(saldoPendiente)} (${(100 - porcentajePagado).toFixed(1)}%) para completar el pago.`
                                        : `Progreso sólido con ${porcentajePagado.toFixed(1)}% pagado. Faltan ${formatearMoneda(saldoPendiente)} por cobrar.`
                                    }
                                </p>
                            </div>
                        )}

                        {porcentajePagado >= 100 && (
                            <div className="p-3 bg-green-900/20 border border-green-800 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-400" />
                                    <span className="text-sm font-medium text-green-300">
                                        Evento completamente financiado
                                    </span>
                                </div>
                                <p className="text-sm text-green-100 mt-1">
                                    ¡Felicidades! El evento ha sido pagado completamente. Total recibido: {formatearMoneda(totalPagado)}.
                                </p>
                            </div>
                        )}

                        {/* Acciones rápidas */}
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={abrirFormularioCrear}
                                disabled={cargando}
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Registrar Pago
                            </Button>
                            {cotizacion?.evento?.id && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={navegarACotizaciones}
                                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                                >
                                    <Eye className="h-4 w-4 mr-1" />
                                    {cotizacion.evento.cotizaciones && cotizacion.evento.cotizaciones.length > 1
                                        ? 'Ver Cotizaciones'
                                        : 'Ver Cotización'
                                    }
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Vista Pagos */}
                {vistaActiva === 'pagos' && (
                    <div className="space-y-4 overflow-visible">
                        {/* Header con botón de agregar pago */}
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-zinc-100">Gestión de Pagos</h3>
                            <Button
                                onClick={abrirFormularioCrear}
                                disabled={cargando}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo Pago
                            </Button>
                        </div>

                        {/* Estadísticas de pagos */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="text-center p-3 bg-green-900/20 rounded-lg border border-green-800">
                                <p className="text-sm font-medium text-green-300">Exitosos</p>
                                <p className="text-lg font-bold text-green-100">{pagosExitosos.length}</p>
                            </div>
                            <div className="text-center p-3 bg-yellow-900/20 rounded-lg border border-yellow-800">
                                <p className="text-sm font-medium text-yellow-300">Pendientes</p>
                                <p className="text-lg font-bold text-yellow-100">{pagosPendientes.length}</p>
                            </div>
                            <div className="text-center p-3 bg-red-900/20 rounded-lg border border-red-800">
                                <p className="text-sm font-medium text-red-300">Fallidos</p>
                                <p className="text-lg font-bold text-red-100">{pagosFallidos.length}</p>
                            </div>
                        </div>

                        {/* Lista de pagos */}
                        {pagos && pagos.length > 0 ? (
                            <div className="space-y-3 relative">
                                {actualizando && (
                                    <div className="absolute inset-0 bg-zinc-900/50 rounded-lg flex items-center justify-center z-40">
                                        <div className="bg-zinc-800 px-4 py-2 rounded-lg flex items-center gap-2 text-zinc-300">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="text-sm">Actualizando pagos...</span>
                                        </div>
                                    </div>
                                )}
                                {pagos.map((pago, index) => {
                                    const IconoMetodo = getMetodoIcon(pago.metodo_pago)
                                    return (
                                        <div
                                            key={pago.id || index}
                                            className="flex items-center justify-between p-4 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors bg-zinc-900 relative overflow-visible"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-zinc-800 rounded-full">
                                                    <IconoMetodo className="h-4 w-4 text-zinc-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-zinc-100">
                                                        {pago.concepto || 'Pago sin concepto'}
                                                    </p>
                                                    <p className="text-sm text-zinc-400">
                                                        {pago.descripcion || (pago.createdAt ? formatearFecha(pago.createdAt) : 'Sin fecha')}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <p className="font-semibold text-zinc-100">
                                                        {formatearMoneda(pago.monto || pago.cantidad || 0)}
                                                    </p>
                                                    <Badge className={getStatusColor(pago.status)}>
                                                        {pago.status === PAGO_STATUS.PAID
                                                            ? 'Pagado'
                                                            : pago.status === PAGO_STATUS.PENDING
                                                                ? 'Pendiente'
                                                                : pago.statusDisplay || pago.status || 'Sin status'}
                                                    </Badge>
                                                </div>

                                                {/* Botones de acción minimalistas - Paleta Ámbar */}
                                                {pago.id && (
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                abrirFormularioEditar(pago)
                                                            }}
                                                            disabled={cargando}
                                                            className="h-14 w-10 p-0 text-amber-400 hover:text-amber-300 hover:bg-amber-950/30"
                                                            title="Editar pago"
                                                        >
                                                            <Edit className="h-7 w-7" />
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                manejarEliminarPago(pago.id!)
                                                            }}
                                                            disabled={cargando}
                                                            className="h-14 w-10 p-0 text-red-500 hover:text-red-400 hover:bg-red-950/30"
                                                            title="Eliminar pago"
                                                        >
                                                            <Trash2 className="h-7 w-7" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <CreditCard className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                                <p className="text-zinc-400 font-medium">No hay pagos registrados</p>
                                <p className="text-sm text-zinc-500 mt-1 mb-4">
                                    Los pagos aparecerán aquí cuando se procesen
                                </p>
                                <Button
                                    onClick={abrirFormularioCrear}
                                    disabled={cargando}
                                    variant="outline"
                                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Registrar Primer Pago
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Vista Costos */}
                {vistaActiva === 'costos' && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-zinc-100">
                                Centro de Costos
                            </h3>
                        </div>

                        {/* Resumen de todos los costos */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="p-6 bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-700/50 rounded-xl text-left">
                                <div className="space-y-3">
                                    <div>
                                        <h5 className="text-orange-200 font-semibold text-base">💼 Nómina de servicios</h5>
                                        <p className="text-orange-300/70 text-sm"></p>
                                    </div>
                                    <div className="text-left">
                                        <span className="text-orange-100 font-bold text-2xl">{formatearMoneda(gastosOperativos)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-700/50 rounded-xl text-left">
                                <div className="space-y-3">
                                    <div>
                                        <h5 className="text-red-200 font-semibold text-base">🏭 Gastos adicionales</h5>
                                    </div>
                                    <div className="text-left">
                                        <span className="text-red-100 font-bold text-2xl">{formatearMoneda(totalCostos)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/50 rounded-xl text-left">
                                <div className="space-y-3">
                                    <div>
                                        <h5 className="text-purple-200 font-semibold text-base">📊 Total Costos</h5>
                                    </div>
                                    <div className="text-left">
                                        <span className="text-purple-100 font-bold text-2xl">{formatearMoneda(gastosOperativos + totalCostos)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sección de Gastos Operativos */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-zinc-700 pb-3">
                                <h4 className="text-xl font-semibold text-zinc-100">💼 Lista de costos operativos</h4>
                                {/* <div className="text-right">
                                    <span className="text-lg font-bold text-orange-400">{formatearMoneda(gastosOperativos)}</span>
                                    <p className="text-xs text-zinc-400">Total nómina servicios</p>
                                </div> */}
                            </div>

                            {gastosOperativos > 0 ? (
                                <div className="bg-gradient-to-r from-orange-950/50 to-orange-900/30 border border-orange-800/40 rounded-xl p-6">
                                    <div className="space-y-4">
                                        {/* <p className="text-orange-200/80 text-sm font-medium mb-4">
                                            📋 Desglose por servicio contratado
                                        </p> */}
                                        <div className="space-y-3">
                                            {servicios.filter(s => (s.costo_snapshot || 0) > 0).map((servicio, index) => (
                                                <div key={index} className="flex items-center justify-between py-3 px-4 bg-zinc-900/40 rounded-lg border border-zinc-700/30">
                                                    <div className="flex-1">
                                                        <span className="text-zinc-200 font-medium">{servicio.nombre_snapshot || 'Servicio sin nombre'}</span>
                                                        <div className="text-xs text-zinc-400 mt-1">
                                                            ${(servicio.costo_snapshot || 0).toLocaleString()} × {servicio.cantidad || 1}
                                                            {(servicio.cantidad || 1) > 1 ? ' unidades' : ' unidad'}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-orange-300 font-bold text-lg">
                                                            {formatearMoneda((servicio.costo_snapshot || 0) * (servicio.cantidad || 1))}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 bg-zinc-800/30 border border-zinc-700/50 rounded-xl text-center">
                                    <div className="text-zinc-500 text-4xl mb-3">💼</div>
                                    <p className="text-zinc-400 font-medium">No hay gastos operativos</p>
                                    <p className="text-zinc-500 text-sm mt-2">Los costos de nómina de servicios aparecerán aquí</p>
                                </div>
                            )}
                        </div>                        {/* Sección de Costos de Producción */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-zinc-700 pb-3">
                                <h4 className="text-xl font-semibold text-zinc-100">🏭 Costos de Producción</h4>
                                <Button
                                    onClick={abrirFormularioCrearCosto}
                                    disabled={cargando}
                                    size="default"
                                    className="bg-green-600 hover:bg-green-700 px-6"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Agregar Costo
                                </Button>
                            </div>

                            {cargandoCostos ? (
                                <div className="flex justify-center py-12">
                                    <div className="text-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-zinc-400 mx-auto mb-3" />
                                        <p className="text-zinc-400">Cargando costos...</p>
                                    </div>
                                </div>
                            ) : costos.length > 0 ? (
                                <div className="space-y-4 relative">
                                    {actualizando && (
                                        <div className="absolute inset-0 bg-zinc-900/70 rounded-lg flex items-center justify-center z-40">
                                            <div className="bg-zinc-800 px-6 py-3 rounded-lg flex items-center gap-3 text-zinc-300 border border-zinc-700">
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                <span className="font-medium">Actualizando costos...</span>
                                            </div>
                                        </div>
                                    )}
                                    {costos.map((costo, index) => (
                                        <div
                                            key={costo.id || index}
                                            className="flex items-center justify-between p-5 border border-zinc-700/50 rounded-xl bg-gradient-to-r from-zinc-900/50 to-zinc-800/30 hover:from-zinc-800/50 hover:to-zinc-700/30 transition-all duration-200"
                                        >
                                            <div className="flex-1">
                                                <h5 className="font-semibold text-zinc-200 mb-2">
                                                    {costo.nombre}
                                                </h5>
                                                {costo.descripcion && (
                                                    <p className="text-sm text-zinc-400 mb-3">
                                                        {costo.descripcion}
                                                    </p>
                                                )}
                                                <p className="text-xs text-zinc-500 font-medium">
                                                    📅 {costo.fechaFormateada}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="font-bold text-green-400 text-xl">
                                                        {costo.montoFormateado}
                                                    </p>
                                                </div>

                                                {/* Botones de acción */}
                                                {costo.id && (
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => abrirFormularioEditarCosto(costo)}
                                                            disabled={cargando}
                                                            className="h-9 w-9 p-0 text-amber-400 hover:text-amber-300 hover:bg-amber-900/30 transition-colors"
                                                            title="Editar costo"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => manejarEliminarCosto(costo.id!)}
                                                            disabled={cargando}
                                                            className="h-9 w-9 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/30 transition-colors"
                                                            title="Eliminar costo"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-zinc-800/20 rounded-xl border border-zinc-700/50">
                                    <div className="text-zinc-500 text-5xl mb-4">🏭</div>
                                    <p className="text-zinc-400 font-semibold text-lg mb-2">No hay costos de producción</p>
                                    <p className="text-zinc-500 text-sm mb-6">
                                        Agrega costos adicionales como materiales, equipos o servicios externos
                                    </p>
                                    <Button
                                        onClick={abrirFormularioCrearCosto}
                                        disabled={cargando}
                                        variant="outline"
                                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Registrar Primer Costo
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Vista Análisis */}
                {vistaActiva === 'analisis' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-zinc-100">Análisis Financiero Integral</h3>

                        {/* Balance completo con todos los factores */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 border border-zinc-700 rounded-lg bg-zinc-900">
                                <h5 className="font-medium mb-3 text-zinc-100">Balance Detallado</h5>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Valor Cotización:</span>
                                        <span className="text-zinc-200">{formatearMoneda(totalCotizacion)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Ingresos Recibidos:</span>
                                        <span className="text-green-400">{formatearMoneda(totalPagado)}</span>
                                    </div>
                                    <div className="border-t border-zinc-700 pt-2 mt-3 mb-2">
                                        <div className="flex justify-between">
                                            <span className="text-zinc-400">Gastos Operativos:</span>
                                            <span className="text-orange-400">{formatearMoneda(gastosOperativos)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-400">Costos Producción:</span>
                                            <span className="text-red-400">{formatearMoneda(totalCostos)}</span>
                                        </div>
                                        <div className="flex justify-between font-medium">
                                            <span className="text-zinc-300">Total Costos:</span>
                                            <span className="text-red-300">{formatearMoneda(gastosOperativos + totalCostos)}</span>
                                        </div>
                                    </div>
                                    <div className="border-t border-zinc-600 pt-2 flex justify-between font-bold text-base">
                                        <span className="text-zinc-100">Utilidad Final:</span>
                                        <span className={utilidadFinal >= 0 ? "text-green-400" : "text-red-400"}>
                                            {formatearMoneda(utilidadFinal)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border border-zinc-700 rounded-lg bg-zinc-900">
                                <h5 className="font-medium mb-3 text-zinc-100">Métricas de Rentabilidad</h5>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Margen Bruto:</span>
                                        <span className={totalPagado > 0 ? (utilidadFinal / totalPagado * 100) >= 50 ? "text-green-400" : (utilidadFinal / totalPagado * 100) >= 20 ? "text-yellow-400" : "text-red-400" : "text-zinc-200"}>
                                            {totalPagado > 0 ? (utilidadFinal / totalPagado * 100).toFixed(1) + '%' : '0%'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">% Total Costos:</span>
                                        <span className={totalPagado > 0 ? ((gastosOperativos + totalCostos) / totalPagado * 100) <= 50 ? "text-green-400" : ((gastosOperativos + totalCostos) / totalPagado * 100) <= 80 ? "text-yellow-400" : "text-red-400" : "text-zinc-200"}>
                                            {totalPagado > 0 ? ((gastosOperativos + totalCostos) / totalPagado * 100).toFixed(1) + '%' : '0%'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Eficiencia:</span>
                                        <span className={utilidadFinal >= 0 ? utilidadFinal > (totalPagado * 0.3) ? "text-green-400" : "text-yellow-400" : "text-red-400"}>
                                            {utilidadFinal >= 0 ? 'Rentable ✓' : 'No Rentable ✗'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">ROI Real:</span>
                                        <span className={(gastosOperativos + totalCostos) > 0 ? utilidadFinal / (gastosOperativos + totalCostos) > 1 ? "text-green-400" : utilidadFinal / (gastosOperativos + totalCostos) > 0 ? "text-yellow-400" : "text-red-400" : "text-green-400"}>
                                            {(gastosOperativos + totalCostos) > 0 ? ((utilidadFinal / (gastosOperativos + totalCostos)) * 100).toFixed(0) + '%' : '∞'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Gráfica de Pastel - Distribución Financiera */}
                        {(totalPagado > 0 && datosGraficaPastel.length > 0) && (
                            <div className="p-6 border border-zinc-700 rounded-lg bg-zinc-900">
                                <h5 className="font-medium mb-4 text-zinc-100 flex items-center gap-2">
                                    <PieChart className="h-5 w-5 text-blue-400" />
                                    Distribución Financiera
                                </h5>
                                <div className="grid md:grid-cols-2 gap-6 items-center">
                                    {/* Gráfica */}
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RechartsPieChart>
                                                <Pie
                                                    data={datosGraficaPastel}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={renderCustomLabel}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                    stroke="#374151"
                                                    strokeWidth={2}
                                                >
                                                    {datosGraficaPastel.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                            </RechartsPieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Leyenda personalizada */}
                                    <div className="space-y-3">
                                        {datosGraficaPastel.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-4 h-4 rounded-full"
                                                        style={{ backgroundColor: item.color }}
                                                    ></div>
                                                    <span className="text-zinc-200 font-medium text-sm">{item.name}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-zinc-100 font-bold text-sm">
                                                        {formatearMoneda(item.value)}
                                                    </div>
                                                    <div className="text-zinc-400 text-xs">
                                                        {item.percentage}%
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Total */}
                                        <div className="pt-2 border-t border-zinc-700">
                                            <div className="flex items-center justify-between p-3 bg-blue-900/30 rounded-lg border border-blue-700/50">
                                                <span className="text-blue-200 font-semibold">Total Ingresos</span>
                                                <span className="text-blue-100 font-bold">
                                                    {formatearMoneda(totalPagado)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Desglose visual de costos */}
                        {(gastosOperativos > 0 || totalCostos > 0) && (
                            <div className="p-4 border border-zinc-700 rounded-lg bg-zinc-900">
                                <h5 className="font-medium mb-3 text-zinc-100">Distribución de Costos</h5>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-orange-300">Gastos Operativos</span>
                                            <span className="text-sm font-medium text-orange-100">
                                                {((gastosOperativos / (gastosOperativos + totalCostos)) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-zinc-800 rounded-full h-2">
                                            <div
                                                className="bg-orange-500 h-2 rounded-full"
                                                style={{ width: `${(gastosOperativos / (gastosOperativos + totalCostos)) * 100}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-orange-200 mt-1">{formatearMoneda(gastosOperativos)}</p>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-red-300">Costos Producción</span>
                                            <span className="text-sm font-medium text-red-100">
                                                {((totalCostos / (gastosOperativos + totalCostos)) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-zinc-800 rounded-full h-2">
                                            <div
                                                className="bg-red-500 h-2 rounded-full"
                                                style={{ width: `${(totalCostos / (gastosOperativos + totalCostos)) * 100}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-red-200 mt-1">{formatearMoneda(totalCostos)}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Estado de rentabilidad */}
                        <div className={`p-4 rounded-lg border ${utilidadFinal >= 0
                            ? 'bg-green-900/20 border-green-800'
                            : 'bg-red-900/20 border-red-800'
                            }`}>
                            <div className="flex items-center gap-2">
                                {utilidadFinal >= 0 ? (
                                    <CheckCircle className="h-5 w-5 text-green-400" />
                                ) : (
                                    <AlertTriangle className="h-5 w-5 text-red-400" />
                                )}
                                <h5 className={`font-medium ${utilidadFinal >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                    {utilidadFinal >= 0 ? 'Proyecto Rentable' : 'Proyecto No Rentable'}
                                </h5>
                            </div>
                            <p className={`text-sm mt-1 ${utilidadFinal >= 0 ? 'text-green-100' : 'text-red-100'}`}>
                                {utilidadFinal >= 0
                                    ? `Excelente, el proyecto genera una utilidad de ${formatearMoneda(utilidadFinal)}`
                                    : `Atención: El proyecto tiene pérdidas por ${formatearMoneda(Math.abs(utilidadFinal))}`
                                }
                            </p>
                        </div>

                        {/* Métodos de pago */}
                        <div>
                            <h4 className="font-medium mb-3 text-zinc-100">Métodos de pago utilizados</h4>
                            <div className="space-y-2">
                                {Object.entries(metodosPago).map(([metodo, cantidad]) => (
                                    <div key={metodo} className="flex items-center justify-between p-2 bg-zinc-800 rounded">
                                        <span className="capitalize text-zinc-300">{metodo}</span>
                                        <Badge variant="outline" className="border-zinc-600 text-zinc-300">{cantidad}</Badge>
                                    </div>
                                ))}
                                {Object.keys(metodosPago).length === 0 && (
                                    <p className="text-zinc-500 text-sm">No hay datos de métodos de pago</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>

            {/* Modal del formulario de pago */}
            {mostrarFormulario && cotizacion?.id && (
                <FormularioPago
                    cotizacionId={cotizacion.id}
                    clienteId={cotizacion.cliente?.id || ''}
                    isEditing={!!pagoEditando}
                    pagoExistente={pagoEditando}
                    onSubmit={pagoEditando ? manejarEditarPago : manejarCrearPago}
                    onCancel={cerrarFormulario}
                    isLoading={cargando}
                />
            )}

            {/* Modal del formulario de costo */}
            {mostrarFormularioCosto && cotizacion?.id && (
                <FormularioCosto
                    cotizacionId={cotizacion.id}
                    isEditing={!!costoEditando}
                    costoExistente={costoEditando}
                    onSubmit={costoEditando ? manejarEditarCosto : manejarCrearCosto}
                    onCancel={cerrarFormularioCosto}
                    isLoading={cargando}
                />
            )}
        </Card>
    )
}
