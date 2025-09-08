import { BalanceFinanciero } from '@/types/dashboard'
import { DollarSign, TrendingUp, AlertCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface BalanceFinancieroWidgetProps {
    balance: BalanceFinanciero
}

export function BalanceFinancieroWidget({ balance }: BalanceFinancieroWidgetProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    return (
        <div className="bg-zinc-900 rounded-lg shadow-sm border border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-400" />
                    Balance del Mes
                </h3>
                {balance.pagosVencidos.length > 0 && (
                    <span className="bg-red-950/50 text-red-300 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 border border-red-800">
                        <AlertCircle className="h-3 w-3" />
                        {balance.pagosVencidos.length} vencidos
                    </span>
                )}
            </div>

            {/* Resumen principal */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-green-950/30 rounded-lg border border-green-800">
                    <div className="text-2xl font-bold text-green-300">
                        {formatCurrency(balance.totalPagado)}
                    </div>
                    <div className="text-sm text-green-400">Pagado</div>
                </div>
                <div className="text-center p-4 bg-orange-950/30 rounded-lg border border-orange-800">
                    <div className="text-2xl font-bold text-orange-300">
                        {formatCurrency(balance.totalPendiente)}
                    </div>
                    <div className="text-sm text-orange-400">Pendiente</div>
                </div>
            </div>

            {/* Barra de progreso */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-zinc-300">Progreso de cobro</span>
                    <span className="text-sm text-zinc-400">{balance.porcentajePagado.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(balance.porcentajePagado, 100)}%` }}
                    />
                </div>
            </div>

            {/* Pagos pendientes/vencidos */}
            {(balance.pagosPendientes.length > 0 || balance.pagosVencidos.length > 0) && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-zinc-300 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Requieren atención
                    </h4>

                    {/* Pagos vencidos */}
                    {balance.pagosVencidos.map((pago) => (
                        <Link
                            key={pago.id}
                            href={`/admin/dashboard/eventos/${pago.eventoId}#pagos`}
                            className="block p-3 bg-red-950/30 border border-red-800 rounded-lg hover:bg-red-950/50 transition-colors"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-red-300 truncate">
                                        {pago.evento_nombre}
                                    </p>
                                    <p className="text-xs text-red-400">
                                        {pago.cliente_nombre} • Vencido hace {pago.diasVencido} días
                                    </p>
                                </div>
                                <span className="text-sm font-semibold text-red-200">
                                    {formatCurrency(pago.monto)}
                                </span>
                            </div>
                        </Link>
                    ))}

                    {/* Pagos pendientes (no vencidos) */}
                    {balance.pagosPendientes.slice(0, 2).map((pago) => (
                        <Link
                            key={pago.id}
                            href={`/admin/dashboard/eventos/${pago.eventoId}#pagos`}
                            className="block p-3 bg-orange-950/30 border border-orange-800 rounded-lg hover:bg-orange-950/50 transition-colors"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-orange-300 truncate">
                                        {pago.evento_nombre}
                                    </p>
                                    <p className="text-xs text-orange-400">
                                        {pago.cliente_nombre}
                                    </p>
                                </div>
                                <span className="text-sm font-semibold text-orange-200">
                                    {formatCurrency(pago.monto)}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Link para ver más */}
            <div className="mt-4 pt-4 border-t border-zinc-800">
                <Link
                    href="/admin/dashboard/pagos"
                    className="w-full text-center text-sm text-blue-400 hover:text-blue-300 font-medium block py-2 hover:bg-zinc-800 rounded transition-colors"
                >
                    Ver detalles financieros →
                </Link>
            </div>
        </div>
    )
}
