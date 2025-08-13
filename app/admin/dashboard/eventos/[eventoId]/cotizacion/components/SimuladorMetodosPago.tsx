'use client'

import React, { useState } from 'react'
import { Calculator, CreditCard, DollarSign, Calendar, Percent } from 'lucide-react'

interface MetodoPago {
    id: string
    metodo_pago: string
    comision_porcentaje_base: number
    comision_fija_monto: number
    num_msi: number
    comision_msi_porcentaje: number
    status: string
}

interface Props {
    metodosPago: MetodoPago[]
    montoBase: number
    condicionComercial?: {
        descuento: number
        porcentaje_anticipo: number
    }
}

export default function SimuladorMetodosPago({ metodosPago, montoBase, condicionComercial }: Props) {
    const [mostrarDetalles, setMostrarDetalles] = useState<{ [key: string]: boolean }>({})

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    const calcularSimulacion = (metodo: MetodoPago) => {
        // Aplicar descuento si existe
        let montoConDescuento = montoBase
        if (condicionComercial && condicionComercial.descuento > 0) {
            montoConDescuento = montoBase * (1 - condicionComercial.descuento / 100)
        }

        // Calcular anticipo si existe
        let montoAnticipo = 0
        let montoPendiente = montoConDescuento
        if (condicionComercial && condicionComercial.porcentaje_anticipo > 0) {
            montoAnticipo = montoConDescuento * (condicionComercial.porcentaje_anticipo / 100)
            montoPendiente = montoConDescuento - montoAnticipo
        }

        // Calcular comisiones
        const comisionPorcentaje = metodo.comision_porcentaje_base || 0
        const comisionFija = metodo.comision_fija_monto || 0
        const comisionTotal = (montoConDescuento * comisionPorcentaje / 100) + comisionFija
        const montoFinalTotal = montoConDescuento + comisionTotal

        // Calcular MSI si aplica
        let pagoMensual = 0
        let comisionMSI = 0
        if (metodo.num_msi > 0) {
            const comisionMSIPorcentaje = metodo.comision_msi_porcentaje || 0
            comisionMSI = montoPendiente * comisionMSIPorcentaje / 100
            const montoConMSI = montoPendiente + comisionMSI
            pagoMensual = montoConMSI / metodo.num_msi
        }

        return {
            montoOriginal: montoBase,
            descuento: montoBase - montoConDescuento,
            montoConDescuento,
            montoAnticipo,
            montoPendiente,
            comisionBase: comisionTotal,
            comisionMSI,
            montoFinalTotal,
            pagoMensual,
            ahorroDescuento: montoBase - montoConDescuento,
            totalConMSI: montoAnticipo + montoPendiente + comisionMSI
        }
    }

    const toggleDetalles = (metodoId: string) => {
        setMostrarDetalles(prev => ({
            ...prev,
            [metodoId]: !prev[metodoId]
        }))
    }

    if (metodosPago.length === 0) {
        return (
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Métodos de Pago</h3>
                <p className="text-zinc-400 text-center py-4">
                    No hay métodos de pago configurados
                </p>
            </div>
        )
    }

    return (
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
            <div className="flex items-center gap-2 mb-6">
                <Calculator size={20} className="text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Simulador de Métodos de Pago</h3>
            </div>

            {condicionComercial && (condicionComercial.descuento > 0 || condicionComercial.porcentaje_anticipo > 0) && (
                <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                    <h4 className="text-blue-300 font-medium mb-2">Condiciones Comerciales Aplicadas</h4>
                    <div className="space-y-1 text-sm">
                        {condicionComercial.descuento > 0 && (
                            <div className="flex items-center gap-2 text-green-400">
                                <Percent size={14} />
                                <span>Descuento: {condicionComercial.descuento}%</span>
                                <span className="text-zinc-300">
                                    (Ahorro: {formatCurrency(montoBase * condicionComercial.descuento / 100)})
                                </span>
                            </div>
                        )}
                        {condicionComercial.porcentaje_anticipo > 0 && (
                            <div className="flex items-center gap-2 text-blue-400">
                                <DollarSign size={14} />
                                <span>Anticipo requerido: {condicionComercial.porcentaje_anticipo}%</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {metodosPago.map((metodo) => {
                    const simulacion = calcularSimulacion(metodo)
                    const mostrandoDetalles = mostrarDetalles[metodo.id]

                    return (
                        <div key={metodo.id} className="bg-zinc-800 rounded-lg border border-zinc-700">
                            {/* Header del método de pago */}
                            <button
                                onClick={() => toggleDetalles(metodo.id)}
                                className="w-full p-4 flex items-center justify-between hover:bg-zinc-700 rounded-t-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <CreditCard size={18} className="text-zinc-400" />
                                    <div className="text-left">
                                        <h4 className="text-white font-medium">{metodo.metodo_pago}</h4>
                                        {metodo.num_msi > 0 && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded">
                                                    {metodo.num_msi} MSI
                                                </span>
                                                <span className="text-zinc-400 text-sm">
                                                    {formatCurrency(simulacion.pagoMensual)}/mes
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-white font-semibold">
                                        {metodo.num_msi > 0 ? formatCurrency(simulacion.totalConMSI) : formatCurrency(simulacion.montoFinalTotal)}
                                    </p>
                                    {simulacion.comisionBase > 0 && (
                                        <p className="text-zinc-400 text-sm">
                                            +{formatCurrency(simulacion.comisionBase + simulacion.comisionMSI)} comisiones
                                        </p>
                                    )}
                                </div>
                            </button>

                            {/* Detalles expandidos */}
                            {mostrandoDetalles && (
                                <div className="px-4 pb-4 border-t border-zinc-600">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        {/* Columna izquierda - Montos base */}
                                        <div className="space-y-3">
                                            <h5 className="text-zinc-300 font-medium">Desglose de Montos</h5>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-zinc-400">Monto original:</span>
                                                    <span className="text-white">{formatCurrency(simulacion.montoOriginal)}</span>
                                                </div>

                                                {simulacion.descuento > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-green-400">Descuento:</span>
                                                        <span className="text-green-400">-{formatCurrency(simulacion.descuento)}</span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between border-t border-zinc-600 pt-2">
                                                    <span className="text-zinc-300">Subtotal:</span>
                                                    <span className="text-white">{formatCurrency(simulacion.montoConDescuento)}</span>
                                                </div>

                                                {simulacion.comisionBase > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-orange-400">
                                                            Comisión ({metodo.comision_porcentaje_base}%):
                                                        </span>
                                                        <span className="text-orange-400">+{formatCurrency(simulacion.comisionBase)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Columna derecha - Pagos */}
                                        <div className="space-y-3">
                                            <h5 className="text-zinc-300 font-medium">Esquema de Pago</h5>

                                            <div className="space-y-2 text-sm">
                                                {simulacion.montoAnticipo > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-blue-400">
                                                            Anticipo ({condicionComercial?.porcentaje_anticipo}%):
                                                        </span>
                                                        <span className="text-blue-400">{formatCurrency(simulacion.montoAnticipo)}</span>
                                                    </div>
                                                )}

                                                {metodo.num_msi > 0 ? (
                                                    <>
                                                        <div className="flex justify-between">
                                                            <span className="text-zinc-400">Monto a financiar:</span>
                                                            <span className="text-white">{formatCurrency(simulacion.montoPendiente)}</span>
                                                        </div>

                                                        {simulacion.comisionMSI > 0 && (
                                                            <div className="flex justify-between">
                                                                <span className="text-orange-400">
                                                                    Comisión MSI ({metodo.comision_msi_porcentaje}%):
                                                                </span>
                                                                <span className="text-orange-400">+{formatCurrency(simulacion.comisionMSI)}</span>
                                                            </div>
                                                        )}

                                                        <div className="border-t border-zinc-600 pt-2">
                                                            <div className="flex justify-between">
                                                                <span className="text-zinc-300">Pago mensual:</span>
                                                                <span className="text-white font-medium">{formatCurrency(simulacion.pagoMensual)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-zinc-300">Por {metodo.num_msi} meses</span>
                                                                <span className="text-zinc-400 text-xs">
                                                                    Total: {formatCurrency(simulacion.totalConMSI)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex justify-between border-t border-zinc-600 pt-2">
                                                        <span className="text-zinc-300">Pago único:</span>
                                                        <span className="text-white font-medium">{formatCurrency(simulacion.montoFinalTotal)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Resumen final */}
                                    <div className="mt-4 p-3 bg-zinc-700 rounded border-l-4 border-blue-500">
                                        <div className="flex justify-between items-center">
                                            <span className="text-white font-medium">Total a pagar:</span>
                                            <span className="text-white font-bold text-lg">
                                                {metodo.num_msi > 0 ? formatCurrency(simulacion.totalConMSI) : formatCurrency(simulacion.montoFinalTotal)}
                                            </span>
                                        </div>
                                        {simulacion.ahorroDescuento > 0 && (
                                            <p className="text-green-400 text-sm mt-1">
                                                Ahorro por descuento: {formatCurrency(simulacion.ahorroDescuento)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Nota informativa */}
            <div className="mt-6 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                <p className="text-yellow-300 text-sm">
                    <strong>Nota:</strong> Los cálculos son estimados. Los montos finales pueden variar según las condiciones del procesador de pagos.
                </p>
            </div>
        </div>
    )
}
