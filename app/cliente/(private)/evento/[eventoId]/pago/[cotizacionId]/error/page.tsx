'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { XCircle, RefreshCw, ArrowLeft, AlertTriangle } from 'lucide-react'

export default function PagoError() {
    const router = useRouter()

    const handleReintentar = () => {
        // Regresar a la página de pago
        router.back()
    }

    const handleVolverEvento = () => {
        // Extraer eventoId de la URL actual
        const pathParts = window.location.pathname.split('/')
        const eventoIdIndex = pathParts.indexOf('evento') + 1
        const eventoId = pathParts[eventoIdIndex]

        router.push(`/cliente/evento/${eventoId}`)
    }

    const handleContactarSoporte = () => {
        // Redirigir a contacto o abrir WhatsApp
        window.open('https://wa.me/5555555555?text=Necesito ayuda con un pago que no se pudo procesar', '_blank')
    }

    return (
        <div className="min-h-screen bg-zinc-950 p-4">
            <div className="max-w-2xl mx-auto pt-8">
                {/* Header de error */}
                <Card className="bg-gradient-to-r from-red-900/20 to-rose-900/20 border-red-800 mb-6">
                    <CardContent className="p-8 text-center">
                        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-red-400 mb-2">
                            Error en el Pago
                        </h1>
                        <p className="text-zinc-300 text-lg">
                            No se pudo procesar tu pago
                        </p>
                        <p className="text-zinc-500 text-sm mt-2">
                            No te preocupes, no se realizó ningún cargo
                        </p>
                    </CardContent>
                </Card>

                {/* Información del error */}
                <Card className="bg-zinc-900 border-zinc-800 mb-6">
                    <CardHeader>
                        <CardTitle className="text-zinc-100 flex items-center">
                            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                            ¿Qué pudo haber pasado?
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="bg-zinc-800 p-4 rounded-lg">
                                <h3 className="text-zinc-200 font-medium mb-3">Posibles causas:</h3>
                                <ul className="text-zinc-400 text-sm space-y-2">
                                    <li>• Datos de la tarjeta incorrectos</li>
                                    <li>• Fondos insuficientes</li>
                                    <li>• Tarjeta bloqueada o vencida</li>
                                    <li>• Problemas temporales de conexión</li>
                                    <li>• Límites de transacción excedidos</li>
                                </ul>
                            </div>

                            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                                <h3 className="text-blue-400 font-medium mb-2">¿Qué puedes hacer?</h3>
                                <ul className="text-zinc-300 text-sm space-y-1">
                                    <li>1. Verificar los datos de tu tarjeta</li>
                                    <li>2. Intentar con otra tarjeta</li>
                                    <li>3. Contactar a tu banco</li>
                                    <li>4. Usar transferencia SPEI (sin comisiones)</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Métodos alternativos */}
                <Card className="bg-zinc-900 border-zinc-800 mb-6">
                    <CardHeader>
                        <CardTitle className="text-zinc-100">
                            Método Alternativo
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                            <h3 className="text-green-400 font-medium mb-2">💡 Usa Transferencia SPEI</h3>
                            <p className="text-zinc-300 text-sm mb-3">
                                Una opción segura y sin comisiones adicionales
                            </p>
                            <ul className="text-zinc-400 text-sm space-y-1">
                                <li>✅ Sin comisiones (las absorbemos nosotros)</li>
                                <li>✅ Procesamiento automático</li>
                                <li>✅ Confirmación inmediata del banco</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Acciones */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                        onClick={handleReintentar}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reintentar Pago
                    </Button>

                    <Button
                        onClick={handleContactarSoporte}
                        variant="outline"
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                        💬 Contactar Soporte
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

                {/* Nota de seguridad */}
                <div className="mt-6 text-center">
                    <p className="text-zinc-500 text-xs">
                        🔒 Todos los pagos son procesados de forma segura por Stripe
                    </p>
                </div>
            </div>
        </div>
    )
}
