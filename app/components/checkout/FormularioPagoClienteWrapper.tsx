'use client'

import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import FormularioPagoCliente from './FormularioPagoCliente'
import { calcularPrecioConComision, type MetodoPagoCliente } from '@/app/cliente/_lib/utils/metodoPago.utils'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

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

export default function FormularioPagoClienteWrapper(props: Props) {
    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const metodoSeleccionado = props.metodosPago.find(m => m.id === props.metodoPagoId)
    const precioConComision = metodoSeleccionado ?
        calcularPrecioConComision(props.monto, metodoSeleccionado) : props.monto

    useEffect(() => {
        if (!props.isOpen || !metodoSeleccionado) {
            return
        }

        const crearPaymentIntent = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch('/api/cliente/create-payment-intent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        cotizacionId: props.cotizacionId,
                        clienteId: props.clienteId,
                        nombreCliente: props.nombreCliente,
                        emailCliente: props.emailCliente,
                        telefonoCliente: props.telefonoCliente,
                        metodoPago: metodoSeleccionado?.payment_method,
                        montoConComision: precioConComision,
                        metodoPagoId: props.metodoPagoId
                    })
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Error al crear Payment Intent')
                }

                // El servidor devuelve 'clientSecret', no 'client_secret'
                if (!data.clientSecret) {
                    throw new Error('El servidor no devolvió un clientSecret válido')
                }

                setClientSecret(data.clientSecret)

            } catch (err: any) {
                console.error('❌ Error al crear Payment Intent:', err)
                setError(err.message || 'Error al inicializar el pago')
                props.onPagoError(err.message || 'Error al inicializar el pago')
            } finally {
                setLoading(false)
            }
        }

        crearPaymentIntent()
    }, [props.isOpen, props.metodoPagoId, props.cotizacionId, props.clienteId])

    if (!props.isOpen) return null

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-zinc-900 rounded-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                    <p className="text-zinc-200">Inicializando pago seguro...</p>
                </div>
            </div>
        )
    }

    if (error || !clientSecret) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-zinc-900 rounded-lg p-8 text-center max-w-md">
                    <div className="text-red-400 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-zinc-100 text-lg font-medium mb-2">Error al inicializar el pago</h3>
                    <p className="text-zinc-400 text-sm mb-4">{error || 'No se pudo conectar con el procesador de pagos'}</p>

                    <button
                        onClick={props.onClose}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Procesar Pago</h2>
                    <button
                        onClick={props.onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                <Elements
                    stripe={stripePromise}
                    options={{
                        clientSecret,
                        appearance: {
                            theme: 'stripe',
                        },
                    }}
                >
                    <FormularioPagoCliente {...props} />
                </Elements>
            </div>
        </div>
    )
}
