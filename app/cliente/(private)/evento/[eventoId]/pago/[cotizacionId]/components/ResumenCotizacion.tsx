'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'

interface Props {
    total: number
    pagado: number
    saldoPendiente: number
}

export default function ResumenCotizacion({ total, pagado, saldoPendiente }: Props) {
    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    return (
        <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
                <CardTitle className="text-zinc-100">Resumen de Cotización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between">
                    <span className="text-zinc-400">Total de la cotización:</span>
                    <span className="font-medium text-zinc-100">
                        {formatMoney(total)}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-zinc-400">Total pagado:</span>
                    <span className="font-medium text-green-400">
                        {formatMoney(pagado)}
                    </span>
                </div>
                <div className="border-t border-zinc-800 pt-4">
                    <div className="flex justify-between">
                        <span className="text-zinc-400 font-medium">Saldo pendiente:</span>
                        <span className="font-bold text-yellow-400 text-lg">
                            {formatMoney(saldoPendiente)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
