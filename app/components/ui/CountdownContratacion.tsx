'use client'
import React from 'react'
import { calcularDiasRestantes } from '@/app/lib/validaciones-fecha'

interface CountdownContratacionProps {
    fechaEvento: Date
    diasMinimosContratacion: number
    className?: string
    showIcon?: boolean
    variant?: 'compact' | 'detailed'
}

export default function CountdownContratacion({
    fechaEvento,
    diasMinimosContratacion,
    className = '',
    showIcon = true,
    variant = 'compact'
}: CountdownContratacionProps) {
    const diasRestantes = calcularDiasRestantes(fechaEvento)
    const diasParaContratacion = diasRestantes - diasMinimosContratacion

    // No mostrar nada si hay suficiente tiempo (más de 30 días)
    if (diasParaContratacion > 30) {
        return null
    }

    // Determinar el estado del countdown
    const getEstado = () => {
        if (diasParaContratacion <= 0) {
            return {
                tipo: 'critico',
                mensaje: diasParaContratacion === 0 ? 'Último día' : 'Tiempo agotado',
                icono: '🚨',
                color: 'text-red-400',
                bg: 'bg-red-950/50',
                border: 'border-red-800'
            }
        } else if (diasParaContratacion <= 3) {
            return {
                tipo: 'urgente',
                mensaje: `${diasParaContratacion} día${diasParaContratacion > 1 ? 's' : ''} restante${diasParaContratacion > 1 ? 's' : ''}`,
                icono: '⚠️',
                color: 'text-amber-400',
                bg: 'bg-amber-950/50',
                border: 'border-amber-800'
            }
        } else if (diasParaContratacion <= 7) {
            return {
                tipo: 'atencion',
                mensaje: `${diasParaContratacion} días restantes`,
                icono: '⏰',
                color: 'text-orange-400',
                bg: 'bg-orange-950/50',
                border: 'border-orange-800'
            }
        } else {
            return {
                tipo: 'normal',
                mensaje: `${diasParaContratacion} días restantes`,
                icono: '📅',
                color: 'text-blue-400',
                bg: 'bg-blue-950/50',
                border: 'border-blue-800'
            }
        }
    }

    const estado = getEstado()

    // Variante compacta para cards
    if (variant === 'compact') {
        return (
            <div className={`
                inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
                ${estado.bg} ${estado.border} ${estado.color} border
                ${className}
            `}>
                {showIcon && <span>{estado.icono}</span>}
                <span>{estado.mensaje}</span>
            </div>
        )
    }

    // Variante detallada para secciones
    return (
        <div className={`
            flex items-center gap-3 p-3 rounded-lg
            ${estado.bg} ${estado.border} ${estado.color} border
            ${className}
        `}>
            {showIcon && (
                <div className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                    ${estado.bg} ${estado.border} border
                `}>
                    <span className="text-sm">{estado.icono}</span>
                </div>
            )}
            <div className="flex-1">
                <div className="font-semibold text-sm">
                    {estado.mensaje}
                </div>
                <div className="text-xs opacity-75 mt-0.5">
                    {diasParaContratacion <= 0
                        ? `Requiere ${diasMinimosContratacion} días de anticipación`
                        : `Para contratar este servicio`
                    }
                </div>
            </div>
        </div>
    )
}
