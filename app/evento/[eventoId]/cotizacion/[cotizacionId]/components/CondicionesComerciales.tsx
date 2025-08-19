'use client'
import React from 'react'

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
    condicionesComerciales: CondicionComercial[]
    condicionSeleccionada: string
    onCondicionChange: (condicionId: string) => void
    fechaDisponible: boolean
    montoTotal: number
    metodoPagoSeleccionado?: string
    onMetodoPagoChange?: (metodoPagoId: string, precioFinal: number) => void
}

export default function CondicionesComerciales({
    condicionesComerciales,
    condicionSeleccionada,
    onCondicionChange,
    fechaDisponible,
    montoTotal,
    metodoPagoSeleccionado,
    onMetodoPagoChange
}: Props) {

    // Función para calcular el precio con descuento
    const calcularPrecioConDescuento = (monto: number, descuento: number = 0) => {
        return monto - (monto * (descuento / 100))
    }

    // Función para calcular el precio con comisión
    const calcularPrecioConComision = (monto: number, metodo: MetodoPago) => {
        let precioFinal = monto

        // Debug: Ver qué comisiones vienen en los datos
        console.log('💳 Método de pago:', {
            nombre: metodo.metodo_pago,
            num_msi: metodo.num_msi,
            comision_porcentaje_base: metodo.comision_porcentaje_base,
            comision_fija_monto: metodo.comision_fija_monto,
            comision_msi_porcentaje: metodo.comision_msi_porcentaje,
            payment_method: metodo.payment_method
        })

        // SPEI: No aplicar comisiones (se absorben)
        if (metodo.payment_method === 'spei' || metodo.metodo_pago?.toLowerCase().includes('spei')) {
            return precioFinal // Sin comisiones para SPEI
        }

        // Aplicar comisión porcentual base (ej: 3.6% para tarjeta de crédito)
        if (metodo.comision_porcentaje_base) {
            precioFinal += monto * (metodo.comision_porcentaje_base / 100)
        }

        // Aplicar comisión fija
        if (metodo.comision_fija_monto) {
            precioFinal += metodo.comision_fija_monto
        }

        // Aplicar comisión adicional por MSI (solo si tiene MSI)
        if (metodo.num_msi > 0 && metodo.comision_msi_porcentaje) {
            precioFinal += monto * (metodo.comision_msi_porcentaje / 100)
        }

        return precioFinal
    }

    // Función para obtener información de pago de una condición
    const obtenerInfoPago = (condicion: CondicionComercial) => {
        const precioBase = calcularPrecioConDescuento(montoTotal, condicion.descuento)
        const anticipo = condicion.porcentaje_anticipo ? (precioBase * condicion.porcentaje_anticipo / 100) : precioBase
        const aDiferir = precioBase - anticipo

        return {
            precioBase,
            montoOriginal: montoTotal,
            ahorro: condicion.descuento ? montoTotal - precioBase : 0,
            anticipo,
            aDiferir,
            tieneAnticipo: !!condicion.porcentaje_anticipo && condicion.porcentaje_anticipo > 0
        }
    }

    if (!fechaDisponible) {
        return null
    }

    if (condicionesComerciales.length === 0) {
        return (
            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                <h3 className="font-bold text-white text-lg mb-4">
                    💳 Condiciones de pago
                </h3>
                <div className="text-center py-8">
                    <div className="text-zinc-400 text-sm">
                        Cargando condiciones comerciales...
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
            <h3 className="font-bold text-white text-lg mb-4">
                💳 Condiciones de pago
            </h3>

            {/* Tarjetas de condiciones comerciales */}
            <div className="grid gap-4">
                {condicionesComerciales.map((condicion) => {
                    const infoPago = obtenerInfoPago(condicion)
                    const esSeleccionada = condicionSeleccionada === condicion.id

                    return (
                        <div
                            key={condicion.id}
                            className={`
                                rounded-lg border p-4 cursor-pointer transition-all duration-200
                                ${esSeleccionada
                                    ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/20'
                                    : 'border-zinc-600 bg-zinc-700/30 hover:border-zinc-500 hover:bg-zinc-700/50'
                                }
                            `}
                            onClick={() => onCondicionChange(condicion.id)}
                        >
                            {/* Header de la tarjeta */}
                            <div className="flex items-center gap-3 mb-3">
                                {/* Radio oculto pero funcional */}
                                <input
                                    type="radio"
                                    name="condicionComercial"
                                    value={condicion.id}
                                    checked={esSeleccionada}
                                    onChange={(e) => onCondicionChange(e.target.value)}
                                    className="sr-only"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-white">
                                            {condicion.nombre}
                                        </h4>
                                        {typeof condicion.descuento === 'number' && condicion.descuento > 0 ? (
                                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30">
                                                -{condicion.descuento}% desc.
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            {/* Información de precios */}
                            <div className="space-y-2 mb-3">
                                {condicion.descuento && condicion.descuento > 0 ? (
                                    <>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-400">Precio original:</span>
                                            <span className="text-zinc-400 line-through">
                                                {infoPago.montoOriginal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-white font-medium">Total a pagar:</span>
                                            <span className="text-green-400 font-bold text-lg">
                                                {infoPago.precioBase.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                            </span>
                                        </div>
                                        <div className="text-center">
                                            <span className="text-green-400 text-sm font-medium">
                                                Ahorras {infoPago.ahorro.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex justify-between items-center">
                                        <span className="text-white font-medium">Total a pagar:</span>
                                        <span className="text-white font-bold text-lg">
                                            {infoPago.precioBase.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
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
                                                    {infoPago.anticipo.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                                </span>
                                            </div>
                                            {/* Solo mostrar "A diferir" si hay monto pendiente */}
                                            {infoPago.aDiferir > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-zinc-300">A diferir:</span>
                                                    <span className="text-zinc-400">
                                                        {infoPago.aDiferir.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Métodos de pago disponibles */}
                            {condicion.metodosPago.length > 0 && esSeleccionada && (
                                <div className="border-t border-zinc-600 pt-3">
                                    <h5 className="text-zinc-300 text-sm font-medium mb-3">Selecciona tu método de pago:</h5>
                                    <div className="space-y-3">
                                        {condicion.metodosPago.map((metodo) => {
                                            // Determinar qué monto se va a cobrar
                                            let montoCobrar = infoPago.precioBase
                                            if (infoPago.tieneAnticipo) {
                                                montoCobrar = infoPago.anticipo // Solo se cobra el anticipo
                                            }

                                            const precioConComision = calcularPrecioConComision(montoCobrar, metodo)
                                            const pagoMensual = metodo.num_msi > 0 ? precioConComision / metodo.num_msi : 0
                                            const comisionTotal = precioConComision - montoCobrar
                                            const esMetodoSeleccionado = metodoPagoSeleccionado === metodo.metodoPagoId

                                            return (
                                                <label
                                                    key={metodo.metodoPagoId}
                                                    className={`
                                                        flex cursor-pointer rounded-lg border p-3 transition-all duration-200
                                                        ${esMetodoSeleccionado
                                                            ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/20'
                                                            : 'border-zinc-600 bg-zinc-800/30 hover:border-zinc-500 hover:bg-zinc-800/50'
                                                        }
                                                    `}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="metodoPago"
                                                        value={metodo.metodoPagoId}
                                                        checked={esMetodoSeleccionado}
                                                        onChange={() => onMetodoPagoChange?.(metodo.metodoPagoId, precioConComision)}
                                                        className="mt-1 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <div className="ml-3 flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-white font-medium">{metodo.metodo_pago}</span>
                                                            {metodo.num_msi > 0 && (
                                                                <span className="text-blue-400 text-sm bg-blue-500/20 px-2 py-1 rounded font-medium">
                                                                    {metodo.num_msi} MSI
                                                                </span>
                                                            )}
                                                        </div>

                                                        {metodo.num_msi > 0 ? (
                                                            <div className="space-y-1">
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-zinc-300">{metodo.num_msi} pagos de:</span>
                                                                    <span className="text-white font-bold">
                                                                        {pagoMensual.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-zinc-300">
                                                                        {infoPago.tieneAnticipo ? 'Total anticipo:' : 'Total a pagar:'}
                                                                    </span>
                                                                    <span className="text-white font-medium">
                                                                        {precioConComision.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                                                    </span>
                                                                </div>
                                                                {/* Solo mostrar comisión si hay incremento por MSI */}
                                                                {comisionTotal > 0 && (
                                                                    <div className="flex justify-between text-xs text-orange-400">
                                                                        <span>Costo financiamiento:</span>
                                                                        <span>
                                                                            +{comisionTotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {infoPago.tieneAnticipo && (
                                                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2 mt-2">
                                                                        <div className="text-xs text-blue-300">
                                                                            Se cobrará el anticipo en {metodo.num_msi} pagos mensuales
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-1">
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-zinc-300">
                                                                        {infoPago.tieneAnticipo ? 'Anticipo a pagar:' : 'Total a pagar:'}
                                                                    </span>
                                                                    <span className="text-white font-bold">
                                                                        {precioConComision.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                                                    </span>
                                                                </div>
                                                                {/* Mostrar información específica según el tipo de pago */}
                                                                {(() => {
                                                                    const esSPEI = metodo.payment_method === 'spei' || metodo.metodo_pago?.toLowerCase().includes('spei')

                                                                    if (esSPEI) {
                                                                        return (
                                                                            <div className="text-xs text-green-400">
                                                                                Sin comisiones • Transferencia bancaria
                                                                            </div>
                                                                        )
                                                                    } else if (comisionTotal > 0) {
                                                                        return (
                                                                            <div className="flex justify-between text-xs text-orange-400">
                                                                                <span>Comisión procesamiento:</span>
                                                                                <span>
                                                                                    +{comisionTotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                                                                </span>
                                                                            </div>
                                                                        )
                                                                    } else {
                                                                        return (
                                                                            <div className="text-xs text-green-400">
                                                                                Sin comisiones adicionales
                                                                            </div>
                                                                        )
                                                                    }
                                                                })()}
                                                                {infoPago.tieneAnticipo && (
                                                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2 mt-2">
                                                                        <div className="text-xs text-blue-300">
                                                                            Pago único del anticipo. Saldo restante se liquidará posteriormente.
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Información adicional */}
                            {condicion.descripcion && (
                                <div className="mt-3 pt-3 border-t border-zinc-600">
                                    <p className="text-zinc-400 text-xs">
                                        {condicion.descripcion}
                                    </p>
                                </div>
                            )}

                            {condicion.porcentaje_anticipo && (
                                <div className="mt-2">
                                    <span className="text-blue-400 text-xs bg-blue-500/20 px-2 py-1 rounded">
                                        Anticipo: {condicion.porcentaje_anticipo}%
                                    </span>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
