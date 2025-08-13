'use client'

import React, { useState } from 'react'
import { Trash2, Plus, Minus, TrendingUp, Eye, EyeOff } from 'lucide-react'
import type { ServicioCongelado } from '@/app/admin/_lib/cotizacion.congelada.actions'

interface Props {
    servicios: ServicioCongelado[]
    onServicioChange: (servicio: ServicioCongelado) => void
    onEliminarServicio: (servicioId: string) => void
    mostrarUtilidades?: boolean
}

export default function WishlistCongelada({
    servicios,
    onServicioChange,
    onEliminarServicio,
    mostrarUtilidades = false
}: Props) {
    const [verUtilidades, setVerUtilidades] = useState(false)

    const handleCantidadChange = (servicio: ServicioCongelado, nuevaCantidad: number) => {
        if (nuevaCantidad < 1) return

        const servicioActualizado = {
            ...servicio,
            cantidad: nuevaCantidad,
            subtotal: servicio.precioUnitario * nuevaCantidad
        }

        onServicioChange(servicioActualizado)
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    // Calcular métricas de utilidad
    const calcularMetricas = () => {
        const subtotal = servicios.reduce((sum, s) => sum + s.subtotal, 0)
        const costoTotal = servicios.reduce((sum, s) => sum + (s.costo * s.cantidad), 0)
        const utilidadTotal = subtotal - costoTotal
        const margenPorcentaje = subtotal > 0 ? (utilidadTotal / subtotal) * 100 : 0

        return {
            subtotal,
            costoTotal,
            utilidadTotal,
            margenPorcentaje
        }
    }

    const metricas = calcularMetricas()

    if (servicios.length === 0) {
        return (
            <div className="text-center py-8 text-zinc-500">
                <p>No hay servicios en la lista</p>
            </div>
        )
    }

    // Agrupar servicios por categoría (si queremos mostrar organizado)
    const serviciosOrdenados = [...servicios].sort((a, b) => a.nombre.localeCompare(b.nombre))

    return (
        <div className="space-y-4">
            {/* Header con toggle de utilidades */}
            {mostrarUtilidades && (
                <div className="flex justify-end">
                    <button
                        onClick={() => setVerUtilidades(!verUtilidades)}
                        className="flex items-center gap-2 px-3 py-1 text-xs bg-zinc-700 text-zinc-300 rounded hover:bg-zinc-600"
                    >
                        {verUtilidades ? <EyeOff size={12} /> : <Eye size={12} />}
                        {verUtilidades ? 'Ocultar' : 'Ver'} utilidades
                    </button>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-700">
                            <th className="text-left py-3 px-2 text-zinc-400 font-medium">Servicio</th>
                            <th className="text-center py-3 px-2 text-zinc-400 font-medium w-24">Precio</th>
                            <th className="text-center py-3 px-2 text-zinc-400 font-medium w-32">Cantidad</th>
                            <th className="text-center py-3 px-2 text-zinc-400 font-medium w-24">Subtotal</th>
                            {verUtilidades && (
                                <>
                                    <th className="text-center py-3 px-2 text-zinc-400 font-medium w-20">Costo</th>
                                    <th className="text-center py-3 px-2 text-zinc-400 font-medium w-20">Utilidad</th>
                                </>
                            )}
                            <th className="text-center py-3 px-2 text-zinc-400 font-medium w-16"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {serviciosOrdenados.map(servicio => {
                            const utilidadServicio = (servicio.precioUnitario - servicio.costo) * servicio.cantidad
                            const margenServicio = servicio.precioUnitario > 0 ?
                                ((servicio.precioUnitario - servicio.costo) / servicio.precioUnitario) * 100 : 0

                            return (
                                <tr key={servicio.servicioId} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                                    <td className="py-3 px-2">
                                        <div>
                                            <p className="text-white font-medium">{servicio.nombre}</p>
                                            <p className="text-zinc-500 text-sm">
                                                Precio congelado: {formatCurrency(servicio.precioUnitario)}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="py-3 px-2 text-center">
                                        <span className="text-zinc-300">
                                            {formatCurrency(servicio.precioUnitario)}
                                        </span>
                                    </td>

                                    <td className="py-3 px-2">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleCantidadChange(servicio, servicio.cantidad - 1)}
                                                disabled={servicio.cantidad <= 1}
                                                className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Minus size={14} />
                                            </button>

                                            <input
                                                type="number"
                                                value={servicio.cantidad}
                                                onChange={(e) => {
                                                    const valor = parseInt(e.target.value) || 1
                                                    handleCantidadChange(servicio, valor)
                                                }}
                                                onFocus={(e) => e.target.select()}
                                                className="w-16 px-2 py-1 text-center bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-blue-500"
                                                min="1"
                                            />

                                            <button
                                                onClick={() => handleCantidadChange(servicio, servicio.cantidad + 1)}
                                                className="p-1 rounded text-zinc-400 hover:text-white"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </td>

                                    <td className="py-3 px-2 text-center">
                                        <span className="text-white font-medium">
                                            {formatCurrency(servicio.subtotal)}
                                        </span>
                                    </td>

                                    {verUtilidades && (
                                        <>
                                            <td className="py-3 px-2 text-center">
                                                <span className="text-orange-400 text-sm">
                                                    {formatCurrency(servicio.costo * servicio.cantidad)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                <div className="text-sm">
                                                    <span className={`${utilidadServicio >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {formatCurrency(utilidadServicio)}
                                                    </span>
                                                    <div className="text-xs text-zinc-500">
                                                        {margenServicio.toFixed(1)}%
                                                    </div>
                                                </div>
                                            </td>
                                        </>
                                    )}

                                    <td className="py-3 px-2 text-center">
                                        <button
                                            onClick={() => onEliminarServicio(servicio.servicioId)}
                                            className="p-1 text-red-400 hover:text-red-300 rounded"
                                            title="Eliminar servicio"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Totales mejorados */}
            <div className="bg-zinc-800 rounded-lg p-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-300">Total de servicios:</span>
                            <span className="text-white font-medium">
                                {servicios.reduce((sum, s) => sum + s.cantidad, 0)} unidades
                            </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-zinc-300">Subtotal:</span>
                            <span className="text-white font-semibold text-lg">
                                {formatCurrency(metricas.subtotal)}
                            </span>
                        </div>
                    </div>

                    {verUtilidades && (
                        <div className="border-l border-zinc-700 pl-4">
                            <div className="flex justify-between items-center">
                                <span className="text-orange-400 text-sm">Costo total:</span>
                                <span className="text-orange-400 font-medium">
                                    {formatCurrency(metricas.costoTotal)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-green-400 text-sm">Utilidad bruta:</span>
                                <span className="text-green-400 font-medium">
                                    {formatCurrency(metricas.utilidadTotal)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-green-400 text-sm">Margen:</span>
                                <span className="text-green-400 font-semibold">
                                    {metricas.margenPorcentaje.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Nota sobre precios congelados */}
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
                <p className="text-blue-300 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    Los precios mostrados están congelados al momento de crear la cotización y no cambiarán aunque se actualice el catálogo.
                </p>
            </div>
        </div>
    )
}
