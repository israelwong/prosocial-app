'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { DollarSign, CreditCard, CheckCircle, XCircle, Clock } from "lucide-react"

interface ResumenFinancieroV3Props {
    cotizacion: {
        existe: boolean
        id?: string
        status?: string
        precio?: number
    }
    pagos: {
        cantidad: number
        lista: Array<{
            id: string
            cantidad: number
            status: string
            metodoPago: string
            concepto?: string
        }>
    }
}

const PAGO_STATUS_STYLES = {
    'paid': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
    'failed': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    'cancelled': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle }
} as const

const COTIZACION_STATUS_STYLES = {
    'aprobada': 'bg-green-100 text-green-800',
    'pendiente': 'bg-yellow-100 text-yellow-800',
    'rechazada': 'bg-red-100 text-red-800',
    'borrador': 'bg-gray-100 text-gray-800'
} as const

export function ResumenFinancieroV3({ cotizacion, pagos }: ResumenFinancieroV3Props) {
    if (!cotizacion.existe) {
        return (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Resumen Financiero
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        No hay cotización asociada a este evento
                    </div>
                </CardContent>
            </Card>
        )
    }

    const totalCotizacion = cotizacion.precio || 0
    const totalPagado = pagos.lista
        .filter(pago => pago.status === 'paid')
        .reduce((sum, pago) => sum + (pago.cantidad || 0), 0)

    const progresoPago = totalCotizacion > 0 ? (totalPagado / totalCotizacion) * 100 : 0
    const saldoPendiente = totalCotizacion - totalPagado

    const statusStyle = COTIZACION_STATUS_STYLES[cotizacion.status as keyof typeof COTIZACION_STATUS_STYLES]
        || 'bg-gray-100 text-gray-800'

    const formatearMoneda = (cantidad: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(cantidad)
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Resumen Financiero
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Estado de la Cotización */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">Estado de la Cotización</p>
                        <Badge className={`mt-1 ${statusStyle}`}>
                            {(cotizacion.status || 'Sin estado').charAt(0).toUpperCase() + (cotizacion.status || 'Sin estado').slice(1)}
                        </Badge>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Total de la Cotización</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatearMoneda(totalCotizacion)}
                        </p>
                    </div>
                </div>

                {/* Progreso de Pagos */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progreso de Pagos</span>
                        <span className="font-medium">{progresoPago.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(progresoPago, 100)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Pagado: {formatearMoneda(totalPagado)}</span>
                        <span>Pendiente: {formatearMoneda(saldoPendiente)}</span>
                    </div>
                </div>

                {/* Resumen de Pagos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">
                            {pagos.lista.filter(p => p.status === 'paid').length}
                        </div>
                        <div className="text-sm text-green-600">Pagos Exitosos</div>
                    </div>

                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-700">
                            {pagos.lista.filter(p => p.status === 'pending').length}
                        </div>
                        <div className="text-sm text-yellow-600">Pagos Pendientes</div>
                    </div>

                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-700">
                            {pagos.cantidad}
                        </div>
                        <div className="text-sm text-gray-600">Total de Pagos</div>
                    </div>
                </div>

                {/* Lista de Pagos Recientes */}
                {pagos.lista.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Últimos Pagos</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {pagos.lista.slice(0, 5).map((pago) => {
                                const statusConfig = PAGO_STATUS_STYLES[pago.status as keyof typeof PAGO_STATUS_STYLES]
                                    || PAGO_STATUS_STYLES.pending
                                const StatusIcon = statusConfig.icon

                                return (
                                    <div key={pago.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <StatusIcon className="h-4 w-4 text-gray-500" />
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {formatearMoneda(pago.cantidad)}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {pago.concepto || 'Sin concepto'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge className={`${statusConfig.bg} ${statusConfig.text} text-xs`}>
                                                {pago.status}
                                            </Badge>
                                            <p className="text-xs text-gray-500 mt-1">
                                                <CreditCard className="h-3 w-3 inline mr-1" />
                                                {pago.metodoPago}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
