'use client'
import React, { useState } from 'react'
import { Calendar, Clock, Phone, Video, MapPin, Plus, MessageCircle, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import type { EventoCompleto } from '@/app/admin/_lib/actions/evento/evento.schemas'

interface Props {
    eventoCompleto: EventoCompleto
}

// Mock data para las citas (más adelante vendrá de la base de datos)
const citasMock = [
    {
        id: '1',
        fecha: new Date('2025-09-10T10:00:00'),
        modalidad: 'virtual',
        tipo: 'comercial',
        status: 'agendada',
        titulo: 'Presentación de paquetes',
        notas: 'Cliente interesado en paquete premium'
    },
    {
        id: '2',
        fecha: new Date('2025-09-08T14:30:00'),
        modalidad: 'presencial',
        tipo: 'seguimiento',
        status: 'completada',
        titulo: 'Revisión de propuesta',
        notas: 'Se ajustó presupuesto según feedback'
    }
]

const CITA_MODALIDAD = {
    virtual: { icon: Video, label: 'Virtual', color: 'text-blue-400' },
    presencial: { icon: MapPin, label: 'Presencial', color: 'text-green-400' },
    telefonica: { icon: Phone, label: 'Telefónica', color: 'text-purple-400' }
} as const

const CITA_STATUS = {
    agendada: { icon: Clock, label: 'Agendada', color: 'text-amber-400' },
    completada: { icon: CheckCircle, label: 'Completada', color: 'text-green-400' },
    cancelada: { icon: XCircle, label: 'Cancelada', color: 'text-red-400' },
    reprogramada: { icon: AlertCircle, label: 'Reprogramada', color: 'text-orange-400' }
} as const

export default function FichaCitasWidget({ eventoCompleto }: Props) {
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [nuevaCita, setNuevaCita] = useState({
        fecha: '',
        hora: '',
        modalidad: 'virtual' as keyof typeof CITA_MODALIDAD,
        tipo: 'comercial',
        titulo: '',
        notas: ''
    })

    const handleCrearCita = () => {
        // TODO: Implementar creación de cita
        console.log('Crear cita:', nuevaCita)
        setMostrarFormulario(false)
        setNuevaCita({
            fecha: '',
            hora: '',
            modalidad: 'virtual',
            tipo: 'comercial',
            titulo: '',
            notas: ''
        })
    }

    const formatearFecha = (fecha: Date) => {
        return fecha.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const formatearHora = (fecha: Date) => {
        return fecha.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-zinc-400" />
                    <h3 className="text-lg font-medium text-zinc-100">Citas Comerciales</h3>
                </div>
                <button
                    onClick={() => setMostrarFormulario(!mostrarFormulario)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nueva
                </button>
            </div>

            {/* Formulario de Nueva Cita */}
            {mostrarFormulario && (
                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700 space-y-3">
                    <h4 className="text-sm font-medium text-zinc-200">Nueva Cita</h4>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Fecha</label>
                            <input
                                type="date"
                                value={nuevaCita.fecha}
                                onChange={(e) => setNuevaCita(prev => ({ ...prev, fecha: e.target.value }))}
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Hora</label>
                            <input
                                type="time"
                                value={nuevaCita.hora}
                                onChange={(e) => setNuevaCita(prev => ({ ...prev, hora: e.target.value }))}
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-zinc-400 mb-1">Modalidad</label>
                        <select
                            value={nuevaCita.modalidad}
                            onChange={(e) => setNuevaCita(prev => ({ ...prev, modalidad: e.target.value as keyof typeof CITA_MODALIDAD }))}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="virtual">Virtual</option>
                            <option value="presencial">Presencial</option>
                            <option value="telefonica">Telefónica</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs text-zinc-400 mb-1">Título</label>
                        <input
                            type="text"
                            value={nuevaCita.titulo}
                            onChange={(e) => setNuevaCita(prev => ({ ...prev, titulo: e.target.value }))}
                            placeholder="Ej: Presentación de propuesta"
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-zinc-400 mb-1">Notas</label>
                        <textarea
                            value={nuevaCita.notas}
                            onChange={(e) => setNuevaCita(prev => ({ ...prev, notas: e.target.value }))}
                            placeholder="Notas adicionales..."
                            rows={2}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={handleCrearCita}
                            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
                        >
                            Crear Cita
                        </button>
                        <button
                            onClick={() => setMostrarFormulario(false)}
                            className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm rounded-md transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Lista de Citas Existentes */}
            <div className="space-y-3">
                {citasMock.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No hay citas programadas</p>
                    </div>
                ) : (
                    citasMock.map((cita) => {
                        const ModalidadIcon = CITA_MODALIDAD[cita.modalidad as keyof typeof CITA_MODALIDAD]?.icon || Video
                        const StatusIcon = CITA_STATUS[cita.status as keyof typeof CITA_STATUS]?.icon || Clock
                        const statusColor = CITA_STATUS[cita.status as keyof typeof CITA_STATUS]?.color || 'text-amber-400'
                        const modalidadColor = CITA_MODALIDAD[cita.modalidad as keyof typeof CITA_MODALIDAD]?.color || 'text-blue-400'

                        return (
                            <div
                                key={cita.id}
                                className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700/50 hover:border-zinc-600 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                                        <span className="text-sm font-medium text-zinc-200">{cita.titulo}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <ModalidadIcon className={`w-4 h-4 ${modalidadColor}`} />
                                        <span className={`text-xs ${modalidadColor}`}>
                                            {CITA_MODALIDAD[cita.modalidad as keyof typeof CITA_MODALIDAD]?.label}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-zinc-400 mb-2">
                                    <span>{formatearFecha(cita.fecha)}</span>
                                    <span>{formatearHora(cita.fecha)}</span>
                                    <span className={`${statusColor} font-medium`}>
                                        {CITA_STATUS[cita.status as keyof typeof CITA_STATUS]?.label}
                                    </span>
                                </div>

                                {cita.notas && (
                                    <div className="flex items-start gap-2 mt-2">
                                        <MessageCircle className="w-3 h-3 text-zinc-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-zinc-400 leading-relaxed">{cita.notas}</p>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            {/* Alerta de Acción Requerida */}
            {eventoCompleto.fecha_evento && (
                (() => {
                    const fechaEvento = new Date(eventoCompleto.fecha_evento)
                    const diasMinimos = (eventoCompleto.Cotizacion?.[0] as any)?.dias_minimos_contratacion || 0
                    const fechaLimite = new Date(fechaEvento)
                    fechaLimite.setDate(fechaLimite.getDate() - diasMinimos - 2) // Buffer de 2 días

                    const hoy = new Date()
                    const necesitaContacto = hoy >= fechaLimite && !citasMock.some(c => c.status === 'agendada')

                    if (necesitaContacto) {
                        return (
                            <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                    <span className="text-sm font-medium text-red-300">Acción Requerida</span>
                                </div>
                                <p className="text-xs text-red-200 leading-relaxed">
                                    El evento está próximo y requiere contacto urgente.
                                    Programa una cita para asegurar la contratación.
                                </p>
                            </div>
                        )
                    }
                    return null
                })()
            )}
        </div>
    )
}
