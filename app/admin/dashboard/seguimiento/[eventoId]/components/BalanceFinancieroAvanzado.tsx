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
import FormularioPago from "./FormularioPago"
import { crearPago, actualizarPago, eliminarPago } from "@/app/admin/_lib/actions/seguimiento/pagos.actions"

interface BalanceFinancieroAvanzadoProps {
    cotizacion?: {
        id: string
        cliente_id?: string
        precio?: number
        total?: number
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
    const [vistaActiva, setVistaActiva] = useState<'resumen' | 'pagos' | 'analisis'>('resumen')
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [pagoEditando, setPagoEditando] = useState<any>(null)
    const [cargando, setCargando] = useState(false)
    const [actualizando, setActualizando] = useState(false)
    const [mensajeExito, setMensajeExito] = useState<string | null>(null)

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

    // Cálculos financieros
    const totalCotizacion = cotizacion?.precio || 0
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
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <DollarSign className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-blue-800">Cotización</p>
                                <p className="text-xl font-bold text-blue-900">
                                    {formatearMoneda(totalCotizacion)}
                                </p>
                            </div>

                            <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-800">
                                <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
                                <p className="text-sm font-medium text-green-300">Pagado</p>
                                <p className="text-xl font-bold text-green-100">
                                    {formatearMoneda(totalPagado)}
                                </p>
                            </div>

                            <div className="text-center p-4 bg-yellow-900/20 rounded-lg border border-yellow-800">
                                <AlertTriangle className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                                <p className="text-sm font-medium text-yellow-300">Saldo</p>
                                <p className="text-xl font-bold text-yellow-100">
                                    {formatearMoneda(saldoPendiente)}
                                </p>
                            </div>

                            <div className="text-center p-4 bg-purple-900/20 rounded-lg border border-purple-800">
                                <TrendingUp className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                                <p className="text-sm font-medium text-purple-300">Progreso</p>
                                <p className="text-xl font-bold text-purple-100">
                                    {porcentajePagado.toFixed(1)}%
                                </p>
                            </div>
                        </div>

                        {/* Barra de progreso avanzada */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-zinc-400">
                                    {pagosExitosos.length} de {pagos?.length || 0} pagos
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
                                    {estadoFinanciero === 'avanzado' && 'Progreso avanzado - Más del 50% pagado'}
                                    {estadoFinanciero === 'inicial' && 'Fase inicial - Requiere más pagos'}
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
                                    El evento tiene un saldo pendiente considerable.
                                    Considera contactar al cliente para el siguiente pago.
                                </p>
                            </div>
                        )}

                        {porcentajePagado >= 75 && saldoPendiente > 0 && (
                            <div className="p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-blue-400" />
                                    <span className="text-sm font-medium text-blue-300">
                                        Casi completo
                                    </span>
                                </div>
                                <p className="text-sm text-blue-100 mt-1">
                                    ¡Excelente progreso! Solo falta {formatearMoneda(saldoPendiente)} para completar el pago.
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

                {/* Vista Análisis */}
                {vistaActiva === 'analisis' && (
                    <div className="space-y-6">
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

                        {/* Cronograma sugerido */}
                        <div>
                            <h4 className="font-medium mb-3 text-zinc-100">Cronograma de pagos sugerido</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between p-3 bg-green-900/20 rounded border border-green-800">
                                    <span className="text-green-300">Anticipo (10%)</span>
                                    <span className="font-medium text-green-100">{formatearMoneda(totalCotizacion * 0.1)}</span>
                                </div>
                                <div className="flex justify-between p-3 bg-blue-900/20 rounded border border-blue-800">
                                    <span className="text-blue-300">Segundo pago (40%)</span>
                                    <span className="font-medium text-blue-100">{formatearMoneda(totalCotizacion * 0.4)}</span>
                                </div>
                                <div className="flex justify-between p-3 bg-purple-900/20 rounded border border-purple-800">
                                    <span className="text-purple-300">Pago final (50%)</span>
                                    <span className="font-medium text-purple-100">{formatearMoneda(totalCotizacion * 0.5)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Proyecciones */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 border border-zinc-700 rounded-lg bg-zinc-900">
                                <h5 className="font-medium mb-2 text-zinc-100">Estado actual</h5>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Pagado:</span>
                                        <span className="text-zinc-200">{formatearMoneda(totalPagado)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Avance:</span>
                                        <span className="text-zinc-200">{porcentajePagado.toFixed(1)}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Restante:</span>
                                        <span className="text-zinc-200">{formatearMoneda(saldoPendiente)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border border-zinc-700 rounded-lg bg-zinc-900">
                                <h5 className="font-medium mb-2 text-zinc-100">Próximo pago</h5>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Sugerido:</span>
                                        <span className="text-zinc-200">{formatearMoneda(Math.min(saldoPendiente, totalCotizacion * 0.4))}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Fecha sugerida:</span>
                                        <span className="text-zinc-200">Próxima semana</span>
                                    </div>
                                </div>
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
        </Card>
    )
}
