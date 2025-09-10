'use client'
import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, Plus, Trash2, Percent, DollarSign } from 'lucide-react'
import type { ConfiguracionComercial } from '../types'

interface Props {
    configuracion: ConfiguracionComercial
    onChange: (config: ConfiguracionComercial) => void
    onContinuar: () => void
    onVolver: () => void
}

export default function ConfiguracionComercial({
    configuracion,
    onChange,
    onContinuar,
    onVolver
}: Props) {
    const [nuevoDescuento, setNuevoDescuento] = useState({
        concepto: '',
        tipo: 'porcentaje' as 'porcentaje' | 'fijo',
        valor: 0
    })

    const calcularDescuentoTotal = () => {
        return configuracion.descuentos.reduce((total, descuento) => {
            if (descuento.tipo === 'porcentaje') {
                return total + (configuracion.totalOriginal * descuento.valor / 100)
            } else {
                return total + descuento.valor
            }
        }, 0)
    }

    const actualizarCalculos = (nuevaConfig: Partial<ConfiguracionComercial>) => {
        const configActualizada = { ...configuracion, ...nuevaConfig }
        const descuentoTotal = calcularDescuentoTotal()

        configActualizada.totalFinal = Math.max(0, configActualizada.totalOriginal - descuentoTotal)
        configActualizada.anticipoFinal = Math.round(configActualizada.totalFinal * configActualizada.porcentajeAnticipo / 100)

        onChange(configActualizada)
    }

    const actualizarPorcentajeAnticipo = (porcentaje: number) => {
        actualizarCalculos({ porcentajeAnticipo: porcentaje })
    }

    const agregarDescuento = () => {
        if (nuevoDescuento.concepto && nuevoDescuento.valor > 0) {
            const nuevosDescuentos = [...configuracion.descuentos, nuevoDescuento]
            actualizarCalculos({ descuentos: nuevosDescuentos })
            setNuevoDescuento({ concepto: '', tipo: 'porcentaje', valor: 0 })
        }
    }

    const eliminarDescuento = (index: number) => {
        const nuevosDescuentos = configuracion.descuentos.filter((_, i) => i !== index)
        actualizarCalculos({ descuentos: nuevosDescuentos })
    }

    const revenueShareFinal = configuracion.totalFinal - configuracion.anticipoFinal
    const porcentajeRevenue = 100 - configuracion.porcentajeAnticipo

    return (
        <div className="space-y-6">
            {/* Configuración de Anticipo */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-zinc-100 mb-4">
                    Distribución de Pagos
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-zinc-400 text-sm mb-2">
                            Porcentaje de Anticipo
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="10"
                                max="90"
                                value={configuracion.porcentajeAnticipo}
                                onChange={(e) => actualizarPorcentajeAnticipo(Number(e.target.value))}
                                className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex items-center gap-2 min-w-[80px]">
                                <input
                                    type="number"
                                    min="10"
                                    max="90"
                                    value={configuracion.porcentajeAnticipo}
                                    onChange={(e) => actualizarPorcentajeAnticipo(Number(e.target.value))}
                                    className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 text-center"
                                />
                                <span className="text-zinc-400">%</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-center">
                            <p className="text-blue-400 text-sm">Anticipo ({configuracion.porcentajeAnticipo}%)</p>
                            <p className="text-2xl font-bold text-blue-300">
                                ${configuracion.anticipoFinal.toLocaleString('es-MX')}
                            </p>
                        </div>
                        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 text-center">
                            <p className="text-purple-400 text-sm">Revenue Share ({porcentajeRevenue}%)</p>
                            <p className="text-2xl font-bold text-purple-300">
                                ${revenueShareFinal.toLocaleString('es-MX')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Descuentos */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-zinc-100 mb-4">
                    Descuentos Aplicados
                </h3>

                {/* Descuentos existentes */}
                {configuracion.descuentos.length > 0 && (
                    <div className="space-y-2 mb-4">
                        {configuracion.descuentos.map((descuento, index) => (
                            <div key={index} className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-3">
                                <div>
                                    <p className="text-zinc-100 font-medium">{descuento.concepto}</p>
                                    <p className="text-zinc-400 text-sm">
                                        {descuento.tipo === 'porcentaje'
                                            ? `${descuento.valor}% - $${(configuracion.totalOriginal * descuento.valor / 100).toLocaleString('es-MX')}`
                                            : `$${descuento.valor.toLocaleString('es-MX')}`
                                        }
                                    </p>
                                </div>
                                <button
                                    onClick={() => eliminarDescuento(index)}
                                    className="text-red-400 hover:text-red-300 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Agregar nuevo descuento */}
                <div className="border border-zinc-700 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                            type="text"
                            placeholder="Concepto del descuento"
                            value={nuevoDescuento.concepto}
                            onChange={(e) => setNuevoDescuento({ ...nuevoDescuento, concepto: e.target.value })}
                            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 placeholder-zinc-500"
                        />
                        <select
                            value={nuevoDescuento.tipo}
                            onChange={(e) => setNuevoDescuento({ ...nuevoDescuento, tipo: e.target.value as 'porcentaje' | 'fijo' })}
                            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100"
                        >
                            <option value="porcentaje">Porcentaje</option>
                            <option value="fijo">Cantidad fija</option>
                        </select>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min="0"
                                step={nuevoDescuento.tipo === 'porcentaje' ? "0.1" : "1"}
                                placeholder={nuevoDescuento.tipo === 'porcentaje' ? "%" : "$"}
                                value={nuevoDescuento.valor}
                                onChange={(e) => setNuevoDescuento({ ...nuevoDescuento, valor: Number(e.target.value) })}
                                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100"
                            />
                            <button
                                onClick={agregarDescuento}
                                disabled={!nuevoDescuento.concepto || nuevoDescuento.valor <= 0}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resumen Final */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-zinc-100 mb-4">
                    Resumen de Modificaciones
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-zinc-400 text-sm">Total Original</p>
                        <p className="text-xl font-bold text-zinc-300">
                            ${configuracion.totalOriginal.toLocaleString('es-MX')}
                        </p>
                    </div>
                    <div>
                        <p className="text-zinc-400 text-sm">Total Final</p>
                        <p className="text-xl font-bold text-green-400">
                            ${configuracion.totalFinal.toLocaleString('es-MX')}
                        </p>
                    </div>
                </div>

                {calcularDescuentoTotal() > 0 && (
                    <div className="mt-4 pt-4 border-t border-zinc-700">
                        <p className="text-zinc-400 text-sm">Descuento Total</p>
                        <p className="text-lg font-bold text-red-400">
                            -${calcularDescuentoTotal().toLocaleString('es-MX')}
                        </p>
                    </div>
                )}
            </div>

            {/* Observaciones */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-zinc-100 mb-4">
                    Observaciones Adicionales
                </h3>
                <textarea
                    value={configuracion.observaciones}
                    onChange={(e) => onChange({ ...configuracion, observaciones: e.target.value })}
                    placeholder="Notas sobre las modificaciones comerciales..."
                    rows={3}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 placeholder-zinc-500 resize-none"
                />
            </div>

            {/* Botones de navegación */}
            <div className="flex justify-between">
                <button
                    onClick={onVolver}
                    className="flex items-center gap-2 px-6 py-3 text-zinc-400 border border-zinc-600 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                    <ArrowLeft size={16} />
                    <span>Volver</span>
                </button>
                <button
                    onClick={onContinuar}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    <span>Continuar con Métodos de Pago</span>
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    )
}
