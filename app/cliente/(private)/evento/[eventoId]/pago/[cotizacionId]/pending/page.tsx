'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Clock, Building2, Eye, ArrowLeft, CheckCircle } from 'lucide-react'

export default function PagoPendiente() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const paymentIntentId = searchParams?.get('payment_intent')

    const handleVerHistorial = () => {
        // Extraer eventoId de la URL actual
        const pathParts = window.location.pathname.split('/')
        const eventoIdIndex = pathParts.indexOf('evento') + 1
        const eventoId = pathParts[eventoIdIndex]

        router.push(`/cliente/evento/${eventoId}/pagos`)
    }

    const handleVolverEvento = () => {
        // Extraer eventoId de la URL actual
        const pathParts = window.location.pathname.split('/')
        const eventoIdIndex = pathParts.indexOf('evento') + 1
        const eventoId = pathParts[eventoIdIndex]

        router.push(`/cliente/evento/${eventoId}`)
    }

    const handleRealizarOtroPago = () => {
        // Regresar a la página de pago
        router.back()
    }

    return (
        <div className="min-h-screen bg-zinc-950 p-4">
            <div className="max-w-2xl mx-auto pt-8">
                {/* Header de pendiente */}
                <Card className="bg-gradient-to-r from-yellow-900/20 to-amber-900/20 border-yellow-800 mb-6">
                    <CardContent className="p-8 text-center">
                        <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-yellow-400 mb-2">
                            Pago Pendiente
                        </h1>
                        <p className="text-zinc-300 text-lg">
                            Tu transferencia SPEI está siendo procesada
                        </p>
                        {paymentIntentId && (
                            <p className="text-zinc-500 text-sm mt-2">
                                ID de transacción: {paymentIntentId.slice(-8)}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Información del proceso */}
                <Card className="bg-zinc-900 border-zinc-800 mb-6">
                    <CardHeader>
                        <CardTitle className="text-zinc-100 flex items-center">
                            <Building2 className="h-5 w-5 mr-2 text-yellow-500" />
                            ¿Cómo funciona SPEI?
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="bg-zinc-800 p-4 rounded-lg">
                                <h3 className="text-zinc-200 font-medium mb-3">Proceso automático:</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                            <CheckCircle className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-zinc-200 text-sm font-medium">1. Transferencia realizada</p>
                                            <p className="text-zinc-400 text-xs">Has completado la transferencia bancaria</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                                            <Clock className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-zinc-200 text-sm font-medium">2. Esperando confirmación</p>
                                            <p className="text-zinc-400 text-xs">El banco nos notificará cuando reciba el pago</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-zinc-600 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs">3</span>
                                        </div>
                                        <div>
                                            <p className="text-zinc-400 text-sm">Actualización automática</p>
                                            <p className="text-zinc-500 text-xs">Tu saldo se actualizará automáticamente</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                                <h3 className="text-blue-400 font-medium mb-2">⏱️ Tiempos de procesamiento</h3>
                                <ul className="text-zinc-300 text-sm space-y-1">
                                    <li>• <strong>Transferencias durante el día:</strong> 5-15 minutos</li>
                                    <li>• <strong>Transferencias nocturnas:</strong> Hasta la mañana siguiente</li>
                                    <li>• <strong>Fines de semana:</strong> Se procesan el lunes hábil</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Estado actual */}
                <Card className="bg-zinc-900 border-zinc-800 mb-6">
                    <CardHeader>
                        <CardTitle className="text-zinc-100">
                            Estado Actual
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
                            <div className="flex items-center space-x-3 mb-3">
                                <Clock className="h-5 w-5 text-yellow-500" />
                                <span className="text-yellow-400 font-medium">Esperando confirmación bancaria</span>
                            </div>
                            <p className="text-zinc-300 text-sm mb-3">
                                Tu transferencia está siendo procesada por el sistema bancario.
                                Te notificaremos automáticamente cuando se complete.
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-zinc-500">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                <span>Monitoreando en tiempo real...</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Acciones */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                        onClick={handleRealizarOtroPago}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        💳 Pagar con Tarjeta
                    </Button>

                    <Button
                        onClick={handleVerHistorial}
                        variant="outline"
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Historial
                    </Button>

                    <Button
                        onClick={handleVolverEvento}
                        variant="outline"
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver al Evento
                    </Button>
                </div>

                {/* Nota informativa */}
                <div className="mt-6 text-center">
                    <p className="text-zinc-500 text-xs">
                        🔄 Esta página se actualiza automáticamente cuando se confirme tu pago
                    </p>
                </div>
            </div>
        </div>
    )
}
