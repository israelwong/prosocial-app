import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { Calendar, CreditCard, ExternalLink } from 'lucide-react'
import { obtenerTodosPagosCliente } from '@/app/cliente/_lib/actions/pago.actions'
import Link from 'next/link'

// Función para formatear el método de pago
function formatMetodoPago(metodo: string): string {
    return metodo
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
}

// Función para obtener el color del badge según el status
function getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
        case 'paid':
        case 'completado':
        case 'succeeded':
            return 'bg-green-900/50 text-green-400 border-green-800'
        case 'pending':
        case 'pendiente':
            return 'bg-amber-900/50 text-amber-400 border-amber-800'
        case 'failed':
        case 'cancelled':
        case 'cancelado':
            return 'bg-red-900/50 text-red-400 border-red-800'
        default:
            return 'bg-zinc-800 text-zinc-400 border-zinc-700'
    }
}

// Función para obtener el texto del status
function getStatusText(status: string): string {
    switch (status.toLowerCase()) {
        case 'paid':
        case 'completado':
        case 'succeeded':
            return 'Pagado'
        case 'pending':
        case 'pendiente':
            return 'Pendiente'
        case 'failed':
        case 'cancelled':
        case 'cancelado':
            return 'Fallido'
        default:
            return status
    }
}

export default async function PagosGeneralPage() {
    // Verificar autenticación
    const cookieStore = await cookies()
    const clienteId = cookieStore.get('clienteId')?.value

    if (!clienteId) {
        redirect('/cliente/login')
    }

    // Obtener todos los pagos del cliente
    const result = await obtenerTodosPagosCliente(clienteId)

    if (!result.success) {
        return (
            <div className="min-h-screen bg-zinc-950 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
                        <h1 className="text-2xl font-bold text-red-400 mb-2">Error</h1>
                        <p className="text-red-300">{result.message}</p>
                    </div>
                </div>
            </div>
        )
    }

    const pagos = result.pagos || []

    // Calcular estadísticas
    const totalPagado = pagos.reduce((sum, pago) => sum + pago.monto, 0)
    const totalPagos = pagos.length

    return (
        <div className="min-h-screen bg-zinc-950 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Historial de Pagos
                    </h1>
                    <p className="text-zinc-400">
                        Todos tus pagos realizados en ProSocial
                    </p>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Total Pagos</p>
                                <p className="text-2xl font-bold text-white">{totalPagos}</p>
                            </div>
                            <CreditCard className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Total Pagado</p>
                                <p className="text-2xl font-bold text-white">
                                    ${totalPagado.toLocaleString('es-MX')}
                                </p>
                            </div>
                            <div className="w-8 h-8 bg-green-900/50 rounded-full flex items-center justify-center">
                                <span className="text-green-400 text-sm font-bold">$</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Último Pago</p>
                                <p className="text-lg font-semibold text-white">
                                    {pagos.length > 0
                                        ? new Date(pagos[0].fecha_pago).toLocaleDateString('es-MX')
                                        : 'N/A'
                                    }
                                </p>
                            </div>
                            <Calendar className="w-8 h-8 text-purple-400" />
                        </div>
                    </div>
                </div>

                {/* Lista de pagos */}
                {pagos.length === 0 ? (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-12 text-center">
                        <CreditCard className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-zinc-400 mb-2">
                            No hay pagos registrados
                        </h3>
                        <p className="text-zinc-500 mb-6">
                            Aún no has realizado ningún pago. Cuando hagas tu primer pago, aparecerá aquí.
                        </p>
                        <Link
                            href="/cliente/dashboard"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            Ver Eventos
                            <ExternalLink className="w-4 h-4 ml-2" />
                        </Link>
                    </div>
                ) : (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-zinc-800 border-b border-zinc-700">
                                    <tr>
                                        <th className="text-left py-4 px-6 text-zinc-300 font-medium">
                                            Evento
                                        </th>
                                        <th className="text-left py-4 px-6 text-zinc-300 font-medium">
                                            Monto
                                        </th>
                                        <th className="text-left py-4 px-6 text-zinc-300 font-medium">
                                            Método
                                        </th>
                                        <th className="text-left py-4 px-6 text-zinc-300 font-medium">
                                            Fecha
                                        </th>
                                        <th className="text-left py-4 px-6 text-zinc-300 font-medium">
                                            Estado
                                        </th>
                                        <th className="text-left py-4 px-6 text-zinc-300 font-medium">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {pagos.map((pago) => (
                                        <tr
                                            key={pago.id}
                                            className="hover:bg-zinc-800/50 transition-colors"
                                        >
                                            <td className="py-4 px-6">
                                                <div>
                                                    <p className="font-medium text-white">
                                                        {pago.cotizacion.evento.nombre}
                                                    </p>
                                                    <p className="text-sm text-zinc-400">
                                                        {new Date(pago.cotizacion.evento.fecha_evento).toLocaleDateString('es-MX')}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="font-semibold text-white">
                                                    ${pago.monto.toLocaleString('es-MX')}
                                                </p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="text-zinc-300">
                                                    {formatMetodoPago(pago.metodo_pago)}
                                                </p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="text-zinc-300">
                                                    {new Date(pago.fecha_pago).toLocaleDateString('es-MX')}
                                                </p>
                                                <p className="text-sm text-zinc-500">
                                                    {new Date(pago.fecha_pago).toLocaleTimeString('es-MX', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(pago.status)}`}
                                                >
                                                    {getStatusText(pago.status)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <Link
                                                    href={`/cliente/evento/${pago.cotizacion.evento.id}/pagos`}
                                                    className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                                                >
                                                    <span className="text-sm">Ver evento</span>
                                                    <ExternalLink className="w-3 h-3 ml-1" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
