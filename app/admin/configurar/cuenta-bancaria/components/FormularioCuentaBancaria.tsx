'use client'
import React, { useState, useEffect } from 'react'
import { X, Landmark, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import {
    NegocioBanco,
    CrearCuentaBancariaData,
    crearCuentaBancaria,
    actualizarCuentaBancaria
} from '@/app/admin/_lib/actions/negocio/negocioBanco.actions'

interface Props {
    cuenta?: NegocioBanco | null
    onClose: () => void
}

export default function FormularioCuentaBancaria({ cuenta, onClose }: Props) {
    const [formData, setFormData] = useState<CrearCuentaBancariaData>({
        banco: '',
        beneficiario: '',
        clabe: '',
        cuenta: '',
        sucursal: '',
        principal: false
    })
    const [errores, setErrores] = useState<Record<string, string>>({})
    const [guardando, setGuardando] = useState(false)

    // Llenar formulario si estamos editando
    useEffect(() => {
        if (cuenta) {
            setFormData({
                banco: cuenta.banco,
                beneficiario: cuenta.beneficiario,
                clabe: cuenta.clabe,
                cuenta: cuenta.cuenta || '',
                sucursal: cuenta.sucursal || '',
                principal: cuenta.principal
            })
        }
    }, [cuenta])

    const validarClabe = (clabe: string): boolean => {
        // Remover espacios y validar que tenga exactamente 18 dígitos
        const clabeNumeros = clabe.replace(/\s/g, '')
        return /^\d{18}$/.test(clabeNumeros)
    }

    const formatearClabe = (value: string): string => {
        // Remover todo lo que no sean números
        const numeros = value.replace(/\D/g, '')
        // Limitar a 18 dígitos
        const limitado = numeros.slice(0, 18)
        // Formatear con espacios cada 4 dígitos
        return limitado.replace(/(.{4})/g, '$1 ').trim()
    }

    const validarFormulario = (): boolean => {
        const nuevosErrores: Record<string, string> = {}

        if (!formData.banco.trim()) {
            nuevosErrores.banco = 'El nombre del banco es requerido'
        }

        if (!formData.beneficiario.trim()) {
            nuevosErrores.beneficiario = 'El beneficiario es requerido'
        }

        if (!formData.clabe.trim()) {
            nuevosErrores.clabe = 'La CLABE es requerida'
        } else if (!validarClabe(formData.clabe)) {
            nuevosErrores.clabe = 'La CLABE debe tener exactamente 18 dígitos'
        }

        setErrores(nuevosErrores)
        return Object.keys(nuevosErrores).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validarFormulario()) return

        setGuardando(true)
        try {
            // Limpiar CLABE de espacios antes de enviar
            const datosLimpios = {
                ...formData,
                clabe: formData.clabe.replace(/\s/g, ''),
                cuenta: formData.cuenta?.trim() || undefined,
                sucursal: formData.sucursal?.trim() || undefined
            }

            let resultado

            if (cuenta) {
                // Actualizar cuenta existente
                resultado = await actualizarCuentaBancaria({
                    id: cuenta.id,
                    ...datosLimpios
                })
            } else {
                // Crear nueva cuenta
                resultado = await crearCuentaBancaria(datosLimpios)
            }

            if (resultado.success) {
                toast.success(resultado.message)
                onClose()
            } else {
                toast.error(resultado.message)
            }
        } catch (error) {
            toast.error('Error inesperado al guardar la cuenta bancaria')
        } finally {
            setGuardando(false)
        }
    }

    const handleChange = (field: keyof CrearCuentaBancariaData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))

        // Limpiar error del campo al escribir
        if (errores[field]) {
            setErrores(prev => ({
                ...prev,
                [field]: ''
            }))
        }
    }

    const handleClabeChange = (value: string) => {
        const clabeFormateada = formatearClabe(value)
        handleChange('clabe', clabeFormateada)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-700">
                    <div className="flex items-center gap-3">
                        <Landmark className="w-5 h-5 text-blue-400" />
                        <h2 className="text-lg font-semibold text-zinc-100">
                            {cuenta ? 'Editar Cuenta Bancaria' : 'Nueva Cuenta Bancaria'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Banco */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                            Nombre del Banco *
                        </label>
                        <input
                            type="text"
                            value={formData.banco}
                            onChange={(e) => handleChange('banco', e.target.value)}
                            className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errores.banco ? 'border-red-500' : 'border-zinc-600'
                                }`}
                            placeholder="Ej: BBVA, Santander, Banorte..."
                        />
                        {errores.banco && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {errores.banco}
                            </p>
                        )}
                    </div>

                    {/* Beneficiario */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                            Beneficiario *
                        </label>
                        <input
                            type="text"
                            value={formData.beneficiario}
                            onChange={(e) => handleChange('beneficiario', e.target.value)}
                            className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errores.beneficiario ? 'border-red-500' : 'border-zinc-600'
                                }`}
                            placeholder="Nombre completo del titular de la cuenta"
                        />
                        {errores.beneficiario && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {errores.beneficiario}
                            </p>
                        )}
                    </div>

                    {/* CLABE */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                            CLABE Interbancaria *
                        </label>
                        <input
                            type="text"
                            value={formData.clabe}
                            onChange={(e) => handleClabeChange(e.target.value)}
                            className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${errores.clabe ? 'border-red-500' : 'border-zinc-600'
                                }`}
                            placeholder="0000 0000 0000 0000 00"
                            maxLength={21} // 18 dígitos + 3 espacios
                        />
                        {errores.clabe && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {errores.clabe}
                            </p>
                        )}
                        <p className="text-zinc-500 text-xs mt-1">
                            Número de 18 dígitos para transferencias interbancarias
                        </p>
                    </div>

                    {/* Número de cuenta (opcional) */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                            Número de Cuenta (Opcional)
                        </label>
                        <input
                            type="text"
                            value={formData.cuenta}
                            onChange={(e) => handleChange('cuenta', e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                            placeholder="Número de cuenta tradicional"
                        />
                    </div>

                    {/* Sucursal (opcional) */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                            Sucursal (Opcional)
                        </label>
                        <input
                            type="text"
                            value={formData.sucursal}
                            onChange={(e) => handleChange('sucursal', e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nombre o número de sucursal"
                        />
                    </div>

                    {/* Cuenta principal */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="principal"
                            checked={formData.principal}
                            onChange={(e) => handleChange('principal', e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="principal" className="text-sm text-zinc-300">
                            Establecer como cuenta principal
                        </label>
                    </div>

                    {formData.principal && (
                        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                            <p className="text-yellow-400 text-xs flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3" />
                                Esta cuenta se mostrará como opción predeterminada para pagos
                            </p>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-zinc-300 border border-zinc-600 rounded-lg hover:bg-zinc-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={guardando}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {guardando ? 'Guardando...' : (cuenta ? 'Actualizar' : 'Crear')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
