'use client'

import { useState } from 'react'
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Textarea } from "@/app/components/ui/textarea"
import { X, Loader2, DollarSign } from "lucide-react"

interface FormularioCostoProps {
    cotizacionId: string
    isEditing?: boolean
    costoExistente?: any
    onSubmit: (datos: any) => Promise<void>
    onCancel: () => void
    isLoading: boolean
}

export default function FormularioCosto({
    cotizacionId,
    isEditing = false,
    costoExistente,
    onSubmit,
    onCancel,
    isLoading
}: FormularioCostoProps) {
    const [datos, setDatos] = useState({
        nombre: costoExistente?.nombre || '',
        descripcion: costoExistente?.descripcion || '',
        costo: costoExistente?.costo || ''
    })

    const [errores, setErrores] = useState<Record<string, string>>({})

    const validarFormulario = () => {
        const nuevosErrores: Record<string, string> = {}

        if (!datos.nombre.trim()) {
            nuevosErrores.nombre = 'El concepto es requerido'
        }

        if (!datos.costo || parseFloat(datos.costo.toString()) <= 0) {
            nuevosErrores.costo = 'El costo debe ser mayor a 0'
        }

        setErrores(nuevosErrores)
        return Object.keys(nuevosErrores).length === 0
    }

    const manejarSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validarFormulario()) {
            return
        }

        const datosSubmit = {
            ...datos,
            cotizacionId,
            costo: parseFloat(datos.costo.toString()),
            ...(isEditing && costoExistente?.id && { id: costoExistente.id })
        }

        await onSubmit(datosSubmit)
    }

    const manejarCambio = (campo: string, valor: string) => {
        setDatos(prev => ({
            ...prev,
            [campo]: valor
        }))

        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errores[campo]) {
            setErrores(prev => ({
                ...prev,
                [campo]: ''
            }))
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-400" />
                        <h2 className="text-lg font-semibold text-zinc-100">
                            {isEditing ? 'Editar Costo' : 'Nuevo Costo de Producción'}
                        </h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="text-zinc-400 hover:text-zinc-200"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Formulario */}
                <form onSubmit={manejarSubmit} className="p-4 space-y-4">
                    {/* Concepto */}
                    <div className="space-y-2">
                        <Label htmlFor="nombre" className="text-zinc-200">
                            Concepto <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            id="nombre"
                            type="text"
                            value={datos.nombre}
                            onChange={(e) => manejarCambio('nombre', e.target.value)}
                            placeholder="Ej: Gasolina para evento, Comida equipo, etc."
                            disabled={isLoading}
                            className={`bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 ${errores.nombre ? 'border-red-500' : ''
                                }`}
                        />
                        {errores.nombre && (
                            <p className="text-sm text-red-400">{errores.nombre}</p>
                        )}
                    </div>

                    {/* Costo */}
                    <div className="space-y-2">
                        <Label htmlFor="costo" className="text-zinc-200">
                            Costo <span className="text-red-400">*</span>
                        </Label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400">
                                $
                            </div>
                            <Input
                                id="costo"
                                type="number"
                                min="0"
                                step="0.01"
                                value={datos.costo}
                                onChange={(e) => manejarCambio('costo', e.target.value)}
                                placeholder="0.00"
                                disabled={isLoading}
                                className={`bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 pl-8 ${errores.costo ? 'border-red-500' : ''
                                    }`}
                            />
                        </div>
                        {errores.costo && (
                            <p className="text-sm text-red-400">{errores.costo}</p>
                        )}
                    </div>

                    {/* Descripción */}
                    <div className="space-y-2">
                        <Label htmlFor="descripcion" className="text-zinc-200">
                            Descripción (Opcional)
                        </Label>
                        <Textarea
                            id="descripcion"
                            value={datos.descripcion}
                            onChange={(e) => manejarCambio('descripcion', e.target.value)}
                            placeholder="Detalles adicionales sobre este costo..."
                            disabled={isLoading}
                            rows={3}
                            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 resize-none"
                        />
                    </div>

                    {/* Botones */}
                    <div className="flex gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {isEditing ? 'Actualizando...' : 'Registrando...'}
                                </>
                            ) : (
                                <>
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    {isEditing ? 'Actualizar' : 'Registrar Costo'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
