'use client'
import React from 'react'
import { Clock, AlertTriangle, Calendar } from 'lucide-react'
import { validarFechaEvento } from '@/app/lib/validaciones-fecha'

interface Props {
    fechaEvento?: string | Date | null
    diasMinimosContratacion?: number | null
    className?: string
}

export default function FechaLimiteBadge({
    fechaEvento,
    diasMinimosContratacion,
    className = ''
}: Props) {
    // Si no hay datos para validar, no mostrar nada
    if (!fechaEvento || !diasMinimosContratacion) {
        return null
    }

    const validacion = validarFechaEvento(fechaEvento, diasMinimosContratacion)

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${validacion.esValida
                ? 'bg-green-900/30 text-green-200 border border-green-700/50'
                : 'bg-amber-900/30 text-amber-200 border border-amber-700/50'
            } ${className}`}>

            {validacion.esValida ? (
                <Clock className="w-4 h-4" />
            ) : (
                <AlertTriangle className="w-4 h-4" />
            )}

            <div className="flex flex-col min-w-0">
                <span className="font-medium text-xs">
                    {validacion.esValida ? 'Tiempo suficiente' : 'Consultar disponibilidad'}
                </span>

                {validacion.fechaLimiteContratacion && (
                    <span className="text-xs opacity-80 truncate">
                        Límite: {validacion.fechaLimiteContratacion.toLocaleDateString('es-MX', {
                            month: 'short',
                            day: 'numeric'
                        })}
                    </span>
                )}
            </div>
        </div>
    )
}
