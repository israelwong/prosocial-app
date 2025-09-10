'use client'
import React, { useState } from 'react'
import { Calendar, User, DollarSign, ArrowRight, CreditCard } from 'lucide-react'
import type { AutorizacionCotizacionData } from '../types'

interface MetodoPago {
    metodoPagoId: string
    metodo_pago: string
    num_msi: number
    orden: number
    comision_porcentaje_base?: number
    comision_fija_monto?: number
    comision_msi_porcentaje?: number
    payment_method?: string
}

interface CondicionComercial {
    id: string
    nombre: string
    descripcion?: string
    descuento?: number
    porcentaje_anticipo?: number
    metodosPago: MetodoPago[]
}

interface Props {
    cotizacion: AutorizacionCotizacionData
    onContinuar: (configuracion: {
        condicionComercialId: string
        metodoPagoId: string
        montoFinal: number
    }) => void
}

export default function RevisionCotizacion({ cotizacion, onContinuar }: Props) {
    const [condicionSeleccionada, setCondicionSeleccionada] = useState<string>('')
    const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<string>('')
    const [montoPersonalizado, setMontoPersonalizado] = useState<number | null>(null)

    const fechaEvento = new Date(cotizacion.Evento.fecha_evento).toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    // Validar valores numéricos para evitar errores
    const total = cotizacion.total || 0

    // Mock de condiciones comerciales (en producción vendrían de la API)
    const condicionesComerciales: CondicionComercial[] = [
        {
            id: '1',
            nombre: 'Pago Completo',
            descripcion: 'Pago único del 100% del evento',
            descuento: 5,
            metodosPago: [
                {
                    metodoPagoId: 'transferencia',
                    metodo_pago: 'Transferencia Bancaria',
                    num_msi: 0,
                    orden: 1
                },
                {
                    metodoPagoId: 'tarjeta',
                    metodo_pago: 'Tarjeta de Crédito',
                    num_msi: 0,
                    orden: 2,
                    comision_porcentaje_base: 3.6
                }
            ]
        },
        {
            id: '2',
            nombre: 'Anticipo + Revenue Share',
            descripcion: 'Anticipo del 50% + Revenue Share del 50%',
            porcentaje_anticipo: 50,
            metodosPago: [
                {
                    metodoPagoId: 'transferencia',
                    metodo_pago: 'Transferencia Bancaria',
                    num_msi: 0,
                    orden: 1
                },
                {
                    metodoPagoId: 'tarjeta',
                    metodo_pago: 'Tarjeta de Crédito',
                    num_msi: 0,
                    orden: 2,
                    comision_porcentaje_base: 3.6
                }
            ]
        }
    ]

    // Funciones de cálculo (similar al componente CondicionesComerciales)
    const calcularPrecioConDescuento = (monto: number, descuento?: number) => {
        if (!descuento) return monto
        return monto * (1 - descuento / 100)
    }

    const calcularPrecioConComision = (monto: number, metodo: MetodoPago) => {
        let precioFinal = monto

        if (metodo.comision_fija_monto) {
            precioFinal += metodo.comision_fija_monto
        }

        if (metodo.comision_porcentaje_base) {
            const comisionBase = monto * (metodo.comision_porcentaje_base / 100)
            precioFinal += comisionBase
        }

        return precioFinal
    }

    const obtenerInfoPago = (condicion: CondicionComercial) => {
        const precioBase = calcularPrecioConDescuento(total, condicion.descuento)
        const anticipo = condicion.porcentaje_anticipo ? (precioBase * condicion.porcentaje_anticipo / 100) : precioBase
        const aDiferir = precioBase - anticipo

        return {
            precioBase,
            montoOriginal: total,
            ahorro: condicion.descuento ? total - precioBase : 0,
            anticipo,
            aDiferir,
            tieneAnticipo: !!condicion.porcentaje_anticipo && condicion.porcentaje_anticipo > 0
        }
    }

    const condicionActual = condicionesComerciales.find(c => c.id === condicionSeleccionada)
    const metodoPagoActual = condicionActual?.metodosPago.find(m => m.metodoPagoId === metodoPagoSeleccionado)
    const infoPago = condicionActual ? obtenerInfoPago(condicionActual) : null
    const montoConComision = infoPago && metodoPagoActual ?
        calcularPrecioConComision(infoPago.tieneAnticipo ? infoPago.anticipo : infoPago.precioBase, metodoPagoActual) : 0
    const montoFinal = montoPersonalizado !== null ? montoPersonalizado : montoConComision

    const handleContinuar = () => {
        if (!condicionSeleccionada || !metodoPagoSeleccionado) {
            alert('Por favor selecciona una condición comercial y método de pago')
            return
        }

        onContinuar({
            condicionComercialId: condicionSeleccionada,
            metodoPagoId: metodoPagoSeleccionado,
            montoFinal
        })
    }

    return (
        <div className="space-y-6">
            {/* Información del Cliente y Evento */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cliente */}
                    <div>
                        <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-400" />
                            Cliente
                        </h3>
                        <div className="space-y-2">
                            <p className="text-zinc-100 font-medium">{cotizacion.Evento.Cliente.nombre}</p>
                            <p className="text-zinc-400">{cotizacion.Evento.Cliente.email || 'Sin email'}</p>
                        </div>
                    </div>

                    {/* Evento */}
                    <div>
                        <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-green-400" />
                            Evento
                        </h3>
                        <div className="space-y-2">
                            <p className="text-zinc-100 font-medium">{cotizacion.Evento.nombre}</p>
                            <p className="text-zinc-400">{fechaEvento}</p>
                            <p className="text-zinc-400">{cotizacion.Evento.EventoTipo?.nombre || 'No especificado'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Precio de la Cotización */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-yellow-400" />
                    Precio de la Cotización
                </h3>
                <div className="text-center">
                    <p className="text-3xl font-bold text-zinc-100">
                        ${total.toLocaleString('es-MX')}
                    </p>
                    <p className="text-zinc-400 mt-1">Precio total del evento</p>
                </div>
            </div>

            {/* Condiciones Comerciales */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-400" />
                    Condiciones Comerciales
                </h3>

                <div className="space-y-4">
                    {condicionesComerciales.map((condicion) => {
                        const infoPago = obtenerInfoPago(condicion)
                        const isSelected = condicionSeleccionada === condicion.id

                        return (
                            <div key={condicion.id} className={`
                                border rounded-lg p-4 cursor-pointer transition-colors
                                ${isSelected
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/50'
                                }
                            `}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="condicion"
                                            value={condicion.id}
                                            checked={isSelected}
                                            onChange={(e) => {
                                                setCondicionSeleccionada(e.target.value)
                                                setMetodoPagoSeleccionado('')
                                                setMontoPersonalizado(null)
                                            }}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <div>
                                            <h4 className="text-zinc-100 font-medium">{condicion.nombre}</h4>
                                            {condicion.descripcion && (
                                                <p className="text-zinc-400 text-sm">{condicion.descripcion}</p>
                                            )}
                                        </div>
                                    </div>
                                    {condicion.descuento && (
                                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30">
                                            -{condicion.descuento}% desc.
                                        </span>
                                    )}
                                </div>

                                {/* Información de precios */}
                                <div className="space-y-2 mb-3">
                                    {condicion.descuento && condicion.descuento > 0 ? (
                                        <>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-zinc-400">Precio original:</span>
                                                <span className="text-zinc-400 line-through">
                                                    ${infoPago.montoOriginal.toLocaleString('es-MX')}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-white font-medium">Total a pagar:</span>
                                                <span className="text-green-400 font-bold text-lg">
                                                    ${infoPago.precioBase.toLocaleString('es-MX')}
                                                </span>
                                            </div>
                                            <div className="text-center">
                                                <span className="text-green-400 text-sm font-medium">
                                                    Ahorras ${infoPago.ahorro.toLocaleString('es-MX')}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex justify-between items-center">
                                            <span className="text-white font-medium">Total a pagar:</span>
                                            <span className="text-white font-bold text-lg">
                                                ${infoPago.precioBase.toLocaleString('es-MX')}
                                            </span>
                                        </div>
                                    )}

                                    {/* Información de anticipo si aplica */}
                                    {infoPago.tieneAnticipo && (
                                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mt-3">
                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-blue-300">Anticipo ({condicion.porcentaje_anticipo}%):</span>
                                                    <span className="text-blue-400 font-medium">
                                                        ${infoPago.anticipo.toLocaleString('es-MX')}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-blue-300">Revenue Share:</span>
                                                    <span className="text-blue-400 font-medium">
                                                        ${infoPago.aDiferir.toLocaleString('es-MX')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Métodos de pago */}
                                {isSelected && (
                                    <div className="space-y-3 border-t border-zinc-700 pt-4">
                                        <h5 className="text-zinc-200 font-medium">Selecciona método de pago:</h5>
                                        {condicion.metodosPago.map((metodo) => {
                                            const montoAPagar = infoPago.tieneAnticipo ? infoPago.anticipo : infoPago.precioBase
                                            const precioConComision = calcularPrecioConComision(montoAPagar, metodo)
                                            const comisionTotal = precioConComision - montoAPagar
                                            const esMetodoSeleccionado = metodoPagoSeleccionado === metodo.metodoPagoId

                                            return (
                                                <div key={metodo.metodoPagoId} className={`
                                                    flex items-start gap-3 p-3 rounded-lg border transition-colors
                                                    ${esMetodoSeleccionado
                                                        ? 'border-blue-500 bg-blue-500/5'
                                                        : 'border-zinc-600 hover:border-zinc-500'
                                                    }
                                                `}>
                                                    <input
                                                        type="radio"
                                                        name="metodoPago"
                                                        value={metodo.metodoPagoId}
                                                        checked={esMetodoSeleccionado}
                                                        onChange={() => {
                                                            setMetodoPagoSeleccionado(metodo.metodoPagoId)
                                                            setMontoPersonalizado(null)
                                                        }}
                                                        className="mt-1 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-white font-medium">{metodo.metodo_pago}</span>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-zinc-300">
                                                                    {infoPago.tieneAnticipo ? 'Anticipo a pagar:' : 'Total a pagar:'}
                                                                </span>
                                                                <span className="text-white font-medium">
                                                                    ${precioConComision.toLocaleString('es-MX')}
                                                                </span>
                                                            </div>
                                                            {comisionTotal > 0 && (
                                                                <div className="flex justify-between text-xs text-orange-400">
                                                                    <span>Comisión:</span>
                                                                    <span>
                                                                        +${comisionTotal.toLocaleString('es-MX')}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Monto personalizado */}
            {metodoPagoSeleccionado && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-zinc-100 mb-4">
                        Ajustar Monto (Opcional)
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-zinc-300 text-sm mb-2">
                                Monto calculado: ${montoConComision.toLocaleString('es-MX')}
                            </label>
                            <input
                                type="number"
                                placeholder="Ingresa monto personalizado (opcional)"
                                value={montoPersonalizado || ''}
                                onChange={(e) => setMontoPersonalizado(e.target.value ? parseFloat(e.target.value) : null)}
                                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        {montoPersonalizado !== null && (
                            <div className="text-center">
                                <p className="text-zinc-300">Monto final a autorizar:</p>
                                <p className="text-2xl font-bold text-green-400">
                                    ${montoPersonalizado.toLocaleString('es-MX')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Botón para continuar */}
            <div className="flex justify-end">
                <button
                    onClick={handleContinuar}
                    disabled={!condicionSeleccionada || !metodoPagoSeleccionado}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                    <span>Continuar con Autorización</span>
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    )
}
