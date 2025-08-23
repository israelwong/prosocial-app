'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'

interface PaymentResult {
    success: boolean
    monto: number
    eventoNombre: string
    cotizacionId: string
    paymentId: string
}

export default function PaymentSuccess() {
    const [paymentInfo, setPaymentInfo] = useState<PaymentResult | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()
    const sessionId = searchParams?.get('session_id')

    useEffect(() => {
        const verifyPayment = async () => {
            if (!sessionId) {
                setError('ID de sesión no encontrado')
                setLoading(false)
                return
            }

            try {
                const response = await fetch(`/api/cliente/verify-payment?session_id=${sessionId}`)
                const data = await response.json()

                if (data.success) {
                    setPaymentInfo(data.payment)
                } else {
                    setError(data.message || 'Error al verificar el pago')
                }
            } catch (error) {
                console.error('Error al verificar pago:', error)
                setError('Error al verificar el pago')
            } finally {
                setLoading(false)
            }
        }

        verifyPayment()
    }, [sessionId])

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="max-w-md mx-auto">
                    <CardContent className="text-center py-12">
                        <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Verificando tu pago...
                        </h3>
                        <p className="text-gray-600">
                            Por favor espera mientras confirmamos tu transacción.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error || !paymentInfo) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="max-w-md mx-auto">
                    <CardContent className="text-center py-12">
                        <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Error en el pago
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {error || 'No se pudo procesar tu pago correctamente.'}
                        </p>
                        <div className="space-y-2">
                            <Button
                                onClick={() => router.push('/cliente/dashboard')}
                                className="w-full"
                            >
                                Volver al Dashboard
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.location.reload()}
                                className="w-full"
                            >
                                Intentar de nuevo
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Card className="max-w-md mx-auto">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl text-green-900">
                        ¡Pago Exitoso!
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                    <div>
                        <p className="text-gray-600 mb-4">
                            Tu pago ha sido procesado correctamente.
                        </p>

                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Monto pagado:</span>
                                <span className="font-semibold text-green-600">
                                    {formatMoney(paymentInfo.monto)}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Evento:</span>
                                <span className="font-medium">
                                    {paymentInfo.eventoNombre}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">ID de pago:</span>
                                <span className="font-mono text-xs">
                                    {paymentInfo.paymentId}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={() => router.push(`/cliente/evento/${paymentInfo.cotizacionId}`)}
                            className="w-full"
                        >
                            Ver Detalles del Evento
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => router.push('/cliente/dashboard')}
                            className="w-full"
                        >
                            Volver al Dashboard
                        </Button>
                    </div>

                    <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                        <p>
                            <strong>Importante:</strong> Recibirás un comprobante de pago por email.
                            Si tienes alguna pregunta, contacta a nuestro equipo de soporte.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
