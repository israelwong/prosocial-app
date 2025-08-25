import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { CreditCard, Building2, AlertCircle, Lock, Clock, CheckCircle } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import FormularioPagoStripe from '@/app/components/checkout/FormularioPagoStripe'
import { obtenerMetodosPago } from '@/app/cliente/_lib/actions/pago.actions'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface MetodoPago {
    id: string
    metodo_pago: string
    comision_porcentaje_base: number | null
    comision_fija_monto: number | null
    num_msi: number | null
    comision_msi_porcentaje: number | null
    payment_method: string | null
}

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
    const [procesandoConfirmacion, setProcesandoConfirmacion] = useState(false) // 🆕 Estado post-pago
    const [montoConComision, setMontoConComision] = useState(0)
    const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]) // 🆕 Métodos de pago de BD
    const [cargandoMetodos, setCargandoMetodos] = useState(true) // 🆕 Estado de carga
    const router = useRouter()

    // 🆕 Cargar métodos de pago al montar el componente
    useEffect(() => {
        const cargarMetodosPago = async () => {
            try {
                setCargandoMetodos(true)
                const resultado = await obtenerMetodosPago()

                if (resultado.success && resultado.data) {
                    setMetodosPago(resultado.data)
                    console.log('✅ Métodos de pago cargados:', resultado.data)
                } else {
                    console.error('❌ Error al cargar métodos de pago:', resultado.message)
                }
            } catch (error) {
                console.error('❌ Error al cargar métodos de pago:', error)
            } finally {
                setCargandoMetodos(false)
            }
        }

        cargarMetodosPago()
    }, [])

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    // 🆕 Calcular el monto con comisión según el método de pago desde BD
    const calcularMontoConComision = (monto: number, metodo: string) => {
        // Buscar el método de pago en los datos de BD
        const metodoPagoData = metodosPago.find(mp =>
            mp.payment_method === metodo ||
            mp.metodo_pago.toLowerCase().includes(metodo.toLowerCase())
        )

        if (!metodoPagoData) {
            console.warn(`⚠️ Método de pago no encontrado en BD: ${metodo}`)
            // Fallback a valores anteriores si no se encuentra en BD
            if (metodo === 'spei') {
                return monto // SPEI sin comisión
            } else {
                // Tarjeta con comisión del 3.6% + IVA (16%)
                const comisionBase = monto * 0.036
                const iva = comisionBase * 0.16
                return monto + comisionBase + iva
            }
        }

        // Usar datos de la BD
        if (metodo === 'spei' || metodoPagoData.payment_method === 'customer_balance') {
            // SPEI sin comisión adicional
            return monto
        } else {
            // Tarjeta u otros métodos con comisión
            const porcentajeComision = metodoPagoData.comision_porcentaje_base || 0
            const montoFijo = metodoPagoData.comision_fija_monto || 0

            // Calcular comisión base
            const comisionBase = monto * (porcentajeComision / 100)

            // Agregar IVA del 16% a la comisión
            const iva = comisionBase * 0.16

            // Total = monto base + comisión + IVA + monto fijo
            const total = monto + comisionBase + iva + montoFijo
            return parseFloat(total.toFixed(2)) // 🎯 Truncar a 2 decimales
        }
    }

    const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = e.target.value
        // Solo permitir números y punto decimal, máximo 2 decimales
        if (/^\d*\.?\d{0,2}$/.test(valor)) { // 🎯 Limitar a 2 decimales desde el input
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
                    cotizacionId,
                    metodoPago,
                    montoBase: parseFloat(montoAPagar), // 🆕 Monto que se abona al cliente
                    montoConComision, // 🆕 Monto que se cobra en Stripe
                    eventoId
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

    const handleStripeSuccess = async (paymentIntent?: any) => {
        console.log('🎉 Pago exitoso:', paymentIntent)

        // 🔄 Activar estado de procesamiento de confirmación
        setProcesandoConfirmacion(true)

        // 🧹 Limpiar estados de configuración
        setShowStripeModal(false)
        setClientSecret(null)
        setCurrentPaymentIntentId(null) // 🧹 Limpiar estado tras éxito
        setMontoAPagar('')

        try {
            // ⏳ Pequeña pausa para mostrar el estado de procesando
            await new Promise(resolve => setTimeout(resolve, 1500))

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
        } catch (error) {
            console.error('❌ Error durante el procesamiento:', error)
            setProcesandoConfirmacion(false)
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
        setProcesandoConfirmacion(false) // 🔄 Limpiar estado de confirmación
        setCancelandoPago(false) // 🔄 Limpiar estado de cancelación
    }

    // 🏦 Función específica para cerrar modal SPEI y ir directamente a pendiente
    const handleSPEIRedirect = () => {
        console.log('🏦 SPEI: Cerrando modal y redirigiendo a página pendiente:', currentPaymentIntentId)

        // Limpiar estado local sin cancelar Payment Intent
        setShowStripeModal(false)
        setClientSecret(null)
        const paymentIntentId = currentPaymentIntentId
        setCurrentPaymentIntentId(null)
        setProcesandoPago(false)
        setCancelandoPago(false)
        setMontoAPagar('')

        // Redirigir a página pendiente para SPEI
        router.push(`/cliente/evento/${eventoId}/pago/${cotizacionId}/pending?payment_intent=${paymentIntentId}&monto=${parseFloat(montoAPagar)}`)
    }

    // 🏦 Función específica para cerrar modal SPEI sin eliminar Payment Intent
    const handleSPEIClose = () => {
        console.log('🏦 SPEI: Cerrando modal sin eliminar Payment Intent:', currentPaymentIntentId)

        // Solo cerrar modal y limpiar estado local, preservar Payment Intent
        setShowStripeModal(false)
        setClientSecret(null)
        setCurrentPaymentIntentId(null)
        setProcesandoPago(false)
        setCancelandoPago(false)
    }

    return (
        <>
            {/* 🔄 Overlay de procesando confirmación - se muestra después del pago exitoso */}
            {procesandoConfirmacion && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-8 max-w-md mx-4">
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-lg mb-2">
                                    ✅ Pago Completado
                                </h3>
                                <p className="text-zinc-300 text-sm">
                                    Procesando confirmación y redirigiendo...
                                </p>
                            </div>
                            <div className="flex items-center justify-center space-x-1 text-zinc-400 text-xs">
                                <CheckCircle className="h-3 w-3" />
                                <span>Esto solo tomará unos segundos</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

                            {/* 🔄 Indicador de carga de métodos de pago */}
                            {cargandoMetodos ? (
                                <div className="flex items-center justify-center p-4 text-zinc-400">
                                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                                    Cargando métodos de pago...
                                </div>
                            ) : (
                                <>
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
                                                    <span className="text-zinc-400">Comisión Stripe + IVA:</span>
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
                                </>
                            )}
                        </div>
                    )}

                    {/* Botón normal de pagar */}
                    <Button
                        onClick={handlePagar}
                        disabled={!montoAPagar || parseFloat(montoAPagar) <= 0 || procesandoPago || cargandoMetodos}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        size="lg"
                    >
                        {cargandoMetodos ? (
                            <>
                                <div className="w-4 h-4 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin mr-2"></div>
                                Cargando métodos de pago...
                            </>
                        ) : procesandoPago ? (
                            <>
                                <div className="w-4 h-4 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin mr-2"></div>
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
                                {metodoPago === 'spei' ? 'Obtener datos de transferencia' : `Pagarás ${formatMoney(montoConComision)}`}
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
                                {cancelandoPago
                                    ? '🔄 Cancelando pago...'
                                    : metodoPago === 'spei' ? 'Transferencia SPEI' : 'Completar Pago'
                                }
                            </h2>
                            {/* Ocultar botón X cuando es SPEI para evitar confusión */}
                            {metodoPago !== 'spei' && (
                                <button
                                    onClick={handleStripeCancel}
                                    disabled={cancelandoPago || procesandoPago}
                                    className={`text-3xl transition-all duration-200 ${(cancelandoPago || procesandoPago)
                                        ? 'text-zinc-600 cursor-not-allowed'
                                        : 'text-zinc-400 hover:text-white'
                                        }`}
                                    title={cancelandoPago ? 'Procesando...' : procesandoPago ? 'Procesando pago...' : 'Cancelar pago'}
                                >
                                    {(cancelandoPago || procesandoPago) ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-6 h-6 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : (
                                        '×'
                                    )}
                                </button>
                            )}
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
                            {/* Ficha informativa detallada para SPEI */}
                            {metodoPago === 'spei' && (
                                <div className="mb-6 space-y-4">
                                    {/* Información principal */}
                                    <div className="p-5 bg-blue-900/20 border border-blue-700 rounded-lg">
                                        <div className="flex items-start space-x-3">
                                            <div className="bg-blue-600 rounded-full p-2">
                                                <Building2 className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-blue-300 font-semibold text-lg mb-2">Transferencia SPEI - Información importante</h3>
                                                <div className="text-blue-100 text-sm space-y-2">
                                                    <p className="font-medium text-blue-200">Al confirmar obtener los datos bancarios:</p>
                                                    <div className="pl-4 space-y-1">
                                                        <p>• Se generarán los datos bancarios para tu transferencia</p>
                                                        <p>• Tu pago quedará registrado como <span className="font-semibold text-yellow-300">"PENDIENTE"</span></p>
                                                        <p>• Irás a una página con instrucciones detalladas</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Estado y proceso */}
                                    <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                                        <div className="flex items-start space-x-3">
                                            <div className="bg-yellow-600 rounded-full p-1.5">
                                                <Clock className="h-4 w-4 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-yellow-300 font-medium mb-1">Estado del pago</h4>
                                                <div className="text-yellow-100 text-sm space-y-1">
                                                    <p>• El estatus será <span className="font-semibold">"PENDIENTE"</span> hasta realizar la transferencia</p>
                                                    <p>• Se actualizará automáticamente cuando tu banco notifique la transacción</p>
                                                    <p>• Recibirás confirmación por email una vez procesado</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Proceso paso a paso */}
                                    <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                                        <div className="flex items-start space-x-3">
                                            <div className="bg-green-600 rounded-full p-1.5">
                                                <CheckCircle className="h-4 w-4 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-green-300 font-medium mb-2">Proceso de pago</h4>
                                                <div className="text-green-100 text-sm space-y-1">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">1</span>
                                                        <span>Obtener datos bancarios (CLABE interbancaria)</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">2</span>
                                                        <span>Realizar transferencia desde tu banco o app bancaria</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">3</span>
                                                        <span>El pago se reflejará automáticamente (puede tardar unos minutos)</span>
                                                    </div>
                                                </div>
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
                                onCancel={metodoPago === 'spei' ? handleSPEIClose : handleStripeCancel}
                                isCanceling={cancelandoPago}
                                isProcessingPayment={procesandoPago}
                                isProcessingConfirmation={procesandoConfirmacion}
                            />
                        </Elements>
                    </div>
                </div>
            )}
        </>
    )
}
