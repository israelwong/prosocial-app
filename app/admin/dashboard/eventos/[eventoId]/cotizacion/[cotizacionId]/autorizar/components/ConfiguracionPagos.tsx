'use client'
import React from 'react'
import { ArrowLeft, ArrowRight, Calendar, Clock, Percent, DollarSign } from 'lucide-react'
import type { CalendarioPagos } from '../types'

interface Props {
    configuracion: CalendarioPagos
    onChange: (config: CalendarioPagos) => void
    fechaEvento: Date
    onContinuar: () => void
    onVolver: () => void
}

export default function ConfiguracionPagos({
    configuracion,
    onChange,
    fechaEvento,
    onContinuar,
    onVolver
}: Props) {
    const formatearFecha = (fecha: Date) => {
        return fecha.toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const actualizarFechaAnticipo = (fecha: string) => {
        onChange({
            ...configuracion,
            fechaLimiteAnticipo: new Date(fecha)
        })
    }

    const actualizarFechaRevenue = (fecha: string) => {
        onChange({
            ...configuracion,
            fechaVencimientoRevenue: new Date(fecha)
        })
    }

    const togglePenalizaciones = () => {
        onChange({
            ...configuracion,
            penalizaciones: {
                ...configuracion.penalizaciones,
                activadas: !configuracion.penalizaciones.activadas
            }
        })
    }

    const actualizarPenalizacion = (porcentaje: number) => {
        onChange({
            ...configuracion,
            penalizaciones: {
                ...configuracion.penalizaciones,
                porcentajeDiario: porcentaje
            }
        })
    }

    const toggleDescuentoProntoPago = () => {
        onChange({
            ...configuracion,
            descuentoProntoPago: {
                ...configuracion.descuentoProntoPago,
                activado: !configuracion.descuentoProntoPago.activado
            }
        })
    }

    const actualizarDescuentoPorcentaje = (porcentaje: number) => {
        onChange({
            ...configuracion,
            descuentoProntoPago: {
                ...configuracion.descuentoProntoPago,
                porcentaje
            }
        })
    }

    const actualizarDescuentoDias = (dias: number) => {
        onChange({
            ...configuracion,
            descuentoProntoPago: {
                ...configuracion.descuentoProntoPago,
                diasAnticipacion: dias
            }
        })
    }

    // Calcular días hasta el evento
    const diasHastaEvento = Math.ceil((fechaEvento.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    const fechaMinimaAnticipo = new Date()
    fechaMinimaAnticipo.setDate(fechaMinimaAnticipo.getDate() + 1)

    const fechaMaximaAnticipo = new Date(fechaEvento)
    fechaMaximaAnticipo.setDate(fechaMaximaAnticipo.getDate() - 1)

    return (
        <div className="space-y-6">
            {/* Información del Evento */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">Fecha del Evento</span>
                </div>
                <p className="text-blue-300 text-lg font-bold">{formatearFecha(fechaEvento)}</p>
                <p className="text-blue-400 text-sm">
                    {diasHastaEvento > 0
                        ? `Faltan ${diasHastaEvento} días para el evento`
                        : 'El evento ya pasó o es hoy'
                    }
                </p>
            </div>

            {/* Configuración de Fechas */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    Fechas Límite de Pago
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-zinc-400 text-sm mb-2">
                            Fecha Límite para Pago de Anticipo
                        </label>
                        <input
                            type="date"
                            value={configuracion.fechaLimiteAnticipo.toISOString().split('T')[0]}
                            onChange={(e) => actualizarFechaAnticipo(e.target.value)}
                            min={fechaMinimaAnticipo.toISOString().split('T')[0]}
                            max={fechaMaximaAnticipo.toISOString().split('T')[0]}
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100"
                        />
                        <p className="text-zinc-500 text-sm mt-1">
                            {formatearFecha(configuracion.fechaLimiteAnticipo)}
                        </p>
                    </div>

                    <div>
                        <label className="block text-zinc-400 text-sm mb-2">
                            Fecha de Vencimiento Revenue Share
                        </label>
                        <input
                            type="date"
                            value={configuracion.fechaVencimientoRevenue.toISOString().split('T')[0]}
                            onChange={(e) => actualizarFechaRevenue(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100"
                        />
                        <p className="text-zinc-500 text-sm mt-1">
                            {formatearFecha(configuracion.fechaVencimientoRevenue)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Penalizaciones por Atraso */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                        <Percent className="w-5 h-5 text-red-400" />
                        Penalizaciones por Atraso
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={configuracion.penalizaciones.activadas}
                            onChange={togglePenalizaciones}
                            className="text-red-600"
                        />
                        <span className="text-zinc-300">Activar</span>
                    </label>
                </div>

                {configuracion.penalizaciones.activadas && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-zinc-400 text-sm mb-2">
                                Porcentaje de Penalización Diaria
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="0.1"
                                    max="5"
                                    step="0.1"
                                    value={configuracion.penalizaciones.porcentajeDiario}
                                    onChange={(e) => actualizarPenalizacion(Number(e.target.value))}
                                    className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex items-center gap-2 min-w-[80px]">
                                    <input
                                        type="number"
                                        min="0.1"
                                        max="5"
                                        step="0.1"
                                        value={configuracion.penalizaciones.porcentajeDiario}
                                        onChange={(e) => actualizarPenalizacion(Number(e.target.value))}
                                        className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 text-center"
                                    />
                                    <span className="text-zinc-400">%</span>
                                </div>
                            </div>
                            <p className="text-zinc-500 text-sm mt-1">
                                Se aplicará {configuracion.penalizaciones.porcentajeDiario}% diario por cada día de atraso
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Descuento por Pronto Pago */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        Descuento por Pronto Pago
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={configuracion.descuentoProntoPago.activado}
                            onChange={toggleDescuentoProntoPago}
                            className="text-green-600"
                        />
                        <span className="text-zinc-300">Activar</span>
                    </label>
                </div>

                {configuracion.descuentoProntoPago.activado && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-zinc-400 text-sm mb-2">
                                    Porcentaje de Descuento
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0.5"
                                        max="10"
                                        step="0.5"
                                        value={configuracion.descuentoProntoPago.porcentaje}
                                        onChange={(e) => actualizarDescuentoPorcentaje(Number(e.target.value))}
                                        className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100"
                                    />
                                    <span className="text-zinc-400">%</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-zinc-400 text-sm mb-2">
                                    Días de Anticipación
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="7"
                                        max="90"
                                        value={configuracion.descuentoProntoPago.diasAnticipacion}
                                        onChange={(e) => actualizarDescuentoDias(Number(e.target.value))}
                                        className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100"
                                    />
                                    <span className="text-zinc-400">días</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-zinc-500 text-sm">
                            Descuento del {configuracion.descuentoProntoPago.porcentaje}% si se paga {configuracion.descuentoProntoPago.diasAnticipacion} días antes de la fecha límite
                        </p>
                    </div>
                )}
            </div>

            {/* Resumen de Configuración */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-zinc-100 mb-4">
                    Resumen de Políticas de Pago
                </h3>

                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-zinc-400">Fecha límite anticipo:</span>
                        <span className="text-zinc-100 font-medium">
                            {configuracion.fechaLimiteAnticipo.toLocaleDateString('es-MX')}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-400">Vencimiento revenue share:</span>
                        <span className="text-zinc-100 font-medium">
                            {configuracion.fechaVencimientoRevenue.toLocaleDateString('es-MX')}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-400">Penalizaciones:</span>
                        <span className={`font-medium ${configuracion.penalizaciones.activadas ? 'text-red-400' : 'text-zinc-500'}`}>
                            {configuracion.penalizaciones.activadas
                                ? `${configuracion.penalizaciones.porcentajeDiario}% diario`
                                : 'Desactivadas'
                            }
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-400">Descuento pronto pago:</span>
                        <span className={`font-medium ${configuracion.descuentoProntoPago.activado ? 'text-green-400' : 'text-zinc-500'}`}>
                            {configuracion.descuentoProntoPago.activado
                                ? `${configuracion.descuentoProntoPago.porcentaje}% por ${configuracion.descuentoProntoPago.diasAnticipacion} días anticipados`
                                : 'Desactivado'
                            }
                        </span>
                    </div>
                </div>
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
                    <span>Ver Vista Previa</span>
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    )
}
