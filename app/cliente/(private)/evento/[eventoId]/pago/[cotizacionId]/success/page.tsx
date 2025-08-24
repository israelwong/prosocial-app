'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { CheckCircle, CreditCard, Eye, ArrowLeft } from 'lucide-react'
import { PagoLoadingSkeleton } from '../../../../../../components/ui/skeleton'

export default function PagoExitoso() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(true)
    const [pagoDetalle, setPagoDetalle] = useState<any>(null)

    const paymentIntentId = searchParams?.get('payment_intent')

    useEffect(() => {
        // Simular carga y obtener detalles del pago
        const timer = setTimeout(() => {
            setLoading(false)
            // Aquí podrías hacer una llamada a la API para obtener detalles del pago
        }, 1500)

        return () => clearTimeout(timer)
    }, [])

    const handleRealizarOtroPago = () => {
        // Regresar a la página de pago
        router.back()
    }

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

    if (loading) {
        return <PagoLoadingSkeleton />
    }

    return (
        <div className="min-h-screen bg-zinc-950 p-4">
            <div className="max-w-2xl mx-auto pt-8">
                {/* Header de éxito */}
                <Card className="bg-zinc-900 border-green-700 mb-6">
                    <CardContent className="p-6 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                        <h1 className="text-2xl font-bold text-green-400 mb-2">
                            Pago Exitoso
                        </h1>
                        <p className="text-zinc-400">
                            Tu pago ha sido procesado correctamente
                        </p>
                    </CardContent>
                </Card>

                {/* Información del pago */}
                <Card className="bg-zinc-900 border-zinc-800 mb-6">
                    <CardHeader>
                        <CardTitle className="text-zinc-100 flex items-center">
                            <CreditCard className="h-5 w-5 mr-2 text-green-500" />
                            Detalles del Pago
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="bg-zinc-800 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-zinc-400">Estado:</span>
                                    <span className="text-green-400 font-medium">Pagado</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-zinc-400">Método:</span>
                                    <span className="text-zinc-200">Tarjeta de Crédito/Débito</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-400">Fecha:</span>
                                    <span className="text-zinc-200">{new Date().toLocaleDateString('es-MX')}</span>
                                </div>
                            </div>

                            <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                                <h3 className="text-green-400 font-medium mb-2">¿Qué sigue?</h3>
                                <ul className="text-zinc-300 text-sm space-y-1">
                                    <li>• Tu pago ha sido registrado exitosamente</li>
                                    <li>• El saldo de tu cotización se ha actualizado</li>
                                    <li>• Recibirás un correo de confirmación</li>
                                    <li>• Puedes realizar pagos adicionales si es necesario</li>
                                </ul>
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
                        <CreditCard className="h-4 w-4 mr-2" />
                        Realizar Otro Pago
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
            </div>
        </div>
    )
}
