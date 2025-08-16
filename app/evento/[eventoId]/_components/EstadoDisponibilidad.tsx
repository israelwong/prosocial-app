'use client'
import React from 'react'

interface Evento {
    id: string
    nombre: string
    fecha_evento: Date
    status: string
    sede?: string
}

interface Props {
    evento: Evento
}

export default function EstadoDisponibilidad({ evento }: Props) {
    const fechaEvento = new Date(evento.fecha_evento)
    const hoy = new Date()
    const diasRestantes = Math.ceil((fechaEvento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

    // Determinar estado de disponibilidad
    const getEstadoDisponibilidad = () => {
        if (evento.status === 'contratado') {
            return {
                estado: 'ocupado',
                mensaje: 'Fecha ya ocupada',
                descripcion: 'Esta fecha ya ha sido reservada.',
                color: 'red',
                icon: '🚫'
            }
        }

        if (diasRestantes < 0) {
            return {
                estado: 'pasado',
                mensaje: 'Fecha pasada',
                descripcion: 'La fecha del evento ya pasó.',
                color: 'gray',
                icon: '📅'
            }
        }

        if (diasRestantes <= 7) {
            return {
                estado: 'urgente',
                mensaje: 'Fecha próxima',
                descripcion: `¡Solo ${diasRestantes} días! Confirma pronto.`,
                color: 'orange',
                icon: '⚡'
            }
        }

        return {
            estado: 'disponible',
            mensaje: 'Fecha disponible',
            descripcion: `${diasRestantes} días para confirmar.`,
            color: 'green',
            icon: '✅'
        }
    }

    const estado = getEstadoDisponibilidad()

    const colorClasses = {
        red: 'bg-red-500/20 border-red-500/30 text-red-400',
        orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
        green: 'bg-green-500/20 border-green-500/30 text-green-400',
        gray: 'bg-gray-500/20 border-gray-500/30 text-gray-400'
    }

    return (
        <div className={`p-4 rounded-lg border ${colorClasses[estado.color as keyof typeof colorClasses]}`}>
            <div className="flex items-start space-x-3">
                <div className="text-xl">{estado.icon}</div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-white text-sm">
                            {estado.mensaje}
                        </h3>
                        <span className="text-xs font-medium">
                            {fechaEvento.toLocaleDateString('es-MX', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                    <p className="text-xs opacity-90 mb-2">
                        {estado.descripcion}
                    </p>
                    {evento.sede && (
                        <p className="text-xs opacity-75 flex items-center">
                            <span className="mr-1">📍</span>
                            <span className="truncate">{evento.sede}</span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
