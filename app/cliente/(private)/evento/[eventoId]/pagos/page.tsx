'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import {
    ArrowLeft,
    Download,
    Calendar,
    CreditCard,
    FileText,
    Eye,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react'
import { useClienteAuth } from '../../../../hooks'
import { obtenerEventoDetalle } from '../../../../_lib/actions/evento.actions'
import { obtenerPagosEvento } from '../../../../_lib/actions/pago.actions'
import { EventoDetalle } from '../../../../_lib/types'

interface PagoDetalle {
    id: string
    monto: number
    metodo_pago: string
    status: string
    createdAt: Date
    stripe_payment_id?: string
    concepto: string
    descripcion?: string
    cotizacion: {
        id: string
        precio: number
    }
}

export default function HistorialPagosEvento() {
    const [evento, setEvento] = useState<EventoDetalle | null>(null)
    const [pagos, setPagos] = useState<PagoDetalle[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingPagos, setLoadingPagos] = useState(true)
    const [showNotification, setShowNotification] = useState(false)
    const [notificationMessage, setNotificationMessage] = useState('')

    const { cliente, isAuthenticated } = useClienteAuth()
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const eventoId = params?.eventoId as string

    useEffect(() => {
        if (!isAuthenticated || !cliente) {
            return
        }

        const fetchEventoYPagos = async () => {
            try {
                setLoading(true)
                setLoadingPagos(true)

                // Obtener evento
                const eventoResponse = await obtenerEventoDetalle(eventoId)

                if (eventoResponse.success && eventoResponse.data) {
                    setEvento(eventoResponse.data)

                    // Obtener pagos del evento
                    const pagosResponse = await obtenerPagosEvento(eventoId, cliente.id)
                    if (pagosResponse.success && pagosResponse.pagos) {
                        setPagos(pagosResponse.pagos)
                    }
                } else {
                    console.error('❌ Error al cargar evento:', eventoResponse.message)
                    router.push('/cliente/dashboard')
                }
            } catch (error) {
                console.error('❌ Error al cargar evento y pagos:', error)
                router.push('/cliente/dashboard')
            } finally {
                setLoading(false)
                setLoadingPagos(false)
            }
        }

        fetchEventoYPagos()
    }, [isAuthenticated, cliente, eventoId, router])

    // Manejar notificación de pago exitoso
    useEffect(() => {
        if (!searchParams) return

        const pagoExitoso = searchParams.get('pagoExitoso')
        const pagoId = searchParams.get('pagoId')

        if (pagoExitoso === 'true') {
            setNotificationMessage(`¡Pago procesado exitosamente! ID: ${pagoId || 'N/A'}`)
            setShowNotification(true)

            // Limpiar URL
            const url = new URL(window.location.href)
            url.searchParams.delete('pagoExitoso')
            url.searchParams.delete('pagoId')
            window.history.replaceState({}, '', url.toString())

            // Auto-ocultar notificación después de 5 segundos
            setTimeout(() => {
                setShowNotification(false)
            }, 5000)
        }
    }, [searchParams])

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    const formatFecha = (fecha: string | Date) => {
        const date = typeof fecha === 'string' ? new Date(fecha) : fecha
        return date.toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completado':
            case 'succeeded':
                return <CheckCircle className="h-5 w-5 text-green-400" />
            case 'pendiente':
            case 'pending':
                return <Clock className="h-5 w-5 text-yellow-400" />
            case 'fallido':
            case 'failed':
                return <XCircle className="h-5 w-5 text-red-400" />
            default:
                return <AlertCircle className="h-5 w-5 text-zinc-400" />
        }
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

    const getTotalPagado = () => {
        return pagos
            .filter(pago =>
                pago.status === 'completado' ||
                pago.status === 'succeeded' ||
                pago.status === 'paid'
            )
            .reduce((sum, pago) => sum + pago.monto, 0)
    }

    const handleDescargarComprobante = (pagoId: string) => {
        // TODO: Implementar descarga de comprobante
        console.log('Descargando comprobante para pago:', pagoId)
    }

    if (!isAuthenticated || loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                    <p className="mt-4 text-zinc-400">Cargando historial de pagos...</p>
                </div>
            </div>
        )
    }

    if (!evento) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-100 mb-2">
                        Evento no encontrado
                    </h3>
                    <p className="text-zinc-400 mb-4">
                        No se pudo cargar la información del evento.
                    </p>
                    <Button onClick={() => router.push('/cliente/dashboard')}>
                        Volver al Dashboard
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Notificación de pago exitoso */}
            {showNotification && (
                <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-green-600 text-white p-4 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            <span className="font-medium">{notificationMessage}</span>
                        </div>
                        <button
                            onClick={() => setShowNotification(false)}
                            className="ml-2 text-white hover:text-gray-200"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-zinc-900 shadow-sm border-b border-zinc-800">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-6">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push('/cliente/dashboard')}
                                    className="text-zinc-400 hover:text-zinc-100"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Dashboard
                                </Button>
                                <span className="text-zinc-600">•</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push(`/cliente/evento/${eventoId}`)}
                                    className="text-zinc-400 hover:text-zinc-100"
                                >
                                    Volver al Evento
                                </Button>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-100">Historial de Pagos</h1>
                                <p className="text-zinc-400">{evento.nombre}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/cliente/evento/${eventoId}`)}
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Evento
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Resumen */}
                    <div className="lg:col-span-1">
                        <Card className="bg-zinc-900 border-zinc-800 sticky top-8">
                            <CardHeader>
                                <CardTitle className="text-zinc-100">Resumen de Pagos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Total de la cotización:</span>
                                        <span className="font-medium text-zinc-100">
                                            {evento.cotizacion ? formatMoney(evento.cotizacion.total) : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Total pagado:</span>
                                        <span className="font-medium text-green-400">
                                            {formatMoney(getTotalPagado())}
                                        </span>
                                    </div>
                                    {evento.cotizacion && (
                                        <div className="flex justify-between border-t border-zinc-800 pt-3">
                                            <span className="text-zinc-400">Saldo pendiente:</span>
                                            <span className="font-bold text-yellow-400">
                                                {formatMoney(evento.cotizacion.total - getTotalPagado())}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-zinc-800 pt-4">
                                    <div className="text-sm text-zinc-400 mb-2">Estadísticas:</div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Total de pagos:</span>
                                            <span className="text-zinc-300">{pagos.length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Pagos exitosos:</span>
                                            <span className="text-green-400">
                                                {pagos.filter(p =>
                                                    p.status === 'completado' ||
                                                    p.status === 'succeeded' ||
                                                    p.status === 'paid'
                                                ).length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Pagos pendientes:</span>
                                            <span className="text-amber-400">
                                                {pagos.filter(p => p.status === 'pendiente' || p.status === 'pending').length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Lista de Pagos */}
                    <div className="lg:col-span-2">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-zinc-100 flex items-center">
                                    <FileText className="h-5 w-5 mr-2" />
                                    Registro de Pagos
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingPagos ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                                        <p className="mt-4 text-zinc-400">Cargando pagos...</p>
                                    </div>
                                ) : pagos.length === 0 ? (
                                    <div className="text-center py-12">
                                        <CreditCard className="mx-auto h-12 w-12 text-zinc-500 mb-4" />
                                        <h3 className="text-lg font-medium text-zinc-100 mb-2">
                                            No hay pagos registrados
                                        </h3>
                                        <p className="text-zinc-400 mb-4">
                                            Aún no se han realizado pagos para este evento.
                                        </p>
                                        {evento.cotizacion && (
                                            <Button
                                                onClick={() => router.push(`/cliente/evento/${eventoId}/pago/${evento.cotizacion.id}`)}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                Realizar Primer Pago
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {pagos.map((pago) => (
                                            <div
                                                key={pago.id}
                                                className="border border-zinc-800 rounded-lg p-4 bg-zinc-800/50"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            {getStatusIcon(pago.status)}
                                                            <div>
                                                                <h4 className="font-medium text-zinc-100">
                                                                    {formatMoney(pago.monto)}
                                                                </h4>
                                                                <p className="text-sm text-zinc-400">
                                                                    {pago.concepto}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                                            <div className="flex items-center text-sm text-zinc-400">
                                                                <Calendar className="h-4 w-4 mr-2" />
                                                                {formatFecha(pago.createdAt)}
                                                            </div>
                                                            <div className="flex items-center text-sm text-zinc-400">
                                                                <CreditCard className="h-4 w-4 mr-2" />
                                                                {formatMetodoPago(pago.metodo_pago)}
                                                            </div>
                                                        </div>

                                                        {pago.descripcion && (
                                                            <p className="text-sm text-zinc-500 mt-2">
                                                                {pago.descripcion}
                                                            </p>
                                                        )}

                                                        {pago.stripe_payment_id && (
                                                            <p className="text-xs text-zinc-600 mt-2 font-mono">
                                                                Ref: {pago.stripe_payment_id}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col items-end gap-2 ml-4">
                                                        <Badge
                                                            className={getStatusColor(pago.status)}
                                                            variant="outline"
                                                        >
                                                            {getStatusText(pago.status)}
                                                        </Badge>

                                                        {(pago.status === 'completado' || pago.status === 'succeeded') && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDescargarComprobante(pago.id)}
                                                                className="text-zinc-400 hover:text-zinc-100"
                                                            >
                                                                <Download className="h-4 w-4 mr-1" />
                                                                Comprobante
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
