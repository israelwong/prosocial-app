'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"

interface BalanceFinancieroPlaceholderProps {
    cotizacion?: {
        precio?: number
        status?: string
    } | null
    totalPagos?: number
    numeroPagos?: number
}

export function BalanceFinancieroPlaceholder({
    cotizacion,
    totalPagos = 0,
    numeroPagos = 0
}: BalanceFinancieroPlaceholderProps) {

    const saldoPendiente = (cotizacion?.precio || 0) - totalPagos
    const porcentajePagado = cotizacion?.precio ? (totalPagos / cotizacion.precio) * 100 : 0

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Balance Financiero
                    <Badge variant="outline" className="ml-2">
                        Resumen
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Información básica rápida */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-800">Cotización</p>
                            <p className="text-lg font-bold text-blue-900">
                                ${(cotizacion?.precio || 0).toLocaleString()}
                            </p>
                        </div>

                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-sm font-medium text-green-800">Pagado</p>
                            <p className="text-lg font-bold text-green-900">
                                ${totalPagos.toLocaleString()}
                            </p>
                        </div>

                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm font-medium text-yellow-800">Saldo</p>
                            <p className="text-lg font-bold text-yellow-900">
                                ${saldoPendiente.toLocaleString()}
                            </p>
                        </div>

                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-sm font-medium text-purple-800">Pagos</p>
                            <p className="text-lg font-bold text-purple-900">
                                {numeroPagos}
                            </p>
                        </div>
                    </div>

                    {/* Barra de progreso simple */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Progreso de pagos</span>
                            <span>{porcentajePagado.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(porcentajePagado, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg">
                        {saldoPendiente > 0 ? (
                            <>
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm text-yellow-700">
                                    Saldo pendiente por pagar
                                </span>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-700">
                                    Pagos completos
                                </span>
                            </>
                        )}
                    </div>

                    {/* Placeholder para componente complejo */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">
                            Componente de Balance Financiero Completo
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            Aquí se integrará el análisis detallado de pagos,
                            cronograma y gráficos financieros
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
