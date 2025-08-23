'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Badge } from '@/app/components/ui/badge'
import { ArrowLeft, CreditCard, History, AlertCircle } from 'lucide-react'
import { useClienteAuth } from '../../../../../hooks'
import { obtenerCotizacionPago, obtenerPagosCotizacion } from '../../../../../_lib/actions/pago.actions'

interface CotizacionPago {
    id: string
    total: number
    pagado: number
    evento: {
        id: string
        nombre: string
        fecha_evento: Date
        lugar: string
        numero_invitados: number
    }
    cliente: {
        id: string
        nombre: string
        email: string
        telefono: string
    }
}

interface Pago {
    id: string
    monto: number
    metodo_pago: string
    status: string
    createdAt: Date
}

export default function PagoCotizacionPage() {
    const [cotizacion, setCotizacion] = useState<CotizacionPago | null>(null)
    const [pagos, setPagos] = useState<Pago[]>([])
    const [loading, setLoading] = useState(true)
    const [montoAPagar, setMontoAPagar] = useState('')
    const [procesandoPago, setProcesandoPago] = useState(false)
    const { cliente, isAuthenticated } = useClienteAuth()
    const router = useRouter()
    const params = useParams()
    const eventoId = params?.eventoId as string
    const cotizacionId = params?.cotizacionId as string

    useEffect(() => {
        if (!isAuthenticated || !cliente) {
            return
        }

        const fetchCotizacion = async () => {
            try {
                setLoading(true)
                const response = await obtenerCotizacionPago(cotizacionId, cliente.id)

                if (response.success && response.cotizacion) {
                    setCotizacion(response.cotizacion)

                    // Obtener pagos de la cotización
                    const pagosResponse = await obtenerPagosCotizacion(cotizacionId, cliente.id)
                    if (pagosResponse.success && pagosResponse.pagos) {
                        setPagos(pagosResponse.pagos)
                    } else {
                        setPagos([])
                    }
                } else {
                    console.error('❌ Error al cargar cotización:', response.message)
                    router.push('/cliente/dashboard')
                }
            } catch (error) {
                console.error('❌ Error al cargar cotización:', error)
                router.push('/cliente/dashboard')
            } finally {
                setLoading(false)
            }
        }

        fetchCotizacion()
    }, [isAuthenticated, cliente, cotizacionId, router])

    // Función para refrescar datos después de un pago
    const refrescarDatos = async () => {
        if (!cliente) return

        try {
            const response = await obtenerCotizacionPago(cotizacionId, cliente.id)
            if (response.success && response.cotizacion) {
                setCotizacion(response.cotizacion)

                const pagosResponse = await obtenerPagosCotizacion(cotizacionId, cliente.id)
                if (pagosResponse.success && pagosResponse.pagos) {
                    setPagos(pagosResponse.pagos)
                }
            }
        } catch (error) {
            console.error('❌ Error al refrescar datos:', error)
        }
    }

    // Escuchar cuando la página se enfoca (cuando regresas del checkout)
    useEffect(() => {
        const handleFocus = () => {
            refrescarDatos()
        }

        window.addEventListener('focus', handleFocus)
        return () => window.removeEventListener('focus', handleFocus)
    }, [cliente, cotizacionId])

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

    const getSaldoPendiente = () => {
        if (!cotizacion) return 0
        return cotizacion.total - cotizacion.pagado
    }

    const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = e.target.value
        // Solo permitir números y punto decimal
        if (/^\d*\.?\d*$/.test(valor)) {
            setMontoAPagar(valor)
        }
    }

    const handlePagarAhora = async () => {
        if (!cotizacion || !montoAPagar) return

        const monto = parseFloat(montoAPagar)
        const saldoPendiente = getSaldoPendiente()

        if (monto <= 0 || monto > saldoPendiente) {
            alert(`El monto debe ser mayor a $0 y no exceder ${formatMoney(saldoPendiente)}`)
            return
        }

        try {
            setProcesandoPago(true)

            // Redirigir a la página de procesamiento de pago
            router.push(`/cliente/evento/${eventoId}/pago/${cotizacionId}/checkout?monto=${monto}`)

        } catch (error) {
            console.error('❌ Error al procesar pago:', error)
            alert('Error al procesar el pago. Intenta nuevamente.')
        } finally {
            setProcesandoPago(false)
        }
    }

    if (!isAuthenticated || loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                    <p className="mt-4 text-zinc-400">Cargando información de pago...</p>
                </div>
            </div>
        )
    }

    if (!cotizacion) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-100 mb-2">
                        Cotización no encontrada
                    </h3>
                    <p className="text-zinc-400 mb-4">
                        No se pudo cargar la información de la cotización.
                    </p>
                    <Button onClick={() => router.push('/cliente/dashboard')}>
                        Volver al Dashboard
                    </Button>
                </div>
            </div>
        )
    }

    const saldoPendiente = getSaldoPendiente()

    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Header */}
            <div className="bg-zinc-900 shadow-sm border-b border-zinc-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-6">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/cliente/dashboard')}
                                className="text-zinc-400 hover:text-zinc-100"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-100">Pasarela de Pago</h1>
                                <p className="text-zinc-400">{cotizacion.evento.nombre}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Información del Evento y Cotización */}
                    <div className="space-y-6">
                        {/* Resumen de Cotización */}
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-zinc-100">Resumen de Cotización</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Total de la cotización:</span>
                                    <span className="font-medium text-zinc-100">
                                        {formatMoney(cotizacion.total)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Total pagado:</span>
                                    <span className="font-medium text-green-400">
                                        {formatMoney(cotizacion.pagado)}
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

                        {/* Historial de Pagos */}
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
                    </div>

                    {/* Formulario de Pago */}
                    <div className="space-y-6">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-zinc-100 flex items-center">
                                    <CreditCard className="h-5 w-5 mr-2" />
                                    Realizar Pago
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Monto a pagar
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            value={montoAPagar}
                                            onChange={handleMontoChange}
                                            placeholder="0.00"
                                            className="pl-8 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500"
                                        />
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400">
                                            $
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-zinc-500">
                                        Máximo: {formatMoney(saldoPendiente)}
                                    </p>
                                </div>

                                <div className="bg-zinc-800 p-4 rounded-lg">
                                    <h4 className="font-medium text-zinc-300 mb-2">Métodos de pago disponibles:</h4>
                                    <ul className="text-sm text-zinc-400 space-y-1">
                                        <li>• Tarjeta de crédito/débito</li>
                                        <li>• Transferencia bancaria</li>
                                        <li>• PayPal</li>
                                    </ul>
                                </div>

                                <Button
                                    onClick={handlePagarAhora}
                                    disabled={!montoAPagar || parseFloat(montoAPagar) <= 0 || procesandoPago}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    size="lg"
                                >
                                    {procesandoPago ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="h-4 w-4 mr-2" />
                                            Pagar Ahora
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
