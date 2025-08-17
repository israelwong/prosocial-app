'use client'
import React from 'react'

interface Disponibilidad {
    disponible: boolean
    eventosEnFecha: Array<{
        id: string
        eventoId: string
        Evento: {
            nombre: string | null
            EventoTipo: {
                nombre: string
            } | null
        }
    }>
}

interface Evento {
    id: string
    nombre: string | null
    fecha_evento: Date
    status: string
    sede?: string | null
    EventoEtapa?: {
        nombre: string
        posicion: number
    } | null
}

interface Props {
    evento: Evento
    disponibilidad: Disponibilidad
}

export default function EstadoDisponibilidad({ evento, disponibilidad }: Props) {
    const fechaEvento = new Date(evento.fecha_evento)
    const hoy = new Date()
    const diasRestantes = Math.ceil((fechaEvento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

    // Determinar estado de disponibilidad basado en agenda
    const getEstadoDisponibilidad = () => {
        // Si la fecha ya pasó
        if (diasRestantes < 0) {
            return {
                estado: 'pasado',
                mensaje: 'Fecha pasada',
                descripcion: 'La fecha del evento ya pasó.',
                color: 'gray',
                icon: '📅'
            }
        }

        // Si la fecha ya está ocupada por otro evento
        if (!disponibilidad.disponible) {
            const otroEvento = disponibilidad.eventosEnFecha[0]
            return {
                estado: 'ocupado',
                mensaje: 'Fecha ocupada',
                descripcion: `Ya existe "${otroEvento.Evento.nombre || 'Evento sin nombre'}" el ${fechaEvento.toLocaleDateString('es-MX')}.`,
                color: 'red',
                icon: '🚫'
            }
        }

        // Si el evento está contratado (etapa final)
        if (evento.EventoEtapa?.posicion && evento.EventoEtapa.posicion >= 5) {
            return {
                estado: 'contratado',
                mensaje: 'Evento contratado',
                descripcion: 'Tu evento ya está confirmado.',
                color: 'blue',
                icon: '✅'
            }
        }

        // Si es fecha próxima (menos de 7 días)
        if (diasRestantes <= 7) {
            return {
                estado: 'urgente',
                mensaje: 'Fecha próxima',
                descripcion: `¡Solo ${diasRestantes} días! Confirma pronto.`,
                color: 'orange',
                icon: '⚡'
            }
        }

        // Fecha disponible
        return {
            estado: 'disponible',
            mensaje: 'Fecha disponible',
            descripcion: `${diasRestantes} días para confirmar. ${evento.EventoEtapa?.nombre || 'Pendiente'}.`,
            color: 'green',
            icon: '✅'
        }
    }

    const estado = getEstadoDisponibilidad()

    const colorClasses = {
        red: 'bg-red-500/20 border-red-500/40 text-red-300',
        orange: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
        green: 'bg-green-500/20 border-green-500/40 text-green-300',
        gray: 'bg-zinc-500/20 border-zinc-500/40 text-zinc-300',
        blue: 'bg-blue-500/20 border-blue-500/40 text-blue-300'
    }

    return (
        <div className={`p-4 rounded-lg border-2 ${colorClasses[estado.color as keyof typeof colorClasses]} bg-zinc-800/50 backdrop-blur-sm`}>
            <div className="flex items-start space-x-3">
                <div className="text-2xl">{estado.icon}</div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-white text-base">
                            {estado.mensaje}
                        </h3>
                        <span className="text-xs font-medium text-zinc-400">
                            {fechaEvento.toLocaleDateString('es-MX', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </span>
                    </div>

                    <p className="text-sm opacity-90 mb-3 text-zinc-200">
                        {estado.descripcion}
                    </p>

                    {/* Información adicional en mobile-first pero responsive */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-400">
                        {evento.sede && (
                            <div className="flex items-center">
                                <span className="mr-1">📍</span>
                                <span className="truncate">{evento.sede}</span>
                            </div>
                        )}

                        {evento.EventoEtapa && (
                            <div className="flex items-center">
                                <span className="mr-1">�</span>
                                <span className="truncate">Etapa: {evento.EventoEtapa.nombre}</span>
                            </div>
                        )}
                    </div>

                    {/* Mostrar eventos en conflicto si los hay */}
                    {!disponibilidad.disponible && disponibilidad.eventosEnFecha.length > 0 && (
                        <div className="mt-3 p-2 bg-red-900/30 border border-red-500/30 rounded text-xs">
                            <strong className="text-red-300">Conflicto:</strong>
                            <div className="mt-1">
                                {disponibilidad.eventosEnFecha.map((item, index) => (
                                    <div key={index} className="text-red-200">
                                        • {item.Evento.nombre || 'Evento sin nombre'} ({item.Evento.EventoTipo?.nombre || 'Sin tipo'})
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
