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

    const getSaldoPendiente = (total: number, pagado: number) => {
        return total - pagado
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
                <div className="space-y-3">
                    <div className="flex justify-between py-2">
                        <span className="text-zinc-400">Total del evento:</span>
                        <span className="font-semibold text-zinc-100">
                            {formatMoney(evento.cotizacion.total)}
                        </span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-zinc-400">Pagado:</span>
                        <span className="font-semibold text-green-400">
                            {formatMoney(evento.cotizacion.pagado)}
                        </span>
                    </div>
                    <div className="border-t border-zinc-700 pt-3">
                        <div className="flex justify-between py-2">
                            <span className="text-zinc-300 font-medium">Saldo pendiente:</span>
                            <span className="font-bold text-amber-400">
                                {formatMoney(getSaldoPendiente(evento.cotizacion.total, evento.cotizacion.pagado))}
                            </span>
                        </div>
                    </div>
                </div>

                {getSaldoPendiente(evento.cotizacion.total, evento.cotizacion.pagado) > 0 && (
                    <Button
                        onClick={() => router.push(`/cliente/evento/${evento.id}/pago/${evento.cotizacion.id}`)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Realizar Pago
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
