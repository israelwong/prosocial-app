'use client'
import React from 'react'

interface MetodoPago {
    metodoPagoId: string
    metodo_pago: string
    num_msi: number
    orden: number
    comision_porcentaje_base?: number
    comision_fija_monto?: number
    comision_msi_porcentaje?: number
    payment_method?: string
}

interface CondicionComercial {
    id: string
    nombre: string
    descripcion?: string
    descuento?: number
    porcentaje_anticipo?: number
    metodosPago: MetodoPago[]
}

interface Props {
    condicionesComerciales: CondicionComercial[]
    condicionSeleccionada: string
    onCondicionChange: (condicionId: string) => void
    fechaDisponible: boolean
}

export default function CondicionesComerciales({
    condicionesComerciales,
    condicionSeleccionada,
    onCondicionChange,
    fechaDisponible
}: Props) {

    console.log('🏪 CondicionesComerciales render:')
    console.log('- fechaDisponible:', fechaDisponible)
    console.log('- condicionesComerciales.length:', condicionesComerciales.length)
    console.log('- condicionesComerciales:', condicionesComerciales)

    if (!fechaDisponible) {
        console.log('❌ CondicionesComerciales: Fecha no disponible, no renderizando')
        return null
    }

    if (condicionesComerciales.length === 0) {
        return (
            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                <h3 className="font-bold text-white text-lg mb-4">
                    💳 Condiciones de pago
                </h3>
                <div className="text-center py-8">
                    <div className="text-zinc-400 text-sm">
                        Cargando condiciones comerciales...
                    </div>
                </div>
            </div>
        )
    }

    const condicionActiva = condicionesComerciales.find(c => c.id === condicionSeleccionada)

    return (
        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
            <h3 className="font-bold text-white text-lg mb-4">
                💳 Condiciones de pago
            </h3>

            {/* Selector de condiciones comerciales */}
            <div className="space-y-3 mb-6">
                {condicionesComerciales.map((condicion) => (
                    <label key={condicion.id} className="flex items-start space-x-3 cursor-pointer">
                        <input
                            type="radio"
                            name="condicionComercial"
                            value={condicion.id}
                            checked={condicionSeleccionada === condicion.id}
                            onChange={(e) => onCondicionChange(e.target.value)}
                            className="mt-1 text-purple-600 focus:ring-purple-500"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-white">{condicion.nombre}</h4>
                                {condicion.descuento && condicion.descuento > 0 && (
                                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30">
                                        -{condicion.descuento}% desc.
                                    </span>
                                )}
                            </div>
                            {condicion.descripcion && (
                                <p className="text-zinc-400 text-sm mt-1">{condicion.descripcion}</p>
                            )}
                            {condicion.porcentaje_anticipo && (
                                <p className="text-blue-400 text-xs mt-1">
                                    Anticipo: {condicion.porcentaje_anticipo}%
                                </p>
                            )}
                        </div>
                    </label>
                ))}
            </div>

            {/* Métodos de pago disponibles para la condición seleccionada */}
            {condicionActiva && condicionActiva.metodosPago.length > 0 && (
                <div className="border-t border-zinc-600 pt-4">
                    <h4 className="font-medium text-white mb-3">Métodos de pago disponibles:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {condicionActiva.metodosPago.map((metodo) => (
                            <div key={metodo.metodoPagoId} className="bg-zinc-700/50 rounded-lg p-3 border border-zinc-600/50">
                                <div className="flex items-center justify-between">
                                    <span className="text-white text-sm font-medium">
                                        {metodo.metodo_pago}
                                    </span>
                                    {metodo.num_msi > 0 && (
                                        <span className="text-blue-400 text-xs">
                                            {metodo.num_msi} MSI
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
