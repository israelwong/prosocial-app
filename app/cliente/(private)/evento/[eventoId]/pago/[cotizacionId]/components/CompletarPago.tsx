import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { CreditCard, Building2, AlertCircle, Lock } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import FormularioPagoStripe from '@/app/components/checkout/FormularioPagoStripe'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CompletarPagoProps {
    cotizacionId: string
    eventoId: string
    saldoPendiente: number
    cliente: any
    onPaymentSuccess?: () => void
}

export default function CompletarPago({ cotizacionId, eventoId, saldoPendiente, cliente, onPaymentSuccess }: CompletarPagoProps) {
    const [montoAPagar, setMontoAPagar] = useState('')
    const [metodoPago, setMetodoPago] = useState('tarjeta')
    const [showStripeModal, setShowStripeModal] = useState(false)
    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [currentPaymentIntentId, setCurrentPaymentIntentId] = useState<string | null>(null) // 🆕 Para limpieza
    const [procesandoPago, setProcesandoPago] = useState(false)
    const [cancelandoPago, setCancelandoPago] = useState(false) // 🆕 Estado de cancelación
    const [montoConComision, setMontoConComision] = useState(0)
    const router = useRouter()

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    // Calcular el monto con comisión según el método de pago
    const calcularMontoConComision = (monto: number, metodo: string) => {
        if (metodo === 'spei') {
            // SPEI sin comisión adicional
            return monto
        } else {
            // Tarjeta con comisión del 3.6% + IVA (16%)
            const comisionBase = monto * 0.036 // 3.6%
            const iva = comisionBase * 0.16 // 16% de IVA
            const comisionTotal = comisionBase + iva
            return monto + comisionTotal
        }
    }

    const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = e.target.value
        // Solo permitir números y punto decimal
        if (/^\d*\.?\d*$/.test(valor)) {
            setMontoAPagar(valor)

            // Recalcular monto con comisión
            if (valor) {
                const monto = parseFloat(valor)
                const montoFinal = calcularMontoConComision(monto, metodoPago)
                setMontoConComision(montoFinal)
            } else {
                setMontoConComision(0)
            }
        }
    }

    const handleMetodoPagoChange = (nuevoMetodo: string) => {
        setMetodoPago(nuevoMetodo)

        // Recalcular comisión con el nuevo método
        if (montoAPagar) {
            const monto = parseFloat(montoAPagar)
            const montoFinal = calcularMontoConComision(monto, nuevoMetodo)
            setMontoConComision(montoFinal)
        }
    }

    const handlePagar = async () => {
        if (!montoAPagar) return

        const monto = parseFloat(montoAPagar)

        if (monto <= 0 || monto > saldoPendiente) {
            alert(`El monto debe ser mayor a $0 y no exceder ${formatMoney(saldoPendiente)}`)
            return
        }

        // Para ambos métodos (tarjeta y SPEI), crear payment intent y usar Stripe Elements
        const montoFinal = metodoPago === 'spei' ? monto : montoConComision
        await crearPaymentIntent(montoFinal)
    }

    const crearPaymentIntent = async (montoFinal: number) => {
        if (procesandoPago) return

        setProcesandoPago(true)
        console.log('🚀 Creando Payment Intent para cliente...', {
            montoBase: parseFloat(montoAPagar),
            montoFinal: montoFinal,
            metodoPago,
            eventoId
        })

        try {
            const response = await fetch('/api/cliente/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cotizacionId: cotizacionId,
                    eventoId: eventoId,
                    metodoPago: metodoPago === 'spei' ? 'spei' : 'card',
                    montoConComision: montoFinal,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error al preparar el pago.')
            }

            console.log('✅ Payment Intent cliente creado:', {
                paymentIntentId: data.paymentIntentId,
                metodoPago: metodoPago,
                montoFinal: data.montoFinal
            })

            // Guardar el Payment Intent ID para posible cancelación
            setCurrentPaymentIntentId(data.paymentIntentId)

            // Mostrar modal con Stripe Elements para ambos métodos
            setClientSecret(data.clientSecret)
            setShowStripeModal(true)

        } catch (error) {
            console.error('❌ Error al crear Payment Intent cliente:', error)
            // Redirigir a página de error interna
            router.push(`/cliente/evento/${eventoId}/pago/${cotizacionId}/error`)
        }

        setProcesandoPago(false)
    }

    const handleStripeSuccess = (paymentIntent?: any) => {
        setShowStripeModal(false)
        setClientSecret(null)
        setCurrentPaymentIntentId(null) // 🧹 Limpiar estado tras éxito
        setMontoAPagar('')

        const paymentIntentId = paymentIntent?.id || currentPaymentIntentId || 'success'

        // 🏦 Para SPEI, redirigir a página pendiente porque el pago aún no se completó
        if (metodoPago === 'spei') {
            console.log('🏦 SPEI: Datos de transferencia configurados, redirigiendo a pendiente:', paymentIntentId)
            router.push(`/cliente/evento/${eventoId}/pago/${cotizacionId}/pending?payment_intent=${paymentIntentId}&monto=${parseFloat(montoAPagar)}`)
        } else {
            // 💳 Para tarjetas, redirigir a página de éxito porque el pago se completó
            console.log('💳 Tarjeta: Pago completado, redirigiendo a éxito:', paymentIntentId)
            router.push(`/cliente/evento/${eventoId}/pago/${cotizacionId}/success?payment_intent=${paymentIntentId}`)
        }
    }

    const handleStripeCancel = async () => {
        setCancelandoPago(true) // 🔄 Mostrar estado de cancelación

        // 🗑️ Limpiar Payment Intent cancelado para evitar pagos fantasma
        // Para SPEI y tarjetas, si el usuario cancela explícitamente, limpiamos el Payment Intent
        if (currentPaymentIntentId) {
            try {
                console.log('🗑️ Cancelando y limpiando Payment Intent:', currentPaymentIntentId)

                const response = await fetch('/api/cliente/cancel-payment-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paymentIntentId: currentPaymentIntentId
                    }),
                })

                const data = await response.json()

                if (response.ok) {
                    console.log('✅ Payment Intent limpiado:', data)
                } else {
                    console.error('⚠️ Error al limpiar Payment Intent:', data.error)
                }
            } catch (error) {
                console.error('❌ Error en limpieza de Payment Intent:', error)
            }
        }

        // Limpiar estado del componente
        setShowStripeModal(false)
        setClientSecret(null)
        setCurrentPaymentIntentId(null)
        setProcesandoPago(false)
        setCancelandoPago(false) // 🔄 Limpiar estado de cancelación
    }

    return (
        <>
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-zinc-100 flex items-center">
                        <CreditCard className="h-5 w-5 mr-2" />
                        Completar Pago
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Saldo Pendiente */}
                    <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-amber-300 font-medium">Saldo pendiente:</span>
                            <span className="font-bold text-amber-400 text-xl">
                                {formatMoney(saldoPendiente)}
                            </span>
                        </div>
                    </div>

                    {/* Monto a Pagar */}
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

                    {/* Radio buttons para método de pago */}
                    {montoAPagar && parseFloat(montoAPagar) > 0 && (
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-zinc-300">
                                Selecciona tu método de pago:
                            </label>

                            {/* Opción Tarjeta */}
                            <div
                                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${metodoPago === 'tarjeta'
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                                    }`}
                                onClick={() => handleMetodoPagoChange('tarjeta')}
                            >
                                <div className="w-full">
                                    <div className="flex items-center mb-2">
                                        <CreditCard className="h-4 w-4 mr-2 text-blue-400" />
                                        <span className="font-medium text-zinc-200">Tarjeta de Crédito/Débito</span>
                                    </div>
                                    <p className="text-sm text-zinc-400 mb-2">
                                        Procesamiento seguro con Stripe. Acepta Visa, Mastercard, American Express.
                                    </p>
                                    <div className="bg-zinc-900/50 rounded p-3 space-y-1 w-full">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-400">Subtotal:</span>
                                            <span className="text-zinc-300">{formatMoney(parseFloat(montoAPagar))}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-400">Comisión Stripe (3.6% + IVA):</span>
                                            <span className="text-zinc-300">{formatMoney(montoConComision - parseFloat(montoAPagar))}</span>
                                        </div>
                                        <div className="flex justify-between font-medium border-t border-zinc-600 pt-2">
                                            <span className="text-zinc-200">Total a pagar:</span>
                                            <span className="text-blue-400 font-bold">{formatMoney(montoConComision)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Opción SPEI */}
                            <div
                                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${metodoPago === 'spei'
                                    ? 'border-green-500 bg-green-500/10'
                                    : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                                    }`}
                                onClick={() => handleMetodoPagoChange('spei')}
                            >
                                <div className="w-full">
                                    <div className="flex items-center mb-2">
                                        <Building2 className="h-4 w-4 mr-2 text-green-400" />
                                        <span className="font-medium text-zinc-200">Transferencia SPEI</span>
                                    </div>
                                    <p className="text-sm text-zinc-400 mb-2">
                                        Te proporcionaremos los datos bancarios para realizar la transferencia.
                                    </p>
                                    <div className="bg-zinc-900/50 rounded p-3 w-full">
                                        <div className="flex justify-between font-medium">
                                            <span className="text-zinc-200">Total a transferir:</span>
                                            <span className="text-green-400 font-bold">{formatMoney(parseFloat(montoAPagar))}</span>
                                        </div>
                                        <p className="text-xs text-green-300 mt-1">✨ Sin comisiones adicionales (las absorbemos nosotros)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Botón Pagar */}
                    <Button
                        onClick={handlePagar}
                        disabled={!montoAPagar || parseFloat(montoAPagar) <= 0 || procesandoPago}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        size="lg"
                    >
                        {procesandoPago ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Procesando pago...
                            </>
                        ) : !montoAPagar || parseFloat(montoAPagar) <= 0 ? (
                            'Ingresa un monto para continuar'
                        ) : (
                            <>
                                {metodoPago === 'tarjeta' ? (
                                    <CreditCard className="h-4 w-4 mr-2" />
                                ) : (
                                    <Building2 className="h-4 w-4 mr-2" />
                                )}
                                Pagarás {formatMoney(metodoPago === 'spei' ? parseFloat(montoAPagar) : montoConComision)}
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Modal de Stripe con Elements */}
            {showStripeModal && clientSecret && (
                <div className="fixed inset-0 bg-zinc-900 z-50 overflow-y-auto">
                    <div className="min-h-screen p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-white text-2xl font-bold">
                                {metodoPago === 'spei' ? 'Transferencia SPEI' : 'Completar Pago'}
                            </h2>
                            <button
                                onClick={handleStripeCancel}
                                disabled={cancelandoPago || procesandoPago} // 🎯 Deshabilitar durante cualquier proceso
                                className={`text-3xl transition-all duration-200 ${(cancelandoPago || procesandoPago)
                                    ? 'text-zinc-600 cursor-not-allowed'
                                    : 'text-zinc-400 hover:text-white'
                                    }`}
                                title={
                                    cancelandoPago ? 'Procesando...' :
                                        procesandoPago ? 'Procesando pago...' :
                                            metodoPago === 'spei' ? 'Continuar con los datos de transferencia' : 'Cancelar pago'
                                }
                            >
                                {(cancelandoPago || procesandoPago) ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-6 h-6 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    '×'
                                )}
                            </button>
                        </div>

                        <Elements
                            stripe={stripePromise}
                            options={{
                                clientSecret,
                                appearance: {
                                    theme: 'night',
                                    variables: {
                                        colorPrimary: '#3b82f6',
                                        colorBackground: '#27272a',
                                        colorText: '#ffffff',
                                        colorDanger: '#ef4444',
                                        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                                        spacingUnit: '4px',
                                        borderRadius: '8px',
                                    }
                                }
                            }}
                        >
                            {/* Mensaje informativo para SPEI */}
                            {metodoPago === 'spei' && (
                                <div className="mb-6 p-4 bg-green-900/20 border border-green-800 rounded-lg">
                                    <div className="flex items-start space-x-3">
                                        <Building2 className="h-5 w-5 text-green-400 mt-0.5" />
                                        <div>
                                            <h3 className="text-green-300 font-medium mb-1">¿Cómo funciona la transferencia SPEI?</h3>
                                            <div className="text-green-200 text-sm space-y-1">
                                                <p>1. Se mostrarán los datos bancarios para tu transferencia</p>
                                                <p>2. Al confirmar, irás a una página con instrucciones detalladas</p>
                                                <p>3. Realiza la transferencia desde tu banco</p>
                                                <p>4. Tu pago se reflejará automáticamente</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <FormularioPagoStripe
                                cotizacionId={cotizacionId}
                                paymentData={{
                                    montoFinal: metodoPago === 'spei' ? parseFloat(montoAPagar) : montoConComision,
                                    esMSI: false, // Por ahora sin MSI para pagos de cliente
                                    numMSI: 0,
                                    tipoPago: metodoPago === 'spei' ? 'spei' : 'card',
                                    cotizacion: {
                                        nombre: `Pago parcial - ${formatMoney(parseFloat(montoAPagar))}`,
                                        cliente: cliente?.nombre || 'Cliente'
                                    },
                                    metodo: {
                                        nombre: metodoPago === 'spei'
                                            ? 'Transferencia SPEI (sin comisión)'
                                            : 'Pago con tarjeta (incluye comisión)',
                                        tipo: 'single'
                                    }
                                }}
                                onSuccess={handleStripeSuccess}
                                onCancel={handleStripeCancel}
                                isCanceling={cancelandoPago}
                                isProcessingPayment={procesandoPago}
                            />
                        </Elements>
                    </div>
                </div>
            )}
        </>
    )
}
