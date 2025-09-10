'use client'
import React, { useState } from 'react'
import { Plus, Landmark, Edit, Trash2, Star, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'
import {
    NegocioBanco,
    eliminarCuentaBancaria,
    cambiarEstadoCuentaBancaria,
    establecerCuentaPrincipal
} from '@/app/admin/_lib/actions/negocio/negocioBanco.actions'
import FormularioCuentaBancaria from './FormularioCuentaBancaria'

interface Props {
    cuentasBancarias: NegocioBanco[]
}

export default function CuentaBancariaView({ cuentasBancarias }: Props) {
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [cuentaEditando, setCuentaEditando] = useState<NegocioBanco | null>(null)
    const [cargando, setCargando] = useState<string | null>(null)

    const handleEliminar = async (id: string, banco: string) => {
        const confirmacion = confirm(`¿Estás seguro de eliminar la cuenta bancaria de ${banco}?`)
        if (!confirmacion) return

        setCargando(id)
        try {
            const resultado = await eliminarCuentaBancaria(id)
            if (resultado.success) {
                toast.success(resultado.message)
            } else {
                toast.error(resultado.message)
            }
        } catch (error) {
            toast.error('Error inesperado al eliminar la cuenta')
        } finally {
            setCargando(null)
        }
    }

    const handleCambiarEstado = async (id: string, estadoActual: string) => {
        const nuevoEstado = estadoActual === 'active' ? 'inactive' : 'active'

        setCargando(id)
        try {
            const resultado = await cambiarEstadoCuentaBancaria(id, nuevoEstado)
            if (resultado.success) {
                toast.success(resultado.message)
            } else {
                toast.error(resultado.message)
            }
        } catch (error) {
            toast.error('Error inesperado al cambiar el estado')
        } finally {
            setCargando(null)
        }
    }

    const handleEstablecerPrincipal = async (id: string) => {
        setCargando(id)
        try {
            const resultado = await establecerCuentaPrincipal(id)
            if (resultado.success) {
                toast.success(resultado.message)
            } else {
                toast.error(resultado.message)
            }
        } catch (error) {
            toast.error('Error inesperado al establecer como principal')
        } finally {
            setCargando(null)
        }
    }

    const handleEditar = (cuenta: NegocioBanco) => {
        setCuentaEditando(cuenta)
        setMostrarFormulario(true)
    }

    const handleCerrarFormulario = () => {
        setMostrarFormulario(false)
        setCuentaEditando(null)
    }

    const formatearClabe = (clabe: string) => {
        return clabe.replace(/(.{4})/g, '$1 ').trim()
    }

    return (
        <div className="space-y-6">
            {/* Header con botón agregar */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-zinc-100">
                        Cuentas Bancarias Configuradas
                    </h2>
                    <p className="text-sm text-zinc-400">
                        {cuentasBancarias.length} cuenta(s) registrada(s)
                    </p>
                </div>
                <button
                    onClick={() => setMostrarFormulario(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Agregar Cuenta
                </button>
            </div>

            {/* Lista de cuentas */}
            {cuentasBancarias.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-8 text-center">
                    <Landmark className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-zinc-300 mb-2">
                        No hay cuentas bancarias configuradas
                    </h3>
                    <p className="text-zinc-500 mb-4">
                        Agrega la primera cuenta bancaria para recibir pagos por transferencia
                    </p>
                    <button
                        onClick={() => setMostrarFormulario(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Agregar Primera Cuenta
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {cuentasBancarias.map((cuenta) => (
                        <div
                            key={cuenta.id}
                            className={`bg-zinc-900 border rounded-lg p-6 transition-all ${cuenta.principal
                                ? 'border-yellow-500/50 bg-yellow-900/10'
                                : 'border-zinc-700'
                                } ${cuenta.status === 'inactive' ? 'opacity-60' : ''
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Landmark className="w-5 h-5 text-blue-400" />
                                        <h3 className="text-lg font-semibold text-zinc-100">
                                            {cuenta.banco}
                                        </h3>
                                        {cuenta.principal && (
                                            <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">
                                                <Star className="w-3 h-3" />
                                                Principal
                                            </div>
                                        )}
                                        <div className={`px-2 py-1 rounded-full text-xs ${cuenta.status === 'active'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {cuenta.status === 'active' ? 'Activa' : 'Inactiva'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-zinc-400">Beneficiario:</span>
                                            <p className="text-zinc-200 font-medium">{cuenta.beneficiario}</p>
                                        </div>
                                        <div>
                                            <span className="text-zinc-400">CLABE:</span>
                                            <p className="text-zinc-200 font-mono">{formatearClabe(cuenta.clabe)}</p>
                                        </div>
                                        {cuenta.cuenta && (
                                            <div>
                                                <span className="text-zinc-400">Número de cuenta:</span>
                                                <p className="text-zinc-200 font-mono">{cuenta.cuenta}</p>
                                            </div>
                                        )}
                                        {cuenta.sucursal && (
                                            <div>
                                                <span className="text-zinc-400">Sucursal:</span>
                                                <p className="text-zinc-200">{cuenta.sucursal}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    {/* Establecer como principal */}
                                    {!cuenta.principal && cuenta.status === 'active' && (
                                        <button
                                            onClick={() => handleEstablecerPrincipal(cuenta.id)}
                                            disabled={cargando === cuenta.id}
                                            className="p-2 text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-colors"
                                            title="Establecer como principal"
                                        >
                                            <Star className="w-4 h-4" />
                                        </button>
                                    )}

                                    {/* Toggle estado */}
                                    <button
                                        onClick={() => handleCambiarEstado(cuenta.id, cuenta.status)}
                                        disabled={cargando === cuenta.id}
                                        className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
                                        title={cuenta.status === 'active' ? 'Desactivar' : 'Activar'}
                                    >
                                        {cuenta.status === 'active' ? (
                                            <ToggleRight className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <ToggleLeft className="w-4 h-4" />
                                        )}
                                    </button>

                                    {/* Editar */}
                                    <button
                                        onClick={() => handleEditar(cuenta)}
                                        className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                        title="Editar cuenta"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>

                                    {/* Eliminar */}
                                    <button
                                        onClick={() => handleEliminar(cuenta.id, cuenta.banco)}
                                        disabled={cargando === cuenta.id || cuenta.principal}
                                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={cuenta.principal ? "No se puede eliminar la cuenta principal" : "Eliminar cuenta"}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal del formulario */}
            {mostrarFormulario && (
                <FormularioCuentaBancaria
                    cuenta={cuentaEditando}
                    onClose={handleCerrarFormulario}
                />
            )}
        </div>
    )
}
