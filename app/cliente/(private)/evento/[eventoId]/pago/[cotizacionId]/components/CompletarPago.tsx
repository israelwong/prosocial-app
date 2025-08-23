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
    const [procesandoPago, setProcesandoPago] = useState(false)
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

        if (metodoPago === 'spei') {
            // Para SPEI, redirigir a página pendiente interna
            router.push(`/cliente/evento/${eventoId}/pago/${cotizacionId}/pending?monto=${monto}`)
        } else {
            // Para tarjeta, crear payment intent con el monto con comisión
            await crearPaymentIntent(montoConComision)
        }
    }

    const crearPaymentIntent = async (montoFinal: number) => {
        if (procesandoPago) return

        setProcesandoPago(true)
        console.log('🚀 Creando Payment Intent para cliente...', {
            montoBase: parseFloat(montoAPagar),
            montoConComision: montoFinal,
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
                    metodoPago: 'card',
                    montoConComision: montoFinal,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error al preparar el pago.')
            }

            console.log('✅ Payment Intent cliente creado:', {
                paymentIntentId: data.paymentIntentId,
                montoFinal: data.montoFinal
            })

            // Mostrar modal con Stripe Elements
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
        setMontoAPagar('')

        // Redirigir a página de éxito interna
        const paymentIntentId = paymentIntent?.id || 'success'
        router.push(`/cliente/evento/${eventoId}/pago/${cotizacionId}/success?payment_intent=${paymentIntentId}`)
    }

    const handleStripeCancel = () => {
        setShowStripeModal(false)
        setClientSecret(null)
        setProcesandoPago(false)
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
                                <div className="flex items-start space-x-3">
                                    <div className="flex items-center mt-1">
                                        <input
                                            type="radio"
                                            name="metodoPago"
                                            value="tarjeta"
                                            checked={metodoPago === 'tarjeta'}
                                            onChange={() => handleMetodoPagoChange('tarjeta')}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-600 bg-zinc-700"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center mb-2">
                                            <CreditCard className="h-4 w-4 mr-2 text-blue-400" />
                                            <span className="font-medium text-zinc-200">Tarjeta de Crédito/Débito</span>
                                        </div>
                                        <p className="text-sm text-zinc-400 mb-2">
                                            Procesamiento seguro con Stripe. Acepta Visa, Mastercard, American Express.
                                        </p>
                                        <div className="bg-zinc-900/50 rounded p-3 space-y-1">
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
                            </div>

                            {/* Opción SPEI */}
                            <div
                                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${metodoPago === 'spei'
                                    ? 'border-green-500 bg-green-500/10'
                                    : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                                    }`}
                                onClick={() => handleMetodoPagoChange('spei')}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="flex items-center mt-1">
                                        <input
                                            type="radio"
                                            name="metodoPago"
                                            value="spei"
                                            checked={metodoPago === 'spei'}
                                            onChange={() => handleMetodoPagoChange('spei')}
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-zinc-600 bg-zinc-700"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center mb-2">
                                            <Building2 className="h-4 w-4 mr-2 text-green-400" />
                                            <span className="font-medium text-zinc-200">Transferencia SPEI</span>
                                        </div>
                                        <p className="text-sm text-zinc-400 mb-2">
                                            Te proporcionaremos los datos bancarios para realizar la transferencia.
                                        </p>
                                        <div className="bg-zinc-900/50 rounded p-3">
                                            <div className="flex justify-between font-medium">
                                                <span className="text-zinc-200">Total a transferir:</span>
                                                <span className="text-green-400 font-bold">{formatMoney(parseFloat(montoAPagar))}</span>
                                            </div>
                                            <p className="text-xs text-green-300 mt-1">✨ Sin comisiones adicionales (las absorbemos nosotros)</p>
                                        </div>
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
                            <h2 className="text-white text-2xl font-bold">Completar Pago</h2>
                            <button
                                onClick={handleStripeCancel}
                                className="text-zinc-400 hover:text-white text-3xl"
                            >
                                ×
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
                            <FormularioPagoStripe
                                cotizacionId={cotizacionId}
                                paymentData={{
                                    montoFinal: montoConComision,
                                    esMSI: false, // Por ahora sin MSI para pagos de cliente
                                    numMSI: 0,
                                    tipoPago: 'card',
                                    cotizacion: {
                                        nombre: `Pago parcial - ${formatMoney(parseFloat(montoAPagar))}`,
                                        cliente: cliente?.nombre || 'Cliente'
                                    },
                                    metodo: {
                                        nombre: 'Pago con tarjeta (incluye comisión)',
                                        tipo: 'single'
                                    }
                                }}
                                onSuccess={handleStripeSuccess}
                                onCancel={handleStripeCancel}
                            />
                        </Elements>
                    </div>
                </div>
            )}
        </>
    )
}
