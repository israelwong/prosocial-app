'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { History } from 'lucide-react'

interface Pago {
    id: string
    monto: number
    metodo_pago: string
    status: string
    createdAt: Date
}

interface Props {
    pagos: Pago[]
}

export default function HistorialPagos({ pagos }: Props) {
    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    const formatFecha = (fecha: string | Date) => {
        const date = typeof fecha === 'string' ? new Date(fecha) : fecha
        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completado':
            case 'succeeded':
            case 'paid':
                return 'bg-green-900/20 text-green-300 border-green-800'
            case 'pendiente':
            case 'pending':
                return 'bg-amber-900/20 text-amber-300 border-amber-800'
            case 'fallido':
            case 'failed':
            case 'cancelled':
            case 'cancelado':
            case 'error':
                return 'bg-red-900/20 text-red-300 border-red-800'
            default:
                return 'bg-zinc-800 text-zinc-400 border-zinc-700'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completado':
            case 'succeeded':
            case 'paid':
                return 'Pagado'
            case 'pendiente':
            case 'pending':
                return 'Pendiente'
            case 'fallido':
            case 'failed':
            case 'cancelled':
            case 'cancelado':
                return 'Cancelado'
            case 'error':
                return 'Error'
            default:
                return status
        }
    }

    const formatMetodoPago = (metodoPago: string) => {
        if (!metodoPago) return 'N/A'

        // Mapeo de métodos de pago comunes
        const metodosComunes: Record<string, string> = {
            'tarjeta': 'Tarjeta',
            'tarjeta_credito': 'Tarjeta de Crédito',
            'tarjeta_debito': 'Tarjeta de Débito',
            'credit_card': 'Tarjeta de Crédito',
            'debit_card': 'Tarjeta de Débito',
            'transferencia': 'Transferencia Bancaria',
            'transferencia_bancaria': 'Transferencia Bancaria',
            'bank_transfer': 'Transferencia Bancaria',
            'efectivo': 'Efectivo',
            'cash': 'Efectivo',
            'paypal': 'PayPal',
            'stripe': 'Stripe',
            'oxxo': 'OXXO',
            'spei': 'SPEI'
        }

        // Buscar en el mapeo primero
        const metodoLimpio = metodoPago.toLowerCase()
        if (metodosComunes[metodoLimpio]) {
            return metodosComunes[metodoLimpio]
        }

        // Si no está en el mapeo, limpiar caracteres especiales y capitalizar
        return metodoPago
            .replace(/_/g, ' ')           // Reemplazar _ con espacios
            .replace(/-/g, ' ')           // Reemplazar - con espacios
            .replace(/\b\w/g, l => l.toUpperCase()) // Capitalizar primera letra de cada palabra
    }

    return (
        <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
                <CardTitle className="text-zinc-100 flex items-center">
                    <History className="h-5 w-5 mr-2" />
                    Historial de Pagos
                </CardTitle>
            </CardHeader>
            <CardContent>
                {pagos && pagos.length > 0 ? (
                    <div className="space-y-3">
                        {pagos.map((pago) => (
                            <div
                                key={pago.id}
                                className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-zinc-100">
                                            {formatMoney(pago.monto)}
                                        </span>
                                        <Badge
                                            className={getStatusColor(pago.status)}
                                            variant="outline"
                                        >
                                            {getStatusText(pago.status)}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-zinc-400">
                                        {formatFecha(pago.createdAt)}
                                    </div>
                                    {pago.metodo_pago && (
                                        <div className="text-sm text-zinc-500">
                                            {formatMetodoPago(pago.metodo_pago)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-zinc-400">No hay pagos registrados aún.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
