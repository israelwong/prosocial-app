'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { ArrowLeft, CreditCard, Lock, AlertCircle } from 'lucide-react'
import { useClienteAuth } from '../../../../../../hooks'
import { crearPagoCliente } from '../../../../../../_lib/actions/pago.actions'

export default function CheckoutPage() {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        numeroTarjeta: '',
        fechaExpiracion: '',
        cvv: '',
        nombreTarjeta: '',
        metodoPago: 'tarjeta'
    })
    const { cliente, isAuthenticated } = useClienteAuth()
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()

    const eventoId = params?.eventoId as string
    const cotizacionId = params?.cotizacionId as string
    const monto = searchParams?.get('monto')

    useEffect(() => {
        if (!isAuthenticated || !cliente) {
            return
        }

        if (!monto || parseFloat(monto) <= 0) {
            router.push(`/cliente/evento/${eventoId}/pago/${cotizacionId}`)
        }
    }, [isAuthenticated, cliente, monto, eventoId, cotizacionId, router])

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const formatCardNumber = (value: string) => {
        // Remover espacios y caracteres no numéricos
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
        // Agregar espacios cada 4 dígitos
        const matches = v.match(/\d{4,16}/g)
        const match = matches && matches[0] || ''
        const parts = []
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4))
        }
        if (parts.length) {
            return parts.join(' ')
        } else {
            return v
        }
    }

    const formatExpirationDate = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4)
        }
        return v
    }

    const handleProcesarPago = async () => {
        if (!cliente || !monto) return

        // Validaciones según el método de pago
        if (formData.metodoPago === 'tarjeta') {
            if (!formData.numeroTarjeta || !formData.fechaExpiracion || !formData.cvv || !formData.nombreTarjeta) {
                alert('Por favor completa todos los campos de la tarjeta')
                return
            }
        }

        try {
            setLoading(true)

            const pagoData: any = {
                cotizacionId,
                clienteId: cliente.id,
                monto: parseFloat(monto),
                metodoPago: formData.metodoPago
            }

            // Solo incluir datos de tarjeta si el método es tarjeta
            if (formData.metodoPago === 'tarjeta') {
                pagoData.datosTarjeta = {
                    numero: formData.numeroTarjeta.replace(/\s/g, ''),
                    fechaExpiracion: formData.fechaExpiracion,
                    cvv: formData.cvv,
                    nombre: formData.nombreTarjeta
                }
            }

            const response = await crearPagoCliente(pagoData)

            if (response.success) {
                // Para pagos del cliente procesados internamente, solo mostramos notificación
                // y redirigimos al evento o historial de pagos
                const status = response.data?.status || 'pendiente'

                if (status === 'completado' || status === 'success') {
                    // Pago exitoso - redirigir al historial de pagos con notificación
                    router.push(`/cliente/evento/${eventoId}/pagos?pagoExitoso=true&pagoId=${response.data?.id}`)
                } else {
                    // Pago pendiente - redirigir al evento con notificación
                    router.push(`/cliente/evento/${eventoId}?pagoPendiente=true&pagoId=${response.data?.id}`)
                }
            } else {
                // Error en el procesamiento - redirigir al evento con notificación de error
                router.push(`/cliente/evento/${eventoId}?pagoError=true&message=${encodeURIComponent(response.message || 'Error al procesar el pago')}`)
            }

        } catch (error) {
            console.error('❌ Error al procesar pago:', error)
            // Error interno - redirigir al evento con notificación de error
            router.push(`/cliente/evento/${eventoId}?pagoError=true&message=${encodeURIComponent('Error interno del servidor')}`)
        } finally {
            setLoading(false)
        }
    }

    if (!isAuthenticated || !monto) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-100 mb-2">
                        Información inválida
                    </h3>
                    <p className="text-zinc-400 mb-4">
                        No se pudo procesar la solicitud de pago.
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
            {/* Header */}
            <div className="bg-zinc-900 shadow-sm border-b border-zinc-800">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-6">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/cliente/evento/${eventoId}/pago/${cotizacionId}`)}
                                className="text-zinc-400 hover:text-zinc-100"
                                disabled={loading}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-100">Completar Pago</h1>
                                <p className="text-zinc-400">Monto: {formatMoney(parseFloat(monto))}</p>
                            </div>
                        </div>
                        <div className="flex items-center text-green-400">
                            <Lock className="h-4 w-4 mr-2" />
                            <span className="text-sm">Conexión segura</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-zinc-100 flex items-center">
                            <CreditCard className="h-5 w-5 mr-2" />
                            Información de Pago
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Método de Pago */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Método de Pago
                            </label>
                            <Select
                                value={formData.metodoPago}
                                onValueChange={(value) => handleInputChange('metodoPago', value)}
                            >
                                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                                    <SelectValue placeholder="Selecciona un método de pago" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tarjeta">Tarjeta de Crédito/Débito</SelectItem>
                                    <SelectItem value="spei">Transferencia SPEI</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-zinc-500 mt-1">
                                {formData.metodoPago === 'spei'
                                    ? 'Transferencia bancaria inmediata disponible 24/7'
                                    : 'Pago inmediato con tarjeta de crédito o débito'
                                }
                            </p>
                        </div>

                        {/* Campos de Tarjeta - Solo mostrar si el método es tarjeta */}
                        {formData.metodoPago === 'tarjeta' && (
                            <>
                                {/* Número de Tarjeta */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Número de Tarjeta
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.numeroTarjeta}
                                        onChange={(e) => handleInputChange('numeroTarjeta', formatCardNumber(e.target.value))}
                                        placeholder="1234 5678 9012 3456"
                                        maxLength={19}
                                        className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Fecha de Expiración */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                                            Fecha de Expiración
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.fechaExpiracion}
                                            onChange={(e) => handleInputChange('fechaExpiracion', formatExpirationDate(e.target.value))}
                                            placeholder="MM/AA"
                                            maxLength={5}
                                            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500"
                                            disabled={loading}
                                        />
                                    </div>

                                    {/* CVV */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                                            CVV
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.cvv}
                                            onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                                            placeholder="123"
                                            maxLength={4}
                                            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                {/* Nombre en la Tarjeta */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Nombre en la Tarjeta
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.nombreTarjeta}
                                        onChange={(e) => handleInputChange('nombreTarjeta', e.target.value.toUpperCase())}
                                        placeholder="NOMBRE COMPLETO"
                                        className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500"
                                        disabled={loading}
                                    />
                                </div>
                            </>
                        )}

                        {/* Información SPEI - Solo mostrar si el método es SPEI */}
                        {formData.metodoPago === 'spei' && (
                            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                                <h4 className="font-medium text-blue-300 mb-3 flex items-center">
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Información para transferencia SPEI
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-zinc-400">Banco:</span>
                                            <p className="text-zinc-100 font-medium">BBVA Bancomer</p>
                                        </div>
                                        <div>
                                            <span className="text-zinc-400">CLABE:</span>
                                            <p className="text-zinc-100 font-medium">012180001234567890</p>
                                        </div>
                                        <div>
                                            <span className="text-zinc-400">Beneficiario:</span>
                                            <p className="text-zinc-100 font-medium">ProSocial Events SA de CV</p>
                                        </div>
                                        <div>
                                            <span className="text-zinc-400">Referencia:</span>
                                            <p className="text-zinc-100 font-medium">EVENTO-{eventoId?.slice(-8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-3 bg-amber-900/20 border border-amber-800 rounded">
                                        <p className="text-amber-300 text-xs">
                                            <strong>Importante:</strong> Una vez realizada la transferencia, el pago se reflejará en un plazo de 15 a 30 minutos.
                                            Asegúrate de incluir la referencia exacta para identificar tu pago.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Resumen */}
                        <div className="bg-zinc-800 p-4 rounded-lg">
                            <h4 className="font-medium text-zinc-300 mb-2">Resumen del Pago:</h4>
                            <div className="flex justify-between text-lg font-bold text-zinc-100">
                                <span>Total a pagar:</span>
                                <span>{formatMoney(parseFloat(monto))}</span>
                            </div>
                        </div>

                        {/* Botón de Pago */}
                        <Button
                            onClick={handleProcesarPago}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Procesando pago, no cierre esta ventana...
                                </>
                            ) : (
                                <>
                                    <Lock className="h-4 w-4 mr-2" />
                                    {formData.metodoPago === 'spei'
                                        ? `Confirmar transferencia de ${formatMoney(parseFloat(monto))}`
                                        : `Pagar ${formatMoney(parseFloat(monto))} con tarjeta`
                                    }
                                </>
                            )}
                        </Button>

                        <div className="text-center text-sm text-zinc-500">
                            <p>Tu información está protegida con cifrado SSL de 256 bits</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
