'use client'
import React from 'react'
import { ArrowLeft, CheckCircle, Calendar, User, DollarSign, Landmark, Clock, AlertTriangle } from 'lucide-react'
import type {
    AutorizacionCotizacionData,
    AutorizacionCuentaBancaria,
    ConfiguracionComercial,
    MetodoPago,
    CalendarioPagos
} from '../types'

interface Props {
    cotizacion: AutorizacionCotizacionData
    configuracionComercial: ConfiguracionComercial
    metodoPago: MetodoPago
    calendarioPagos: CalendarioPagos
    cuentasBancarias: AutorizacionCuentaBancaria[]
    onAutorizar: () => Promise<void>
    onVolver: () => void
    procesando: boolean
}

export default function VistaPrevia({
    cotizacion,
    configuracionComercial,
    metodoPago,
    calendarioPagos,
    cuentasBancarias,
    onAutorizar,
    onVolver,
    procesando
}: Props) {
    const cuentaSeleccionada = cuentasBancarias.find(c => c.id === metodoPago.cuentaBancariaId)

    const formatearFecha = (fecha: Date) => {
        return fecha.toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatearClabe = (clabe: string) => {
        return clabe.replace(/(.{4})/g, '$1 ').trim()
    }

    const revenueShareFinal = configuracionComercial.totalFinal - configuracionComercial.anticipoFinal
    const porcentajeRevenue = 100 - configuracionComercial.porcentajeAnticipo

    const hayModificaciones = (
        configuracionComercial.totalFinal !== configuracionComercial.totalOriginal ||
        configuracionComercial.anticipoFinal !== configuracionComercial.anticipoOriginal ||
        configuracionComercial.descuentos.length > 0
    )

    return (
        <div className="space-y-6">
            {/* Resumen Ejecutivo */}
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-300 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Resumen de Autorización
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <p className="text-green-400 text-sm">Total Final</p>
                        <p className="text-2xl font-bold text-green-300">
                            ${configuracionComercial.totalFinal.toLocaleString('es-MX')}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-blue-400 text-sm">Anticipo ({configuracionComercial.porcentajeAnticipo}%)</p>
                        <p className="text-2xl font-bold text-blue-300">
                            ${configuracionComercial.anticipoFinal.toLocaleString('es-MX')}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-purple-400 text-sm">Revenue Share ({porcentajeRevenue}%)</p>
                        <p className="text-2xl font-bold text-purple-300">
                            ${revenueShareFinal.toLocaleString('es-MX')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información del Evento */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        Información del Evento
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-zinc-400">Evento:</span>
                            <span className="text-zinc-100 font-medium">{cotizacion.Evento.nombre}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-400">Tipo:</span>
                            <span className="text-zinc-100 font-medium">
                                {cotizacion.Evento.EventoTipo?.nombre || 'No especificado'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-400">Fecha:</span>
                            <span className="text-zinc-100 font-medium">
                                {formatearFecha(new Date(cotizacion.Evento.fecha_evento))}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-400">Cliente:</span>
                            <span className="text-zinc-100 font-medium">{cotizacion.Evento.Cliente.nombre}</span>
                        </div>
                    </div>
                </div>

                {/* Modificaciones Comerciales */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-yellow-400" />
                        Condiciones Comerciales
                    </h3>
                    {hayModificaciones ? (
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Total original:</span>
                                <span className="text-zinc-400 line-through">
                                    ${configuracionComercial.totalOriginal.toLocaleString('es-MX')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Total final:</span>
                                <span className="text-green-400 font-medium">
                                    ${configuracionComercial.totalFinal.toLocaleString('es-MX')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Distribución:</span>
                                <span className="text-zinc-100 font-medium">
                                    {configuracionComercial.porcentajeAnticipo}% / {porcentajeRevenue}%
                                </span>
                            </div>
                            {configuracionComercial.descuentos.length > 0 && (
                                <div className="border-t border-zinc-700 pt-2 mt-2">
                                    <p className="text-zinc-400 text-xs mb-1">Descuentos aplicados:</p>
                                    {configuracionComercial.descuentos.map((desc, index) => (
                                        <div key={index} className="text-xs text-zinc-500">
                                            • {desc.concepto}: {desc.tipo === 'porcentaje' ? `${desc.valor}%` : `$${desc.valor.toLocaleString('es-MX')}`}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-sm text-zinc-400">
                            Sin modificaciones a las condiciones originales
                        </div>
                    )}
                </div>
            </div>

            {/* Datos Bancarios */}
            {cuentaSeleccionada && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                        <Landmark className="w-5 h-5 text-yellow-400" />
                        Datos para Transferencia del Anticipo
                    </h3>

                    <div className="bg-zinc-800/50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-zinc-400">Banco:</p>
                                <p className="text-zinc-100 font-medium">{cuentaSeleccionada.banco}</p>
                            </div>
                            <div>
                                <p className="text-zinc-400">Beneficiario:</p>
                                <p className="text-zinc-100 font-medium">{cuentaSeleccionada.beneficiario}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-zinc-400">CLABE Interbancaria:</p>
                                <p className="text-zinc-100 font-mono text-lg font-bold tracking-wider">
                                    {formatearClabe(cuentaSeleccionada.clabe)}
                                </p>
                            </div>
                            {cuentaSeleccionada.cuenta && (
                                <div>
                                    <p className="text-zinc-400">Número de Cuenta:</p>
                                    <p className="text-zinc-100 font-mono">{cuentaSeleccionada.cuenta}</p>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-zinc-700 pt-3 mt-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-400">Tipo de transferencia:</span>
                                <span className="text-zinc-100 font-medium uppercase">
                                    {metodoPago.tipoTransferencia}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-zinc-400">Comprobante requerido:</span>
                                <span className="text-zinc-100 font-medium">
                                    {metodoPago.requiereComprobante ? 'Sí' : 'No'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Calendario de Pagos */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    Calendario y Políticas de Pago
                </h3>

                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-zinc-400">Fecha límite anticipo:</span>
                        <span className="text-zinc-100 font-medium">
                            {formatearFecha(calendarioPagos.fechaLimiteAnticipo)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-400">Vencimiento revenue share:</span>
                        <span className="text-zinc-100 font-medium">
                            {formatearFecha(calendarioPagos.fechaVencimientoRevenue)}
                        </span>
                    </div>

                    {calendarioPagos.penalizaciones.activadas && (
                        <div className="flex justify-between">
                            <span className="text-zinc-400">Penalización por atraso:</span>
                            <span className="text-red-400 font-medium">
                                {calendarioPagos.penalizaciones.porcentajeDiario}% diario
                            </span>
                        </div>
                    )}

                    {calendarioPagos.descuentoProntoPago.activado && (
                        <div className="flex justify-between">
                            <span className="text-zinc-400">Descuento pronto pago:</span>
                            <span className="text-green-400 font-medium">
                                {calendarioPagos.descuentoProntoPago.porcentaje}% por {calendarioPagos.descuentoProntoPago.diasAnticipacion} días
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Observaciones */}
            {configuracionComercial.observaciones && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-zinc-100 mb-4">
                        Observaciones
                    </h3>
                    <p className="text-zinc-300 text-sm whitespace-pre-wrap">
                        {configuracionComercial.observaciones}
                    </p>
                </div>
            )}

            {/* Advertencia Final */}
            <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">Confirmación de Autorización</span>
                </div>
                <p className="text-amber-300 text-sm">
                    Al autorizar esta cotización, se aplicarán todas las configuraciones mostradas arriba.
                    La cotización será marcada como aprobada y se moverá al pipeline de seguimiento.
                    Los datos bancarios serán compartidos con el cliente para el pago del anticipo.
                </p>
            </div>

            {/* Botones finales */}
            <div className="flex justify-between">
                <button
                    onClick={onVolver}
                    disabled={procesando}
                    className="flex items-center gap-2 px-6 py-3 text-zinc-400 border border-zinc-600 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                    <ArrowLeft size={16} />
                    <span>Volver</span>
                </button>
                <button
                    onClick={onAutorizar}
                    disabled={procesando}
                    className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                    {procesando ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Autorizando...</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle size={16} />
                            <span>Autorizar Cotización</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
