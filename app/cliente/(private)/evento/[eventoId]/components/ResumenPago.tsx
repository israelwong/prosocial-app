import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { CreditCard } from 'lucide-react'
import type { EventoDetalle } from '../../../../_lib/types'

interface ResumenPagoProps {
    evento: EventoDetalle
}

export default function ResumenPago({ evento }: ResumenPagoProps) {
    const router = useRouter()

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    // Cálculos financieros específicos para condiciones comerciales
    const getTotalEvento = () => evento.cotizacion.total

    // Obtener información específica del pago SPEI
    const getCondicionesComercialesToaltesPago = () => {
        // Usar condiciones comerciales del pago SPEI si están disponibles
        if (evento.cotizacion.pagoSpeiPendiente?.condicionesComerciales) {
            return evento.cotizacion.pagoSpeiPendiente.condicionesComerciales
        }
        // Fallback a condiciones comerciales de la cotización
        return evento.cotizacion.condicionesComerciales
    }

    const getDescuentoMonto = () => {
        const condiciones = getCondicionesComercialesToaltesPago()
        if (!condiciones?.descuento) return 0
        return (getTotalEvento() * condiciones.descuento) / 100
    }

    const esMetodoSpei = () => {
        // Verificar si el método de pago del SPEI es efectivamente SPEI
        const metodoPago = evento.cotizacion.pagoSpeiPendiente?.metodoPago
        if (metodoPago) {
            return metodoPago.payment_method === 'customer_balance' ||
                metodoPago.metodo_pago.toLowerCase().includes('spei') ||
                metodoPago.metodo_pago.toLowerCase().includes('transferencia')
        }
        return false
    }

    const esAnticipoCompleto = () => {
        const condiciones = getCondicionesComercialesToaltesPago()
        return condiciones?.porcentaje_anticipo === 100
    }

    // Verificar si debe mostrar formato específico para PAGO COMPLETO con SPEI
    const mostrarFormatoSpei = () => {
        // Debe tener pago SPEI pendiente y ser método SPEI y anticipo 100%
        return !!evento.cotizacion.pagoSpeiPendiente &&
            esMetodoSpei() &&
            esAnticipoCompleto()
    }

    const getSubtotal = () => getTotalEvento() - getDescuentoMonto()

    const getMontoSpeiPendiente = () => {
        return evento.cotizacion.pagoSpeiPendiente?.monto || 0
    }

    const isSpeiValidado = () => {
        return evento.cotizacion.pagoSpeiPendiente?.status === 'success' ||
            evento.cotizacion.pagoSpeiPendiente?.status === 'approved'
    }

    const isEventoPagado = () => {
        // Si hay SPEI validado y el monto coincide con el subtotal
        if (isSpeiValidado() && getMontoSpeiPendiente() >= getSubtotal()) {
            return true
        }
        // O si el saldo pendiente es 0 o menor
        return evento.cotizacion.saldoPendiente !== undefined
            ? evento.cotizacion.saldoPendiente <= 0
            : (evento.cotizacion.total - evento.cotizacion.pagado) <= 0
    }

    const getSaldoPendiente = () => {
        if (isSpeiValidado() && getMontoSpeiPendiente() >= getSubtotal()) {
            return 0
        }

        if (evento.cotizacion.saldoPendiente !== undefined) {
            return evento.cotizacion.saldoPendiente
        }

        return getSubtotal() - evento.cotizacion.pagado
    }

    return (
        <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
                <CardTitle className="flex items-center text-zinc-100">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Resumen de Pago
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {mostrarFormatoSpei() ? (
                    /* Formato específico para PAGO COMPLETO con SPEI */
                    <div className="space-y-3">
                        {/* Total del evento */}
                        <div className="flex justify-between items-center py-2">
                            <span className="text-zinc-300 text-sm">Total evento</span>
                            <span className="font-semibold text-zinc-100">{formatMoney(getTotalEvento())}</span>
                        </div>

                        {/* Descuento por pago completo */}
                        {getCondicionesComercialesToaltesPago()?.descuento && esAnticipoCompleto() && (
                            <div className="flex justify-between items-center py-1">
                                <span className="text-green-400 text-xs">
                                    Descuento {getCondicionesComercialesToaltesPago()?.nombre || 'aplicado'} ({getCondicionesComercialesToaltesPago()?.descuento}%)
                                </span>
                                <span className="font-medium text-green-400 text-xs">
                                    -{formatMoney(getDescuentoMonto())}
                                </span>
                            </div>
                        )}

                        {/* Subtotal */}
                        <div className="flex justify-between items-center py-2 border-y border-zinc-800">
                            <span className="text-blue-300 text-sm font-medium">Subtotal</span>
                            <span className="font-bold text-blue-100">{formatMoney(getSubtotal())}</span>
                        </div>

                        {/* Monto SPEI pendiente a validar */}
                        <div className={`p-3 rounded-lg ${isSpeiValidado() ? 'bg-green-900/20 border border-green-700' : 'bg-amber-900/20 border border-amber-700'}`}>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className={`text-sm font-medium ${isSpeiValidado() ? 'text-green-200' : 'text-amber-200'}`}>
                                        Monto SPEI {isSpeiValidado() ? 'validado' : 'pendiente a validar'}
                                    </span>
                                    <span className={`font-bold ${isSpeiValidado() ? 'text-green-400' : 'text-amber-300'}`}>
                                        {formatMoney(getMontoSpeiPendiente())}
                                    </span>
                                </div>

                                <div className={`text-xs ${isSpeiValidado() ? 'text-green-400' : 'text-amber-400'}`}>
                                    {isSpeiValidado() ?
                                        '✅ SPEI validado y aplicado al evento' :
                                        '⏳ Pendiente de confirmación bancaria'
                                    }
                                </div>

                                {!isSpeiValidado() && (
                                    <div className="text-amber-400 text-xs">
                                        Tiempo estimado: 24-48 horas hábiles
                                    </div>
                                )}

                                {/* Resultado final */}
                                {Math.abs(getMontoSpeiPendiente() - getSubtotal()) < 0.01 && (
                                    <div className={`text-xs pt-2 border-t ${isSpeiValidado() ? 'border-green-600 text-green-400' : 'border-amber-600 text-amber-300'}`}>
                                        {isSpeiValidado() ?
                                            '✅ Evento completamente pagado' :
                                            '⏳ Al validarse el SPEI, evento quedará pagado'
                                        }
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* No mostrar botón de pago para pagos completos con SPEI */}
                    </div>
                ) : (
                    /* Formato estándar para otros casos */
                    <div className="space-y-3">
                        {/* Si hay SPEI pero NO es pago completo (anticipo), mostrar leyenda especial */}
                        {evento.cotizacion.pagoSpeiPendiente && !mostrarFormatoSpei() && (
                            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-4">
                                <div className="text-center">
                                    <div className="text-blue-300 font-medium mb-2">
                                        💳 Hay pagos pendientes por aplicar
                                    </div>
                                    <div className="text-blue-400 text-sm">
                                        Ver historial de pagos para más detalles
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Precio original */}
                        <div className="flex justify-between py-2 border-b border-zinc-800">
                            <span className="text-zinc-400">Subtotal del evento:</span>
                            <span className="font-medium text-zinc-100">
                                {formatMoney(evento.cotizacion.total)}
                            </span>
                        </div>

                        {/* Mostrar descuento si aplica */}
                        {evento.cotizacion.condicionesComerciales?.descuento && (
                            <div className="flex justify-between py-2">
                                <span className="text-green-400 flex items-center">
                                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                    Descuento {evento.cotizacion.condicionesComerciales.nombre || 'aplicado'} ({evento.cotizacion.condicionesComerciales.descuento}%):
                                </span>
                                <span className="font-medium text-green-400">
                                    -{formatMoney(getDescuentoMonto())}
                                </span>
                            </div>
                        )}

                        {/* Total a pagar destacado */}
                        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <span className="text-blue-300 font-medium text-lg">Total a pagar:</span>
                                <span className="font-bold text-blue-100 text-xl">
                                    {formatMoney(getSubtotal())}
                                </span>
                            </div>
                        </div>

                        {/* Separador */}
                        <div className="border-t border-zinc-700 pt-3"></div>

                        {/* Monto pagado */}
                        <div className="flex justify-between py-2">
                            <span className="text-zinc-400">Monto pagado:</span>
                            <span className="font-medium text-green-400">
                                {formatMoney(evento.cotizacion.pagado)}
                            </span>
                        </div>

                        {/* Saldo pendiente */}
                        <div className="flex justify-between py-2">
                            <span className="text-zinc-300 font-medium">Saldo pendiente:</span>
                            <span className={`font-bold ${getSaldoPendiente() > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                                {formatMoney(getSaldoPendiente())}
                            </span>
                        </div>

                        {/* Información de pago SPEI pendiente */}
                        {evento.cotizacion.pagoSpeiPendiente && !mostrarFormatoSpei() && (
                            <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-amber-800 rounded-full flex items-center justify-center">
                                            <span className="text-amber-300 text-sm font-bold">🏦</span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-amber-200 font-medium mb-1">
                                            Pago SPEI en confirmación
                                        </div>
                                        <div className="text-amber-300 text-sm space-y-1">
                                            <div>
                                                <span className="font-medium">Monto:</span> {formatMoney(evento.cotizacion.pagoSpeiPendiente.monto)}
                                            </div>
                                            <div>
                                                <span className="font-medium">Estado:</span> {
                                                    evento.cotizacion.pagoSpeiPendiente.status === 'pending' ? 'Pendiente de confirmación' :
                                                        evento.cotizacion.pagoSpeiPendiente.status === 'processing' ? 'En proceso' :
                                                            evento.cotizacion.pagoSpeiPendiente.status
                                                }
                                            </div>
                                            <div className="text-amber-400 text-xs mt-2 flex items-center">
                                                <span className="mr-1">⏱️</span>
                                                Tiempo estimado de confirmación: 24-48 horas hábiles
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botón de pago - solo si hay saldo pendiente y no está pagado completo */}
                        {!isEventoPagado() && getSaldoPendiente() > 0 && (
                            <Button
                                onClick={() => router.push(`/cliente/evento/${evento.id}/pago/${evento.cotizacion.id}`)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                            >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Realizar Pago ({formatMoney(getSaldoPendiente())})
                            </Button>
                        )}

                        {/* Mensaje de pago completo */}
                        {isEventoPagado() && (
                            <div className="w-full p-4 bg-green-900/20 border border-green-700 rounded-lg">
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm">✓</span>
                                    </div>
                                    <span className="text-green-300 font-medium">Evento completamente pagado</span>
                                </div>
                                {evento.cotizacion.condicionesComerciales?.descuento && (
                                    <div className="text-green-400 text-xs text-center mt-2">
                                        Descuento de {evento.cotizacion.condicionesComerciales.descuento}% aplicado exitosamente
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
