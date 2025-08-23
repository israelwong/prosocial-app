'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { CalendarDays, MapPin, CreditCard, Eye } from 'lucide-react'
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

    return (
        <Card className="hover:shadow-lg transition-shadow border-zinc-800 bg-zinc-900">
            <CardHeader className="pb-4">
                {/* Encabezado: Tipo Evento | Nombre | Etapa */}
                <div className="flex items-center justify-between gap-2">
                    {/* Tipo de evento */}
                    <Badge
                        variant="outline"
                        className="bg-purple-900/20 text-purple-300 border-purple-800 text-xs flex-shrink-0"
                    >
                        {evento.eventoTipo?.nombre || 'Sin tipo'}
                    </Badge>

                    {/* Nombre del evento */}
                    <CardTitle className="text-sm font-semibold line-clamp-1 text-zinc-100 text-center flex-1 px-2">
                        {evento.nombre}
                    </CardTitle>

                    {/* Etapa del evento */}
                    <Badge
                        variant="outline"
                        className="bg-blue-900/20 text-blue-300 border-blue-800 text-xs flex-shrink-0"
                    >
                        {evento.eventoEtapa?.nombre || 'Sin etapa'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    <div className="flex items-center text-sm text-zinc-400">
                        <CalendarDays className="h-4 w-4 mr-2" />
                        {formatFecha(evento.fecha_evento)}
                    </div>

                    <div className="flex items-center text-sm text-zinc-400">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="line-clamp-1">{evento.lugar}</span>
                    </div>
                </div>

                {evento.cotizacion.status === COTIZACION_STATUS.APROBADA && (
                    <div className="border-t border-zinc-800 pt-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Total:</span>
                                <span className="font-medium text-zinc-100">
                                    {formatMoney(evento.cotizacion.total)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Pagado:</span>
                                <span className="font-medium text-green-400">
                                    {formatMoney(evento.cotizacion.pagado)}
                                </span>
                            </div>
                            {getSaldoPendiente(evento.cotizacion.total, evento.cotizacion.pagado) > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Saldo pendiente:</span>
                                    <span className="font-medium text-yellow-400">
                                        {formatMoney(getSaldoPendiente(evento.cotizacion.total, evento.cotizacion.pagado))}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex gap-2 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                        onClick={() => router.push(`/cliente/evento/${evento.id}`)}
                    >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalles
                    </Button>

                    {evento.cotizacion.status === COTIZACION_STATUS.APROBADA &&
                        getSaldoPendiente(evento.cotizacion.total, evento.cotizacion.pagado) > 0 && (
                            <Button
                                size="sm"
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => router.push(`/cliente/evento/${evento.id}/pago/${evento.cotizacion.id}`)}
                            >
                                <CreditCard className="h-4 w-4 mr-1" />
                                Pagar
                            </Button>
                        )}
                </div>
            </CardContent>
        </Card>
    )
}
