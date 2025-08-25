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
        return new Date(fecha).toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    const getSaldoPendiente = (total: number, pagado: number) => {
        return total - pagado
    }

    const isPagado = () => {
        if (evento.cotizacion.status !== COTIZACION_STATUS.APROBADA) return false
        return getSaldoPendiente(evento.cotizacion.total, evento.cotizacion.pagado) <= 0
    }

    return (
        <Card className="hover:shadow-lg transition-shadow border-zinc-800 bg-zinc-900">
            <CardHeader className="pb-4">
                {/* Encabezado: Nombre del evento | Botón Editar */}
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-zinc-100 flex-1">
                        {evento.nombre}
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/cliente/evento/${evento.id}/editar`)}
                        className="text-zinc-400 hover:text-zinc-100 p-2"
                    >
                        <Edit3 className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Cuerpo de la ficha */}
                <div className="space-y-3">
                    {/* Línea 1: Fecha del evento */}
                    <div className="flex items-center text-sm text-zinc-300">
                        <CalendarDays className="h-4 w-4 mr-2 text-zinc-400" />
                        <span className="font-medium">Fecha:</span>
                        <span className="ml-2">{formatFecha(evento.fecha_evento)}</span>
                    </div>

                    {/* Línea 2: Sede */}
                    <div className="flex items-center text-sm text-zinc-300">
                        <MapPin className="h-4 w-4 mr-2 text-zinc-400" />
                        <span className="font-medium">Sede:</span>
                        <span className="ml-2 line-clamp-1">{evento.lugar}</span>
                    </div>

                    {/* Línea 3: Etapa del evento */}
                    <div className="flex items-center text-sm text-zinc-300">
                        <span className="font-medium">Etapa:</span>
                        <Badge
                            variant="outline"
                            className="ml-2 bg-blue-900/20 text-blue-300 border-blue-800 text-xs"
                        >
                            {evento.eventoEtapa?.nombre || 'Sin etapa'}
                        </Badge>
                    </div>

                    {/* 🆕 Línea 4: Pago SPEI pendiente */}
                    {evento.cotizacion.pagoSpeiPendiente && (
                        <div className="flex items-center text-sm text-amber-300 bg-amber-900/20 border border-amber-800 rounded p-2">
                            <Clock className="h-4 w-4 mr-2 text-amber-400" />
                            <div className="flex-1">
                                <div className="font-medium">Tu pago SPEI está siendo procesado</div>
                                <div className="text-xs text-amber-400 mt-1">
                                    Confirmación bancaria: 24-48 horas • {formatMoney(evento.cotizacion.pagoSpeiPendiente.monto)}
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
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400 font-medium">Total:</span>
                                <span className="text-zinc-100">
                                    {formatMoney(evento.cotizacion.total)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400 font-medium">Pagado:</span>
                                <span className="text-green-400">
                                    {formatMoney(evento.cotizacion.pagado)}
                                </span>
                            </div>
                            {getSaldoPendiente(evento.cotizacion.total, evento.cotizacion.pagado) > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400 font-medium">Saldo pendiente:</span>
                                    <span className="text-yellow-400">
                                        {formatMoney(getSaldoPendiente(evento.cotizacion.total, evento.cotizacion.pagado))}
                                    </span>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Botones de acción */}
                <div className="flex gap-2 pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                        onClick={() => router.push(`/cliente/evento/${evento.id}`)}
                    >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalles
                    </Button>

                    {evento.cotizacion.status === COTIZACION_STATUS.APROBADA && (
                        <Button
                            size="sm"
                            className={`flex-1 ${isPagado()
                                ? 'bg-green-600 hover:bg-green-700 text-white cursor-default'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
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
                                    Pagar
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
