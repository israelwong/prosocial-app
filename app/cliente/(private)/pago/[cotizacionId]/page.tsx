'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Badge } from '@/app/components/ui/badge'
import { useClienteAuth } from '../../../hooks'
import { obtenerCotizacionPago, crearSesionPago } from '../../../_lib/actions/pago.actions'
import { CotizacionPago } from '../../../_lib/types'
import {
    CreditCard,
    ArrowLeft,
    DollarSign,
    CalendarDays,
    MapPin,
    Users,
    AlertCircle,
    CheckCircle
} from 'lucide-react'

export default function PagoPage() {
    const [cotizacion, setCotizacion] = useState<CotizacionPago | null>(null)
    const [montoCustom, setMontoCustom] = useState('')
    const [loading, setLoading] = useState(true)
    const [processingPayment, setProcessingPayment] = useState(false)
    const [error, setError] = useState('')
    const { cliente, isAuthenticated } = useClienteAuth()
    const router = useRouter()
    const params = useParams()
    const cotizacionId = params?.cotizacionId as string

    useEffect(() => {
        if (!isAuthenticated || !cliente) {
            return // El useClienteAuth ya maneja la redirección
        }

        const fetchCotizacion = async () => {
            try {
                const response = await obtenerCotizacionPago(cotizacionId)
                if (response.success && response.cotizacion) {
                    setCotizacion({
                        ...response.cotizacion,
                        evento: {
                            ...response.cotizacion.evento,
                            fecha_evento: typeof response.cotizacion.evento.fecha_evento === 'string'
                                ? response.cotizacion.evento.fecha_evento
                                : response.cotizacion.evento.fecha_evento.toISOString(),
                        }
                    })
                } else {
                    setError(response.message || 'No se pudo cargar la información de pago')
                }
            } catch (error) {
                console.error('Error al cargar cotización:', error)
                setError('Error al cargar información')
            } finally {
                setLoading(false)
            }
        }

        if (cotizacionId) {
            fetchCotizacion()
        }
    }, [cotizacionId, isAuthenticated, cliente])

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getSaldoPendiente = () => {
        if (!cotizacion) return 0
        return cotizacion.total - cotizacion.pagado
    }

    const validateMonto = (monto: string) => {
        const amount = parseFloat(monto)
        if (isNaN(amount) || amount <= 0) {
            return 'Por favor ingresa un monto válido'
        }
        if (amount > getSaldoPendiente()) {
            return 'El monto no puede ser mayor al saldo pendiente'
        }
        return null
    }

    const handlePagoCompleto = async () => {
        const monto = getSaldoPendiente()
        await procesarPago(monto)
    }

    const handlePagoCustom = async () => {
        const errorMonto = validateMonto(montoCustom)
        if (errorMonto) {
            setError(errorMonto)
            return
        }

        const monto = parseFloat(montoCustom)
        await procesarPago(monto)
    }

    const procesarPago = async (monto: number) => {
        if (!cotizacion) return

        setProcessingPayment(true)
        setError('')

        try {
            const response = await crearSesionPago({
                cotizacionId: cotizacion.id,
                monto,
                clienteEmail: cotizacion.cliente.email,
                clienteNombre: cotizacion.cliente.nombre,
                eventoNombre: cotizacion.evento.nombre
            })

            if (response.success && response.sessionUrl) {
                // Redirigir a Stripe Checkout
                window.location.href = response.sessionUrl
            } else {
                setError(response.message || 'Error al procesar el pago')
            }
        } catch (error) {
            console.error('Error al procesar pago:', error)
            setError('Error al procesar el pago')
        } finally {
            setProcessingPayment(false)
        }
    }

    if (!isAuthenticated || loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                    <p className="mt-4 text-zinc-400">
                        {!isAuthenticated ? 'Verificando autenticación...' : 'Cargando información de pago...'}
                    </p>
                </div>
            </div>
        )
    }

    if (error && !cotizacion) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Card className="max-w-md mx-auto bg-zinc-900 border-zinc-800">
                    <CardContent className="text-center py-12">
                        <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                        <h3 className="text-lg font-medium text-zinc-100 mb-2">
                            Error al cargar
                        </h3>
                        <p className="text-zinc-400 mb-4">{error}</p>
                        <Button
                            onClick={() => router.push('/cliente/dashboard')}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Volver al Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!cotizacion) {
        return null
    }

    const saldoPendiente = getSaldoPendiente()
    const montosPredefinidos = [
        Math.round(saldoPendiente * 0.25), // 25%
        Math.round(saldoPendiente * 0.5),  // 50%
        Math.round(saldoPendiente * 0.75), // 75%
        saldoPendiente                     // 100%
    ]

    return (
        <div className="min-h-screen bg-zinc-950">
            <div className="bg-zinc-900 shadow-sm border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center py-6">
                        <Button
                            variant="ghost"
                            onClick={() => router.push(`/cliente/evento/${cotizacion.evento.id}`)}
                            className="mr-4 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-zinc-100">Realizar Pago</h1>
                            <p className="text-zinc-400">{cotizacion.evento.nombre}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Formulario de Pago */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="flex items-center text-zinc-100">
                                    <CreditCard className="h-5 w-5 mr-2" />
                                    Opciones de Pago
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Pago Completo */}
                                <div className="border border-zinc-700 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="font-medium text-zinc-100">Pago Completo</h3>
                                            <p className="text-sm text-zinc-400">
                                                Liquidar el saldo pendiente total
                                            </p>
                                        </div>
                                        <Badge className="bg-green-900/20 text-green-300 border-green-800">
                                            {formatMoney(saldoPendiente)}
                                        </Badge>
                                    </div>
                                    <Button
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                        size="lg"
                                        onClick={handlePagoCompleto}
                                        disabled={processingPayment}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Pagar Saldo Completo
                                    </Button>
                                </div>

                                {/* Montos Predefinidos */}
                                <div className="border border-zinc-700 rounded-lg p-4">
                                    <h3 className="font-medium mb-4 text-zinc-100">Montos Sugeridos</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {montosPredefinidos.slice(0, 3).map((monto, index) => (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                onClick={() => setMontoCustom(monto.toString())}
                                                className="h-16 flex flex-col items-center justify-center border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                                            >
                                                <span className="text-sm text-zinc-400">
                                                    {index === 0 ? '25%' : index === 1 ? '50%' : '75%'}
                                                </span>
                                                <span className="font-medium">{formatMoney(monto)}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Monto Personalizado */}
                                <div className="border border-zinc-700 rounded-lg p-4">
                                    <h3 className="font-medium mb-4 text-zinc-100">Monto Personalizado</h3>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={montoCustom}
                                                onChange={(e) => {
                                                    setMontoCustom(e.target.value)
                                                    setError('')
                                                }}
                                                className="h-12 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-400"
                                                min="1"
                                                max={saldoPendiente}
                                                step="0.01"
                                            />
                                            {error && (
                                                <p className="text-red-400 text-sm mt-2">{error}</p>
                                            )}
                                        </div>
                                        <Button
                                            size="lg"
                                            onClick={handlePagoCustom}
                                            disabled={!montoCustom || processingPayment}
                                            className="px-8 bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            <DollarSign className="h-4 w-4 mr-2" />
                                            Pagar
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Resumen */}
                    <div className="space-y-6">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-zinc-100">Resumen del Evento</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-medium text-zinc-100">{cotizacion.evento.nombre}</h3>
                                    <div className="mt-3 space-y-2 text-sm text-zinc-400">
                                        <div className="flex items-center">
                                            <CalendarDays className="h-4 w-4 mr-2" />
                                            {formatFecha(cotizacion.evento.fecha_evento)}
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="h-4 w-4 mr-2" />
                                            {cotizacion.evento.lugar}
                                        </div>
                                        <div className="flex items-center">
                                            <Users className="h-4 w-4 mr-2" />
                                            {cotizacion.evento.numero_invitados} invitados
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-zinc-100">Estado de Pagos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Total del evento:</span>
                                    <span className="font-medium text-zinc-100">{formatMoney(cotizacion.total)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Ya pagado:</span>
                                    <span className="font-medium text-green-400">
                                        {formatMoney(cotizacion.pagado)}
                                    </span>
                                </div>

                                <div className="border-t border-zinc-700 pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Saldo pendiente:</span>
                                        <span className="font-semibold text-yellow-400">
                                            {formatMoney(saldoPendiente)}
                                        </span>
                                    </div>
                                </div>

                                {/* Barra de progreso */}
                                <div className="mt-4">
                                    <div className="flex justify-between text-sm text-zinc-400 mb-2">
                                        <span>Progreso de pago</span>
                                        <span>{Math.round((cotizacion.pagado / cotizacion.total) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-zinc-700 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full"
                                            style={{ width: `${(cotizacion.pagado / cotizacion.total) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
