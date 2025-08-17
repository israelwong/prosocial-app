'use client'

import { useState, useEffect } from 'react'
import { Plus, CreditCard, DollarSign, Calendar, FileText, Loader2, X } from 'lucide-react'

interface FormularioPagoProps {
    cotizacionId: string
    clienteId: string
    isEditing?: boolean
    pagoExistente?: any
    onSubmit: (datos: any) => Promise<void>
    onCancel: () => void
    isLoading?: boolean
}

export default function FormularioPago({
    cotizacionId,
    clienteId,
    isEditing = false,
    pagoExistente,
    onSubmit,
    onCancel,
    isLoading = false
}: FormularioPagoProps) {
    const [formData, setFormData] = useState({
        monto: pagoExistente?.monto?.toString() || '',
        metodoPago: pagoExistente?.metodo_pago || 'tarjeta de crédito',
        concepto: pagoExistente?.concepto || '',
        descripcion: pagoExistente?.descripcion || '',
        fechaPago: ''
    })

    // Establecer fecha después del montaje para evitar problemas de hidratación
    useEffect(() => {
        const fechaInicial = pagoExistente?.createdAt
            ? new Date(pagoExistente.createdAt).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]

        setFormData(prev => ({ ...prev, fechaPago: fechaInicial }))
    }, [pagoExistente])

    const metodosPago = [
        { value: 'tarjeta de crédito', label: 'Tarjeta', icon: CreditCard },
        { value: 'transferencia interbancaria', label: 'Transferencia', icon: DollarSign },
        { value: 'efectivo', label: 'Efectivo', icon: DollarSign },
        { value: 'cheque', label: 'Cheque', icon: FileText }
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        console.log('📝 Datos del formulario:', formData)
        console.log('🔗 IDs:', { cotizacionId, clienteId })

        if (!formData.monto || isNaN(parseFloat(formData.monto))) {
            alert('Por favor ingresa un monto válido')
            return
        }

        if (!cotizacionId) {
            alert('Error: ID de cotización no proporcionado')
            return
        }

        try {
            await onSubmit({
                ...formData,
                monto: parseFloat(formData.monto),
                cotizacionId,
                clienteId: clienteId || undefined // Enviar como undefined si está vacío
            })
        } catch (error) {
            console.error('❌ Error en formulario:', error)
            alert('Error al procesar el formulario')
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-zinc-800 rounded-lg shadow-lg w-full max-w-md mx-4 border border-zinc-700">
                <div className="flex items-center justify-between p-6 border-b border-zinc-700">
                    <div>
                        <h3 className="text-lg font-semibold text-zinc-100">
                            {isEditing ? 'Editar Pago' : 'Registrar Nuevo Pago'}
                        </h3>
                        <p className="text-sm text-zinc-400 mt-1">
                            {isEditing ? 'Modifica los datos del pago' : 'Ingresa los detalles del nuevo pago'}
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-zinc-400 hover:text-zinc-300 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Monto */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-200 mb-1">
                            Monto *
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.monto}
                                onChange={(e) => setFormData(prev => ({ ...prev, monto: e.target.value }))}
                                className="w-full pl-10 pr-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-zinc-100 placeholder-zinc-400"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    {/* Método de Pago */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-200 mb-1">
                            Método de Pago *
                        </label>
                        <select
                            value={formData.metodoPago}
                            onChange={(e) => setFormData(prev => ({ ...prev, metodoPago: e.target.value }))}
                            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-zinc-100"
                            required
                        >
                            {metodosPago.map(metodo => (
                                <option key={metodo.value} value={metodo.value} className="bg-zinc-700 text-zinc-100">
                                    {metodo.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Fecha */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-200 mb-1">
                            Fecha de Pago
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <input
                                type="date"
                                value={formData.fechaPago}
                                onChange={(e) => setFormData(prev => ({ ...prev, fechaPago: e.target.value }))}
                                className="w-full pl-10 pr-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-zinc-100"
                            />
                        </div>
                    </div>

                    {/* Concepto */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-200 mb-1">
                            Concepto
                        </label>
                        <input
                            type="text"
                            value={formData.concepto}
                            onChange={(e) => setFormData(prev => ({ ...prev, concepto: e.target.value }))}
                            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-zinc-100 placeholder-zinc-400"
                            placeholder="Ej: Anticipo, Pago final, etc."
                        />
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-200 mb-1">
                            Descripción (opcional)
                        </label>
                        <textarea
                            value={formData.descripcion}
                            onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-zinc-100 placeholder-zinc-400"
                            rows={2}
                            placeholder="Detalles adicionales del pago..."
                        />
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 text-zinc-300 border border-zinc-600 rounded-lg hover:bg-zinc-700 transition-colors"
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {isEditing ? 'Actualizando...' : 'Registrando...'}
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    {isEditing ? 'Actualizar Pago' : 'Registrar Pago'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
