'use client'
import React, { useState, useEffect } from 'react'
import { X, CreditCard, Banknote, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { obtenerCondicionesComerciales } from '@/app/admin/_lib/actions/condicionesComerciales/condicionesComerciales.actions'
import { obtenerMetodosPago } from '@/app/admin/_lib/actions/metodoPago/metodoPago.actions'

interface CondicionComercial {
    id: string
    nombre: string
    descripcion?: string | null
    descuento?: number | null
    porcentaje_anticipo?: number | null
    status: string
    CondicionesComercialesMetodoPago?: Array<{
        metodoPagoId: string
        MetodoPago: {
            id: string
            metodo_pago: string
        }
    }>
}

interface MetodoPago {
    id: string
    nombre: string
    icono: React.ReactNode
}

interface Props {
    isOpen: boolean
    onClose: () => void
    cotizacion: {
        id: string
        nombre: string
        total: number
    }
    onAutorizar: (data: {
        condicionComercialId: string
        metodoPagoId: string
        montoAPagar: number
    }) => Promise<void>
}

export default function ModalAutorizarCotizacion({ isOpen, onClose, cotizacion, onAutorizar }: Props) {
    const [condicionesComerciales, setCondicionesComerciales] = useState<CondicionComercial[]>([])
    const [condicionSeleccionada, setCondicionSeleccionada] = useState<string>('')
    const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<string>('')
    const [montoPersonalizado, setMontoPersonalizado] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [procesando, setProcesando] = useState(false)

    // Obtener iconos para métodos de pago
    const obtenerIconoMetodoPago = (nombre: string) => {
        const nombreLower = nombre.toLowerCase()
        if (nombreLower.includes('transferencia')) {
            return <Building2 className="w-5 h-5" />
        } else if (nombreLower.includes('efectivo')) {
            return <Banknote className="w-5 h-5" />
        } else if (nombreLower.includes('depósito') || nombreLower.includes('deposito')) {
            return <CreditCard className="w-5 h-5" />
        } else {
            return <CreditCard className="w-5 h-5" />
        }
    }

    // Filtrar solo métodos de pago internos (para autorización manual)
    const esMetodoInterno = (nombreMetodo: string) => {
        const metodosInternosNombres = [
            'efectivo',
            'depósito bancario',
            'deposito bancario',
            'transferencia directa',
            'transferencia bancaria'
        ];

        const nombreLower = nombreMetodo.toLowerCase().trim();
        return metodosInternosNombres.some(nombre =>
            nombreLower === nombre.toLowerCase() ||
            nombreLower.includes(nombre.toLowerCase())
        );
    }

    // Cargar condiciones comerciales
    useEffect(() => {
        if (isOpen) {
            cargarCondicionesComerciales()
        }
    }, [isOpen])

    const cargarCondicionesComerciales = async () => {
        try {
            setLoading(true)
            // Cargar condiciones comerciales con sus métodos de pago incluidos
            const condiciones = await obtenerCondicionesComerciales()
            setCondicionesComerciales(condiciones.filter(c => c.status === 'active'))
        } catch (error) {
            console.error('Error cargando condiciones comerciales:', error)
            toast.error('Error al cargar condiciones comerciales')
        } finally {
            setLoading(false)
        }
    }

    // Calcular subtotal y monto a pagar
    const calcularMontos = () => {
        const condicion = condicionesComerciales.find(c => c.id === condicionSeleccionada)
        if (!condicion) return {
            subtotal: cotizacion.total,
            montoAPagar: cotizacion.total,
            descuento: 0,
            porcentajeAnticipo: 100
        }

        const descuento = condicion.descuento || 0
        const subtotal = cotizacion.total * (1 - descuento / 100)

        const porcentajeAnticipo = condicion.porcentaje_anticipo || 100
        const montoAPagar = subtotal * (porcentajeAnticipo / 100)

        return { subtotal, montoAPagar, descuento, porcentajeAnticipo }
    }

    const { subtotal, montoAPagar, descuento, porcentajeAnticipo } = calcularMontos()
    const montoFinal = montoPersonalizado !== null ? montoPersonalizado : montoAPagar

    const handleAutorizar = async () => {
        if (!condicionSeleccionada) {
            toast.error('Selecciona una condición comercial')
            return
        }
        if (!metodoPagoSeleccionado) {
            toast.error('Selecciona un método de pago')
            return
        }
        if (montoFinal <= 0) {
            toast.error('El monto debe ser mayor a 0')
            return
        }

        try {
            setProcesando(true)
            await onAutorizar({
                condicionComercialId: condicionSeleccionada,
                metodoPagoId: metodoPagoSeleccionado,
                montoAPagar: montoFinal
            })
            onClose()
        } catch (error) {
            console.error('Error al autorizar:', error)
            toast.error('Error al autorizar cotización')
        } finally {
            setProcesando(false)
        }
    }

    const resetForm = () => {
        setCondicionSeleccionada('')
        setMetodoPagoSeleccionado('')
        setMontoPersonalizado(null)
    }

    const handleClose = () => {
        if (!procesando) {
            resetForm()
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-zinc-900 rounded-lg border border-zinc-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-700">
                    <div>
                        <h2 className="text-xl font-semibold text-zinc-100">Autorizar Cotización</h2>
                        <p className="text-zinc-400 mt-1">{cotizacion.nombre}</p>
                        <p className="text-2xl font-bold text-green-400 mt-2">
                            ${cotizacion.total.toLocaleString('es-MX')}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={procesando}
                        className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="text-zinc-400 mt-2">Cargando condiciones comerciales...</p>
                        </div>
                    ) : (
                        <>
                            {/* Condiciones Comerciales */}
                            <div>
                                <h3 className="text-lg font-medium text-zinc-200 mb-4">Condiciones Comerciales</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {condicionesComerciales.map((condicion) => {
                                        const isSelected = condicionSeleccionada === condicion.id
                                        const tempDescuento = condicion.descuento || 0
                                        const tempSubtotal = cotizacion.total * (1 - tempDescuento / 100)
                                        const tempPorcentaje = condicion.porcentaje_anticipo || 100

                                        return (
                                            <div
                                                key={condicion.id}
                                                onClick={() => {
                                                    setCondicionSeleccionada(condicion.id)
                                                    setMontoPersonalizado(null)
                                                }}
                                                className={`
                                                    p-4 rounded-lg border cursor-pointer transition-all
                                                    ${isSelected
                                                        ? 'border-blue-500 bg-blue-500/10'
                                                        : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/50'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium text-zinc-100">{condicion.nombre}</h4>
                                                    {tempDescuento > 0 && (
                                                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                                                            -{tempDescuento}% desc.
                                                        </span>
                                                    )}
                                                </div>

                                                {condicion.descripcion && (
                                                    <p className="text-zinc-400 text-sm mb-3">{condicion.descripcion}</p>
                                                )}

                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-zinc-300">Anticipo:</span>
                                                        <span className="text-zinc-100">{tempPorcentaje}%</span>
                                                    </div>
                                                    {tempDescuento > 0 && (
                                                        <div className="flex justify-between">
                                                            <span className="text-zinc-300">Descuento:</span>
                                                            <span className="text-green-400">{tempDescuento}%</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between font-medium">
                                                        <span className="text-zinc-200">Subtotal:</span>
                                                        <span className="text-zinc-100">
                                                            ${tempSubtotal.toLocaleString('es-MX')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Monto a pagar */}
                            {condicionSeleccionada && (
                                <div>
                                    <h3 className="text-lg font-medium text-zinc-200 mb-4">Monto a Pagar</h3>
                                    <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-300">Precio original:</span>
                                            <span className="text-zinc-100">${cotizacion.total.toLocaleString('es-MX')}</span>
                                        </div>
                                        {descuento > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-zinc-300">Descuento ({descuento}%):</span>
                                                <span className="text-green-400">-${(cotizacion.total - subtotal).toLocaleString('es-MX')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-300">Subtotal:</span>
                                            <span className="text-zinc-100">${subtotal.toLocaleString('es-MX')}</span>
                                        </div>
                                        <div className="flex justify-between font-medium">
                                            <span className="text-zinc-200">Anticipo ({porcentajeAnticipo}%):</span>
                                            <span className="text-blue-400">${montoAPagar.toLocaleString('es-MX')}</span>
                                        </div>

                                        <div className="pt-3 border-t border-zinc-700">
                                            <label className="block text-zinc-300 text-sm mb-2">
                                                Ajustar monto (opcional):
                                            </label>
                                            <input
                                                type="number"
                                                placeholder={`${montoAPagar.toFixed(2)}`}
                                                value={montoPersonalizado || ''}
                                                onChange={(e) => setMontoPersonalizado(e.target.value ? parseFloat(e.target.value) : null)}
                                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:border-blue-500 focus:outline-none"
                                            />
                                            {montoPersonalizado !== null && (
                                                <p className="text-blue-400 text-sm mt-1">
                                                    Monto final: ${montoPersonalizado.toLocaleString('es-MX')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Métodos de pago */}
                            {condicionSeleccionada && (
                                <div>
                                    <h3 className="text-lg font-medium text-zinc-200 mb-4">
                                        🏢 Método de Pago Interno
                                        <span className="text-sm text-zinc-400 ml-2">(Para autorización manual)</span>
                                    </h3>
                                    {(() => {
                                        const condicion = condicionesComerciales.find(c => c.id === condicionSeleccionada)
                                        const todosLosMetodos = condicion?.CondicionesComercialesMetodoPago || []

                                        // Filtrar solo métodos de pago internos para autorización
                                        const metodosInternosDisponibles = todosLosMetodos.filter(metodoPagoRelacion =>
                                            esMetodoInterno(metodoPagoRelacion.MetodoPago.metodo_pago)
                                        )

                                        if (metodosInternosDisponibles.length === 0) {
                                            return (
                                                <div className="text-center py-8 text-zinc-400">
                                                    <p>No hay métodos de pago internos configurados para esta condición comercial.</p>
                                                    <p className="text-sm mt-2 text-amber-400">
                                                        ⚠️ Se requieren métodos internos (Efectivo, Depósito bancario, Transferencia directa) para autorizar.
                                                    </p>
                                                </div>
                                            )
                                        }

                                        return (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {metodosInternosDisponibles.map((metodoPagoRelacion) => {
                                                    const metodo = metodoPagoRelacion.MetodoPago
                                                    const isSelected = metodoPagoSeleccionado === metodo.id
                                                    return (
                                                        <div
                                                            key={metodo.id}
                                                            onClick={() => setMetodoPagoSeleccionado(metodo.id)}
                                                            className={`
                                                                p-4 rounded-lg border cursor-pointer transition-all text-center
                                                                ${isSelected
                                                                    ? 'border-blue-500 bg-blue-500/10'
                                                                    : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/50'
                                                                }
                                                            `}
                                                        >
                                                            <div className="flex flex-col items-center space-y-2">
                                                                <div className={`p-2 rounded-lg ${isSelected ? 'text-blue-400' : 'text-zinc-400'}`}>
                                                                    {obtenerIconoMetodoPago(metodo.metodo_pago)}
                                                                </div>
                                                                <span className={`text-sm font-medium ${isSelected ? 'text-blue-100' : 'text-zinc-300'}`}>
                                                                    {metodo.metodo_pago}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )
                                    })()}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-700">
                    <button
                        onClick={handleClose}
                        disabled={procesando}
                        className="px-4 py-2 text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleAutorizar}
                        disabled={!condicionSeleccionada || !metodoPagoSeleccionado || procesando || loading}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        {procesando && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {procesando ? 'Autorizando...' : 'Autorizar Cotización'}
                    </button>
                </div>
            </div>
        </div>
    )
}
