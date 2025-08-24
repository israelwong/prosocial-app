'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { CheckCircle, XCircle, Clock, Home, Receipt } from 'lucide-react'
import { useClienteAuth } from '../../../../../../hooks'

export default function ResultadoPagoPage() {
    const { cliente, isAuthenticated } = useClienteAuth()
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()

    const eventoId = params?.eventoId as string
    const cotizacionId = params?.cotizacionId as string
    const status = searchParams?.get('status')
    const pagoId = searchParams?.get('pagoId')
    const message = searchParams?.get('message')

    useEffect(() => {
        if (!isAuthenticated || !cliente) {
            return
        }
    }, [isAuthenticated, cliente])

    const getStatusIcon = () => {
        switch (status) {
            case 'completado':
            case 'success':
                return <CheckCircle className="h-16 w-16 text-green-400" />
            case 'pendiente':
            case 'pending':
                return <Clock className="h-16 w-16 text-yellow-400" />
            case 'error':
            case 'fallido':
            default:
                return <XCircle className="h-16 w-16 text-red-400" />
        }
    }

    const getStatusTitle = () => {
        switch (status) {
            case 'completado':
            case 'success':
                return '¡Pago Completado!'
            case 'pendiente':
            case 'pending':
                return 'Pago Pendiente'
            case 'error':
            case 'fallido':
            default:
                return 'Error en el Pago'
        }
    }

    const getStatusMessage = () => {
        if (message) {
            return decodeURIComponent(message)
        }

        switch (status) {
            case 'completado':
            case 'success':
                return 'Tu pago ha sido procesado exitosamente. Recibirás un comprobante por correo electrónico.'
            case 'pendiente':
            case 'pending':
                return 'Tu pago está siendo procesado. Te notificaremos una vez que se complete la transacción.'
            case 'error':
            case 'fallido':
            default:
                return 'Hubo un problema al procesar tu pago. Por favor, intenta nuevamente o contacta a soporte.'
        }
    }

    const getStatusColor = () => {
        switch (status) {
            case 'completado':
            case 'success':
                return 'bg-green-900/20 border-green-800'
            case 'pendiente':
            case 'pending':
                return 'bg-yellow-900/20 border-yellow-800'
            case 'error':
            case 'fallido':
            default:
                return 'bg-red-900/20 border-red-800'
        }
    }

    const handleVolverDashboard = () => {
        router.push('/cliente/dashboard')
    }

    const handleVerSaldo = () => {
        router.push(`/cliente/evento/${eventoId}/pago/${cotizacionId}`)
    }

    const handleCerrarVentana = () => {
        // En un navegador real, esto cerraría la ventana
        // Por ahora redirigimos al dashboard
        router.push('/cliente/dashboard')
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-zinc-400">Verificando autenticación...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <Card className={`${getStatusColor()} border-2`}>
                    <CardHeader className="text-center pb-6">
                        <div className="flex justify-center mb-4">
                            {getStatusIcon()}
                        </div>
                        <CardTitle className="text-2xl font-bold text-zinc-100">
                            {getStatusTitle()}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center">
                            <p className="text-zinc-300 leading-relaxed">
                                {getStatusMessage()}
                            </p>
                        </div>

                        {pagoId && (
                            <div className="bg-zinc-800 p-4 rounded-lg">
                                <div className="text-sm text-zinc-400 mb-1">Número de referencia:</div>
                                <div className="font-mono text-zinc-200 text-sm">{pagoId}</div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {(status === 'completado' || status === 'success') && (
                                <Button
                                    onClick={handleVerSaldo}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Receipt className="h-4 w-4 mr-2" />
                                    Ver Saldo Actual
                                </Button>
                            )}

                            <Button
                                onClick={handleVolverDashboard}
                                variant="outline"
                                className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                            >
                                <Home className="h-4 w-4 mr-2" />
                                Volver al Dashboard
                            </Button>

                            {(status === 'error' || status === 'fallido') && (
                                <Button
                                    onClick={() => router.push(`/cliente/evento/${eventoId}/pago/${cotizacionId}`)}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Intentar Nuevamente
                                </Button>
                            )}
                        </div>

                        <div className="text-center pt-4 border-t border-zinc-800">
                            <Button
                                onClick={handleCerrarVentana}
                                variant="ghost"
                                size="sm"
                                className="text-zinc-500 hover:text-zinc-300"
                            >
                                Cerrar Ventana
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
