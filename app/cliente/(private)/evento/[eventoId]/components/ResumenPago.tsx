import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { CreditCard } from 'lucide-react'
import type { EventoDetalle } from '../../../../_lib/types'

interface ResumenPagoProps {
    evento: EventoDetalle
}

export default function ResumenPago({ evento }: ResumenPagoProps) {


    console.log('🔍 DEBUG ResumenPago - Datos del evento:', {
        cotizacion: {
            id: evento.cotizacion.id,
            total: evento.cotizacion.total,
            pagado: evento.cotizacion.pagado,
            montoRealAPagar: evento.cotizacion.montoRealAPagar,
            saldoPendiente: evento.cotizacion.saldoPendiente,
            esPagoCompleto: evento.cotizacion.esPagoCompleto,
            condicionesComerciales: evento.cotizacion.condicionesComerciales,
            pagoSpeiPendiente: evento.cotizacion.pagoSpeiPendiente
        }
    })

    const router = useRouter()

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    // 🎯 USAR DATOS YA CALCULADOS EN obtenerEventoDetalle
    const cotizacion = evento.cotizacion

    // Usar directamente los datos ya calculados
    const totalCotizacion = cotizacion.total
    const montoRealAPagar = cotizacion.montoRealAPagar
    const saldoPendiente = cotizacion.saldoPendiente
    const isPagado = cotizacion.esPagoCompleto

    // 🎯 USAR DESCUENTO CONGELADO: Priorizar el descuento de la cotización
    let descuentoPorcentaje = 0

    if (cotizacion.descuento) {
        // 🎯 Usar el descuento congelado en la cotización (más confiable)
        descuentoPorcentaje = cotizacion.descuento
    } else {
        // Fallback: usar condiciones comerciales (para cotizaciones anteriores)
        const condicionesComerciales = cotizacion.pagoSpeiPendiente?.condicionesComerciales ||
            cotizacion.condicionesComerciales
        descuentoPorcentaje = condicionesComerciales?.descuento || 0
    }

    // Calcular descuento para mostrar en pantalla
    const descuentoMonto = descuentoPorcentaje > 0 ? (totalCotizacion * descuentoPorcentaje) / 100 : 0

    console.log('🎯 DEBUG ResumenPago - Cálculo de descuento:', {
        descuentoCongelado: cotizacion.descuento,
        descuentoPorcentaje,
        descuentoMonto,
        totalCotizacion,
        montoRealAPagar
    })

    return (
        <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
                <CardTitle className="flex items-center text-zinc-100">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Resumen de Pago
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* 📊 FORMATO SIMPLIFICADO */}
                <div className="space-y-3">

                    {/* Total precio cotización */}
                    <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                        <span className="text-zinc-300">Total precio cotización:</span>
                        <span className="font-medium text-zinc-100">{formatMoney(totalCotizacion)}</span>
                    </div>

                    {/* Descuentos (si existen) */}
                    {descuentoPorcentaje > 0 && (
                        <div className="flex justify-between items-center py-2">
                            <span className="text-green-400">
                                Descuento {descuentoPorcentaje.toFixed(0)}%:
                            </span>
                            <span className="font-medium text-green-400">
                                -{formatMoney(descuentoMonto)}
                            </span>
                        </div>
                    )}

                    {/* Total a pagar */}
                    <div className="flex justify-between items-center py-2 bg-blue-900/20 border border-blue-800 rounded-lg px-4">
                        <span className="text-blue-300 font-medium">Total a pagar:</span>
                        <span className="font-bold text-blue-100">{formatMoney(montoRealAPagar)}</span>
                    </div>

                    {/* Total pagado (si hay pagos) */}
                    {cotizacion.pagado > 0 && (
                        <div className="flex justify-between items-center py-2">
                            <span className="text-zinc-300">Total pagado:</span>
                            <span className="font-medium text-green-400">{formatMoney(cotizacion.pagado)}</span>
                        </div>
                    )}

                    {/* Balance: pendiente o pagado */}
                    <div className={`flex justify-between items-center py-3 px-4 rounded-lg border ${isPagado
                        ? 'bg-green-900/20 border-green-700'
                        : 'bg-amber-900/20 border-amber-700'
                        }`}>
                        <span className={`font-medium ${isPagado ? 'text-green-200' : 'text-amber-200'}`}>
                            Balance:
                        </span>
                        <span className={`font-bold text-lg ${isPagado ? 'text-green-400' : 'text-amber-300'}`}>
                            {isPagado ? 'PAGADO' : formatMoney(saldoPendiente)}
                        </span>
                    </div>

                    {/* Información adicional del SPEI pendiente */}
                    {cotizacion.pagoSpeiPendiente && !isPagado && (
                        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
                            <div className="text-blue-300 text-sm text-center">
                                💳 Hay un pago SPEI de {formatMoney(cotizacion.pagoSpeiPendiente.monto)} pendiente de validación
                            </div>
                            <div className="text-blue-400 text-xs text-center mt-1">
                                Tiempo estimado: 24-48 horas hábiles
                            </div>
                        </div>
                    )}

                    {/* Botón de pago si hay saldo pendiente */}
                    {!isPagado && saldoPendiente > 0 && (
                        <Button
                            onClick={() => router.push(`/cliente/evento/${evento.id}/pago/${evento.cotizacion.id}`)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                        >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Realizar Pago ({formatMoney(saldoPendiente)})
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
