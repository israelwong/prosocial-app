'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import {
    CreditCard,
    CheckCircle,
    Clock,
    XCircle,
    Plus,
    Eye,
    Download
} from "lucide-react"

interface HistorialPagosV3Props {
    pagos: {
        cantidad: number
        lista: Array<{
            id: string
            cantidad: number
            status: string
            metodoPago: string
            concepto?: string
            fechaFormateada?: string
            montoFormateado?: string
        }>
    }
    onAgregarPago?: () => void
    onVerDetalle?: (pagoId: string) => void
    onDescargarRecibo?: (pagoId: string) => void
    isLoading?: boolean
}

const PAGO_STATUS_STYLES = {
    'paid': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Pagado' },
    'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Pendiente' },
    'failed': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Fallido' },
    'cancelled': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle, label: 'Cancelado' },
    'refunded': { bg: 'bg-purple-100', text: 'text-purple-800', icon: XCircle, label: 'Reembolsado' }
} as const

const METODO_PAGO_LABELS = {
    'card': 'Tarjeta',
    'transfer': 'Transferencia',
    'cash': 'Efectivo',
    'check': 'Cheque',
    'paypal': 'PayPal',
    'stripe': 'Stripe'
} as const

export function HistorialPagosV3({
    pagos,
    onAgregarPago,
    onVerDetalle,
    onDescargarRecibo,
    isLoading = false
}: HistorialPagosV3Props) {
    const formatearMoneda = (cantidad: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(cantidad)
    }

    const obtenerStatusConfig = (status: string) => {
        return PAGO_STATUS_STYLES[status as keyof typeof PAGO_STATUS_STYLES]
            || PAGO_STATUS_STYLES.pending
    }

    const obtenerMetodoPagoLabel = (metodo: string) => {
        return METODO_PAGO_LABELS[metodo as keyof typeof METODO_PAGO_LABELS] || metodo
    }

    const calcularResumen = () => {
        const totalPagado = pagos.lista
            .filter(p => p.status === 'paid')
            .reduce((sum, pago) => sum + pago.cantidad, 0)

        const totalPendiente = pagos.lista
            .filter(p => p.status === 'pending')
            .reduce((sum, pago) => sum + pago.cantidad, 0)

        const pagosPendientes = pagos.lista.filter(p => p.status === 'pending').length
        const pagosExitosos = pagos.lista.filter(p => p.status === 'paid').length

        return { totalPagado, totalPendiente, pagosPendientes, pagosExitosos }
    }

    const resumen = calcularResumen()

    if (isLoading) {
        return (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Historial de Pagos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        Cargando historial de pagos...
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Historial de Pagos
                    </CardTitle>
                    {onAgregarPago && (
                        <Button onClick={onAgregarPago} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Registrar Pago
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Resumen de Pagos */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">
                            {pagos.cantidad}
                        </div>
                        <div className="text-sm text-blue-600">Total Registros</div>
                    </div>

                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">
                            {resumen.pagosExitosos}
                        </div>
                        <div className="text-sm text-green-600">Pagos Exitosos</div>
                    </div>

                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-700">
                            {resumen.pagosPendientes}
                        </div>
                        <div className="text-sm text-yellow-600">Pendientes</div>
                    </div>

                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-700">
                            {formatearMoneda(resumen.totalPagado)}
                        </div>
                        <div className="text-sm text-gray-600">Total Pagado</div>
                    </div>
                </div>

                {/* Lista de Pagos */}
                {pagos.lista.length > 0 ? (
                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Historial de Transacciones</h4>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {pagos.lista.map((pago) => {
                                const statusConfig = obtenerStatusConfig(pago.status)
                                const StatusIcon = statusConfig.icon

                                return (
                                    <div
                                        key={pago.id}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <StatusIcon className={`h-5 w-5 ${statusConfig.text}`} />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-gray-900">
                                                        {pago.montoFormateado || formatearMoneda(pago.cantidad)}
                                                    </span>
                                                    <Badge className={`${statusConfig.bg} ${statusConfig.text} text-xs`}>
                                                        {statusConfig.label}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {pago.concepto || 'Sin concepto especificado'}
                                                </p>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                                    <span>{obtenerMetodoPagoLabel(pago.metodoPago)}</span>
                                                    {pago.fechaFormateada && (
                                                        <span>{pago.fechaFormateada}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {onVerDetalle && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onVerDetalle(pago.id)}
                                                    className="h-8 w-8 p-0"
                                                    title="Ver detalles"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            )}

                                            {onDescargarRecibo && pago.status === 'paid' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onDescargarRecibo(pago.id)}
                                                    className="h-8 w-8 p-0"
                                                    title="Descargar recibo"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No hay pagos registrados</p>
                        <p className="text-sm mt-1">
                            {onAgregarPago ?
                                'Haz clic en "Registrar Pago" para agregar el primer pago' :
                                'Este evento aún no tiene pagos registrados'
                            }
                        </p>
                    </div>
                )}

                {/* Total Pendiente (si hay pagos pendientes) */}
                {resumen.totalPendiente > 0 && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-yellow-800">Pagos Pendientes</p>
                                <p className="text-sm text-yellow-600">
                                    {resumen.pagosPendientes} pago(s) por confirmar
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-yellow-800">
                                    {formatearMoneda(resumen.totalPendiente)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
