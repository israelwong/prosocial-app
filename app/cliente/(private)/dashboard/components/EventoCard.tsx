'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { CalendarDays, MapPin, CreditCard, Eye, Edit3, CheckCircle, Clock } from 'lucide-react'
import { COTIZACION_STATUS } from '@/app/admin/_lib/constants/status'
import { Evento } from '../../../_lib/types'

interface EventoCardProps {
    evento: Evento
}

export default function EventoCard({ evento }: EventoCardProps) {
    const router = useRouter()

    const formatFecha = (fecha: string) => {
        try {
            // Extraer solo la parte de la fecha (YYYY-MM-DD) si viene en formato ISO completo
            const fechaSolo = fecha.split('T')[0]
            // Crear la fecha sin conversión de zona horaria para evitar desfase
            const fechaObj = new Date(fechaSolo + 'T00:00:00')

            if (isNaN(fechaObj.getTime())) {
                // Si aún hay error, intentar con el formato original
                const fechaFallback = new Date(fecha)
                if (isNaN(fechaFallback.getTime())) {
                    return 'Fecha no válida'
                }
                return fechaFallback.toLocaleDateString('es-MX', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
            }

            return fechaObj.toLocaleDateString('es-MX', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        } catch (error) {
            console.error('Error formateando fecha:', error, 'Fecha recibida:', fecha)
            return 'Error en fecha'
        }
    }

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    const getDescuentoPorcentaje = () => {
        // 🎯 PRIORIZAR DESCUENTO CONGELADO: Usar descuento de la cotización si existe
        if (evento.cotizacion.descuento) {
            return evento.cotizacion.descuento
        }
        // Fallback: usar descuento de condiciones comerciales
        return evento.cotizacion.condicionesComerciales?.descuento || 0
    }

    const getDescuentoMonto = () => {
        const descuentoPorcentaje = getDescuentoPorcentaje()
        if (descuentoPorcentaje > 0) {
            return evento.cotizacion.total * (descuentoPorcentaje / 100)
        }
        return 0
    }

    const getMontoAPagar = () => {
        // Usar el monto real a pagar si está disponible
        if (evento.cotizacion.montoRealAPagar !== undefined) {
            return evento.cotizacion.montoRealAPagar
        }
        // Calcular basado en descuento congelado
        return evento.cotizacion.total - getDescuentoMonto()
    }

    const getSaldoPendiente = () => {
        // Usar el saldo pendiente calculado si está disponible
        if (evento.cotizacion.saldoPendiente !== undefined) {
            return evento.cotizacion.saldoPendiente
        }
        // Calcular basado en monto real a pagar
        return getMontoAPagar() - evento.cotizacion.pagado
    }

    const isPagado = () => {
        if (evento.cotizacion.status !== COTIZACION_STATUS.APROBADA) return false

        // Usar el cálculo correcto si está disponible
        if (evento.cotizacion.esPagoCompleto !== undefined) {
            return evento.cotizacion.esPagoCompleto
        }

        // Fallback al cálculo simple
        return getSaldoPendiente() <= 0
    }

    return (
        <Card className="hover:shadow-xl transition-all duration-300 border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/80 hover:border-zinc-700 group">
            <CardHeader className="pb-4">
                {/* Encabezado: Nombre del evento | Botón Editar */}
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-zinc-100 flex-1 group-hover:text-white transition-colors duration-200">
                        ✨ {evento.nombre}
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/cliente/evento/${evento.id}/editar`)}
                        className="text-zinc-400 hover:text-amber-400 p-2 transition-colors duration-200 hover:bg-zinc-800/50"
                    >
                        <Edit3 className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Cuerpo de la ficha con personalidad */}
                <div className="space-y-3">
                    {/* Línea 1: Fecha del evento */}
                    <div className="flex items-center text-sm text-zinc-300">
                        <CalendarDays className="h-4 w-4 mr-3 text-amber-400" />
                        <span className="font-medium">Fecha:</span>
                        <span className="ml-2 text-zinc-200">{formatFecha(evento.fecha_evento)}</span>
                    </div>

                    {/* Línea 2: Sede */}
                    <div className="flex items-center text-sm text-zinc-300">
                        <MapPin className="h-4 w-4 mr-3 text-rose-400" />
                        <span className="font-medium">Sede:</span>
                        <span className="ml-2 line-clamp-1 text-zinc-200">{evento.lugar}</span>
                    </div>

                    {/* Línea 3: Etapa del evento */}
                    <div className="flex items-center text-sm text-zinc-300">
                        <span className="font-medium">Etapa:</span>
                        <Badge
                            variant="outline"
                            className="ml-2 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 text-blue-300 border-blue-700/50 text-xs font-medium"
                        >
                            {evento.eventoEtapa?.nombre || 'Sin etapa'}
                        </Badge>
                    </div>

                    {/* 🆕 Línea 4: Pago SPEI pendiente con personalidad */}
                    {evento.cotizacion.pagoSpeiPendiente && (
                        <div className="flex items-center text-sm text-amber-300 bg-gradient-to-r from-amber-900/20 to-yellow-900/20 border border-amber-700/50 rounded-lg p-3 shadow-md">
                            <Clock className="h-5 w-5 mr-3 text-amber-400 animate-pulse" />
                            <div className="flex-1">
                                <div className="font-semibold flex items-center">
                                    Tu pago SPEI está en proceso
                                </div>
                                <div className="text-xs text-amber-400 mt-1 flex items-center">
                                    Confirmación bancaria: 24-48 horas •
                                    <span className="font-bold ml-1">{formatMoney(evento.cotizacion.pagoSpeiPendiente.monto)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Separador e información financiera */}
                {evento.cotizacion.status === COTIZACION_STATUS.APROBADA && (
                    <>
                        <hr className="border-zinc-700" />
                        <div className="space-y-2">
                            {/* Mostrar precio original con personalidad */}
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400 font-medium flex items-center">
                                    Total cotización:
                                </span>
                                <span className="text-zinc-100 font-semibold">
                                    {formatMoney(evento.cotizacion.total)}
                                </span>
                            </div>

                            {/* Mostrar descuento si aplica - Con personalidad */}
                            {getDescuentoPorcentaje() > 0 && (
                                <>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-green-400 font-medium flex items-center">
                                            🎉 Descuento ({getDescuentoPorcentaje()}%)
                                            {evento.cotizacion.descuento &&
                                                <span className="text-xs text-green-300 ml-1 bg-green-900/30 px-1 rounded">⭐ congelado</span>
                                            }:
                                        </span>
                                        <span className="text-green-400 font-semibold">
                                            -{formatMoney(getDescuentoMonto())}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm bg-gradient-to-r from-zinc-800/50 to-zinc-700/50 px-3 py-2 rounded-md border border-zinc-600/30">
                                        <span className="text-zinc-200 font-medium flex items-center">
                                            ✨ Total a pagar:
                                        </span>
                                        <span className="text-zinc-100 font-bold text-base">
                                            {formatMoney(getMontoAPagar())}
                                        </span>
                                    </div>
                                </>
                            )}

                            {/* Mostrar pagado con personalidad */}
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400 font-medium flex items-center">
                                    Abonado:
                                </span>
                                <span className="text-green-400 font-semibold">
                                    {formatMoney(evento.cotizacion.pagado)}
                                </span>
                            </div>

                            {/* Mostrar saldo pendiente con personalidad */}
                            {getSaldoPendiente() > 0 && (
                                <div className="flex justify-between text-sm bg-yellow-900/20 border border-yellow-800/50 px-3 py-2 rounded-md">
                                    <span className="text-yellow-300 font-medium flex items-center">
                                        Saldo pendiente:
                                    </span>
                                    <span className="text-yellow-400 font-bold">
                                        {formatMoney(getSaldoPendiente())}
                                    </span>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Botones de acción con personalidad */}
                <div className="flex gap-2 pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 transition-all duration-200"
                        onClick={() => router.push(`/cliente/evento/${evento.id}`)}
                    >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalles
                    </Button>

                    {evento.cotizacion.status === COTIZACION_STATUS.APROBADA && (
                        <Button
                            size="sm"
                            className={`flex-1 transition-all duration-200 ${isPagado()
                                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white cursor-default shadow-lg'
                                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
                                }`}
                            onClick={() => !isPagado() && router.push(`/cliente/evento/${evento.id}/pago/${evento.cotizacion.id}`)}
                            disabled={isPagado()}
                        >
                            {isPagado() ? (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Pagado
                                </>
                            ) : (
                                <>
                                    <CreditCard className="h-4 w-4 mr-1" />
                                    Pagar Ahora
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
