'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Evento } from '../_lib/types'
import { crearSesionPago } from '../_lib/actions/pago.actions'
import { useClienteAuth } from '../hooks'
import { X, CreditCard, DollarSign } from 'lucide-react'

interface Props {
    evento: Evento | null
    isOpen: boolean
    onClose: () => void
}

export default function ModalPagoCliente({ evento, isOpen, onClose }: Props) {
    const [montoCustom, setMontoCustom] = useState('')
    const [processingPayment, setProcessingPayment] = useState(false)
    const [error, setError] = useState('')
    const { cliente } = useClienteAuth()

    if (!evento || !cliente) return null

    const getSaldoPendiente = () => {
        return evento.cotizacion.total - evento.cotizacion.pagado
    }

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    const validateMonto = (monto: string) => {
        const amount = parseFloat(monto)
        if (isNaN(amount) || amount <= 0) {
            return 'Por favor ingresa un monto válido'
        }
        if (amount > getSaldoPendiente()) {
            return 'El monto no puede ser mayor al saldo pendiente'
        }
        return null
    }

    const procesarPago = async (monto: number) => {
        setProcessingPayment(true)
        setError('')

        try {
            const response = await crearSesionPago({
                cotizacionId: evento.cotizacion.id,
                monto,
                clienteEmail: cliente.email,
                clienteNombre: cliente.nombre,
                eventoNombre: evento.nombre
            })

            if (response.success && response.sessionUrl) {
                // Redirigir a Stripe Checkout
                window.location.href = response.sessionUrl
            } else {
                setError(response.message || 'Error al procesar el pago')
            }
        } catch (error) {
            console.error('Error al procesar pago:', error)
            setError('Error al procesar el pago')
        } finally {
            setProcessingPayment(false)
        }
    }

    const handlePagoCompleto = async () => {
        const monto = getSaldoPendiente()
        await procesarPago(monto)
    }

    const handlePagoCustom = async () => {
        const errorMonto = validateMonto(montoCustom)
        if (errorMonto) {
            setError(errorMonto)
            return
        }

        const monto = parseFloat(montoCustom)
        await procesarPago(monto)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <div className="flex justify-between items-center">
                        <DialogTitle className="text-xl font-bold text-zinc-100">
                            Realizar Pago
                        </DialogTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-zinc-400 hover:text-zinc-100"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Información del evento */}
                    <div className="bg-zinc-800 rounded-lg p-4">
                        <h3 className="font-semibold text-zinc-100 mb-2">{evento.nombre}</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Total:</span>
                                <span className="font-medium text-zinc-100">
                                    {formatMoney(evento.cotizacion.total)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Pagado:</span>
                                <span className="font-medium text-green-400">
                                    {formatMoney(evento.cotizacion.pagado)}
                                </span>
                            </div>
                            <div className="flex justify-between border-t border-zinc-700 pt-2">
                                <span className="text-zinc-400">Saldo pendiente:</span>
                                <span className="font-medium text-yellow-400">
                                    {formatMoney(getSaldoPendiente())}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Opciones de pago */}
                    <div className="space-y-4">
                        {/* Pago completo */}
                        <Button
                            onClick={handlePagoCompleto}
                            disabled={processingPayment || getSaldoPendiente() <= 0}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pagar saldo completo ({formatMoney(getSaldoPendiente())})
                        </Button>

                        {/* Separador */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-zinc-700" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-zinc-900 px-2 text-zinc-400">o</span>
                            </div>
                        </div>

                        {/* Pago personalizado */}
                        <div className="space-y-3">
                            <label className="text-sm text-zinc-400">Monto personalizado</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <DollarSign className="h-4 w-4 absolute left-3 top-3 text-zinc-400" />
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={montoCustom}
                                        onChange={(e) => setMontoCustom(e.target.value)}
                                        className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-100"
                                        min="0"
                                        max={getSaldoPendiente()}
                                        step="0.01"
                                    />
                                </div>
                                <Button
                                    onClick={handlePagoCustom}
                                    disabled={processingPayment || !montoCustom}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    Pagar
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Información adicional */}
                    <div className="text-xs text-zinc-500 bg-zinc-800/50 rounded-lg p-3">
                        <p>• Serás redirigido a una página segura de Stripe para completar el pago</p>
                        <p>• Aceptamos tarjetas de crédito y débito</p>
                        <p>• El pago se procesará de forma inmediata</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
