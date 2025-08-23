'use client'

import React, { useState } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import type { PaymentIntent } from '@stripe/stripe-js'
import { CreditCard, ArrowLeft } from 'lucide-react'
import { calcularPrecioConComision, type MetodoPagoCliente } from '@/app/cliente/_lib/utils/metodoPago.utils'

interface Props {
    isOpen: boolean
    onClose: () => void
    cotizacionId: string
    clienteId: string
    nombreCliente: string
    emailCliente: string
    telefonoCliente?: string
    monto: number
    metodoPagoId: string
    metodosPago: MetodoPagoCliente[]
    onPagoExitoso: (pagoId: string) => void
    onPagoError: (error: string) => void
}

export default function FormularioPagoCliente({
    isOpen,
    onClose,
    cotizacionId,
    clienteId,
    nombreCliente,
    emailCliente,
    telefonoCliente,
    monto,
    metodoPagoId,
    metodosPago,
    onPagoExitoso,
    onPagoError
}: Props) {
    const stripe = useStripe()
    const elements = useElements()

    const [mensaje, setMensaje] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Obtener el método de pago seleccionado
    const metodoSeleccionado = metodosPago.find(m => m.id === metodoPagoId)
    const esSPEI = metodoSeleccionado?.payment_method === 'spei' ||
        metodoSeleccionado?.metodo_pago.toLowerCase().includes('spei')

    // Calcular precio con comisión
    const precioConComision = metodoSeleccionado ?
        calcularPrecioConComision(monto, metodoSeleccionado) : monto

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!stripe || !elements) {
            setMensaje('Stripe no está disponible. Recarga la página.')
            return
        }

        setIsLoading(true)
        setMensaje(null)

        console.log('🚀 Cliente - Iniciando confirmación de pago...', {
            cotizacionId,
            clienteId,
            metodoPago: metodoSeleccionado?.payment_method,
            monto: precioConComision
        })

        try {
            // Configurar parámetros de confirmación
            const confirmParams: any = {
                return_url: `${window.location.origin}/cliente/pago/success?cotizacion=${cotizacionId}&cliente=${clienteId}`,
                redirect: 'if_required' // Evitar redirección innecesaria
            }

            // Confirmar el pago
            const result = await stripe.confirmPayment({
                elements,
                confirmParams,
            })

            if (result.error) {
                console.error('❌ Error en confirmPayment:', result.error)

                if (result.error.type === "card_error" || result.error.type === "validation_error") {
                    setMensaje(result.error.message || 'Ocurrió un error con tu método de pago.')
                } else {
                    setMensaje("Un error inesperado ocurrió. Inténtalo de nuevo.")
                }
            } else if ('paymentIntent' in result && result.paymentIntent) {
                // Pago exitoso - verificación explícita de paymentIntent
                const paymentIntent = result.paymentIntent as PaymentIntent
                console.log('✅ Pago procesado correctamente:', {
                    paymentIntentId: paymentIntent.id,
                    status: paymentIntent.status
                })

                if (paymentIntent.status === 'succeeded') {
                    onPagoExitoso(paymentIntent.id)
                } else if (paymentIntent.status === 'processing') {
                    // Para SPEI, el pago queda en processing hasta que se complete la transferencia
                    setMensaje('Pago en proceso. Recibirás instrucciones por correo electrónico.')
                    setTimeout(() => onPagoExitoso(paymentIntent.id), 2000)
                }
            }
        } catch (err: any) {
            console.error('❌ Error inesperado:', err)
            setMensaje('Error inesperado. Por favor inténtalo de nuevo.')
        }

        setIsLoading(false)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="space-y-6">
                    {/* 📋 Resumen del pago */}
                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                        <h3 className="text-white font-medium text-lg mb-3 flex items-center">
                            <CreditCard className="h-5 w-5 mr-2" />
                            Resumen del pago
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Cliente:</span>
                                <span className="text-zinc-100">{nombreCliente}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Email:</span>
                                <span className="text-zinc-100">{emailCliente}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Método:</span>
                                <span className="text-zinc-100">
                                    {esSPEI ? 'Transferencia SPEI' : 'Tarjeta de crédito/débito'}
                                </span>
                            </div>
                            <div className="border-t border-zinc-600 pt-2 mt-3 flex justify-between">
                                <span className="text-white font-bold">Total:</span>
                                <span className="text-green-400 font-bold text-lg">
                                    {formatMoney(precioConComision)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 💳 Formulario de pago */}
                    <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                            <PaymentElement
                                id="payment-element"
                                options={{
                                    layout: "tabs",
                                    paymentMethodOrder: esSPEI
                                        ? ['customer_balance']
                                        : ['card']
                                }}
                            />
                        </div>

                        {/* 🏦 Información SPEI */}
                        {esSPEI && (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <h4 className="text-blue-300 font-medium mb-2 flex items-center">
                                    🏦 Transferencia SPEI
                                </h4>
                                <div className="text-blue-100 text-sm space-y-1">
                                    <p>• Recibirás las instrucciones bancarias por correo electrónico</p>
                                    <p>• Se generará automáticamente una cuenta CLABE única</p>
                                    <p>• Sin comisiones adicionales</p>
                                    <p>• Confirmación automática una vez realizada la transferencia</p>
                                </div>
                            </div>
                        )}

                        {/* 💳 Información Tarjeta */}
                        {!esSPEI && (
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                                <h4 className="text-purple-300 font-medium mb-2 flex items-center">
                                    💳 Pago con tarjeta
                                </h4>
                                <div className="text-purple-100 text-sm space-y-1">
                                    <p>• Pago único (sin MSI para clientes)</p>
                                    <p>• Tarjetas de crédito y débito aceptadas</p>
                                    <p>• Confirmación inmediata</p>
                                </div>
                            </div>
                        )}

                        {/* 🚨 Mensaje de error */}
                        {mensaje && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                <p className="text-red-300 text-sm">{mensaje}</p>
                            </div>
                        )}

                        {/* 🔄 Botones de acción */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 px-6 rounded-lg border border-zinc-600 font-medium text-sm transition-all duration-200 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white flex items-center justify-center"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={isLoading || !stripe || !elements}
                                className="flex-2 py-3 px-6 rounded-lg border font-medium text-sm transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white border-blue-500 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Procesando...
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Pagar {formatMoney(precioConComision)}
                                    </div>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
