'use client'
import React from 'react'
import { ArrowLeft, ArrowRight, Landmark, CheckCircle, AlertTriangle } from 'lucide-react'
import type { AutorizacionCuentaBancaria, MetodoPago } from '../types'

interface Props {
    cuentasBancarias: AutorizacionCuentaBancaria[]
    configuracion: MetodoPago
    onChange: (config: MetodoPago) => void
    onContinuar: () => void
    onVolver: () => void
}

export default function SeleccionMetodosPago({
    cuentasBancarias,
    configuracion,
    onChange,
    onContinuar,
    onVolver
}: Props) {
    const cuentaSeleccionada = cuentasBancarias.find(c => c.id === configuracion.cuentaBancariaId)

    const formatearClabe = (clabe: string) => {
        return clabe.replace(/(.{4})/g, '$1 ').trim()
    }

    const actualizarCuenta = (cuentaId: string) => {
        onChange({ ...configuracion, cuentaBancariaId: cuentaId })
    }

    const actualizarTipoTransferencia = (tipo: string) => {
        onChange({ ...configuracion, tipoTransferencia: tipo })
    }

    const toggleComprobante = () => {
        onChange({ ...configuracion, requiereComprobante: !configuracion.requiereComprobante })
    }

    return (
        <div className="space-y-6">
            {/* Selección de Cuenta Bancaria */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-yellow-400" />
                    Seleccionar Cuenta Bancaria
                </h3>

                {cuentasBancarias.length === 0 ? (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-red-400 mb-2">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-medium">No hay cuentas bancarias configuradas</span>
                        </div>
                        <p className="text-red-300 text-sm">
                            Debes configurar al menos una cuenta bancaria antes de autorizar cotizaciones.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {cuentasBancarias.map((cuenta) => (
                            <div
                                key={cuenta.id}
                                onClick={() => actualizarCuenta(cuenta.id)}
                                className={`
                                    border rounded-lg p-4 cursor-pointer transition-all
                                    ${configuracion.cuentaBancariaId === cuenta.id
                                        ? 'border-blue-500 bg-blue-900/20'
                                        : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                                    }
                                `}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-medium text-zinc-100">{cuenta.banco}</h4>
                                            {cuenta.principal && (
                                                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                                                    Principal
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-zinc-300 text-sm mb-1">{cuenta.beneficiario}</p>
                                        <p className="text-zinc-400 text-sm font-mono">
                                            CLABE: {formatearClabe(cuenta.clabe)}
                                        </p>
                                        {cuenta.cuenta && (
                                            <p className="text-zinc-400 text-sm font-mono">
                                                Cuenta: {cuenta.cuenta}
                                            </p>
                                        )}
                                        {cuenta.sucursal && (
                                            <p className="text-zinc-400 text-sm">
                                                Sucursal: {cuenta.sucursal}
                                            </p>
                                        )}
                                    </div>
                                    {configuracion.cuentaBancariaId === cuenta.id && (
                                        <CheckCircle className="w-5 h-5 text-blue-400 mt-1" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Configuración de Transferencia */}
            {cuentaSeleccionada && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-zinc-100 mb-4">
                        Configuración de Transferencia
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-zinc-400 text-sm mb-2">
                                Tipo de Transferencia
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="tipoTransferencia"
                                        value="spei"
                                        checked={configuracion.tipoTransferencia === 'spei'}
                                        onChange={(e) => actualizarTipoTransferencia(e.target.value)}
                                        className="text-blue-600"
                                    />
                                    <div>
                                        <p className="text-zinc-100 font-medium">SPEI (Recomendado)</p>
                                        <p className="text-zinc-400 text-sm">
                                            Transferencias electrónicas inmediatas, disponible 24/7
                                        </p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="tipoTransferencia"
                                        value="tradicional"
                                        checked={configuracion.tipoTransferencia === 'tradicional'}
                                        onChange={(e) => actualizarTipoTransferencia(e.target.value)}
                                        className="text-blue-600"
                                    />
                                    <div>
                                        <p className="text-zinc-100 font-medium">Transferencia Tradicional</p>
                                        <p className="text-zinc-400 text-sm">
                                            Transferencias con horarios bancarios tradicionales
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="border-t border-zinc-700 pt-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={configuracion.requiereComprobante}
                                    onChange={toggleComprobante}
                                    className="text-blue-600"
                                />
                                <div>
                                    <p className="text-zinc-100 font-medium">Requerir Comprobante de Pago</p>
                                    <p className="text-zinc-400 text-sm">
                                        El cliente deberá enviar comprobante para confirmar el pago del anticipo
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* Vista Previa de Datos Bancarios */}
            {cuentaSeleccionada && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-zinc-100 mb-4">
                        Datos que se Compartirán con el Cliente
                    </h3>

                    <div className="bg-zinc-800/50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-zinc-400 text-sm">Banco</p>
                                <p className="text-zinc-100 font-medium">{cuentaSeleccionada.banco}</p>
                            </div>
                            <div>
                                <p className="text-zinc-400 text-sm">Beneficiario</p>
                                <p className="text-zinc-100 font-medium">{cuentaSeleccionada.beneficiario}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-zinc-400 text-sm">CLABE Interbancaria</p>
                                <p className="text-zinc-100 font-mono text-lg font-bold tracking-wider">
                                    {formatearClabe(cuentaSeleccionada.clabe)}
                                </p>
                            </div>
                            {cuentaSeleccionada.cuenta && (
                                <div>
                                    <p className="text-zinc-400 text-sm">Número de Cuenta</p>
                                    <p className="text-zinc-100 font-mono">{cuentaSeleccionada.cuenta}</p>
                                </div>
                            )}
                            {cuentaSeleccionada.sucursal && (
                                <div>
                                    <p className="text-zinc-400 text-sm">Sucursal</p>
                                    <p className="text-zinc-100">{cuentaSeleccionada.sucursal}</p>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-zinc-700 pt-3 mt-3">
                            <div className="flex items-center gap-2 text-blue-400 text-sm">
                                <AlertTriangle className="w-4 h-4" />
                                <span>
                                    Tipo: {configuracion.tipoTransferencia.toUpperCase()} •
                                    Comprobante: {configuracion.requiereComprobante ? 'Requerido' : 'Opcional'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                    disabled={!configuracion.cuentaBancariaId}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg transition-colors"
                >
                    <span>Continuar con Calendario</span>
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    )
}
