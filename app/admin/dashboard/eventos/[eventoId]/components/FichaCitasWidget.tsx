'use client'
import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Phone, Video, MapPin, Plus, MessageCircle, AlertCircle, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import type { EventoCompleto } from '@/app/admin/_lib/actions/evento/evento.schemas'
import { CitaConDetalle, CitaFormData, CitaTipo, CitaModalidad, CitaStatus } from '@/types/citas'
import { getCitasByEventoId, createCita, updateCitaStatus, deleteCita } from '@/app/admin/_lib/actions/citas/citas.actions'
import { CitaFormSchema } from '@/app/admin/_lib/schemas/citas.schemas'
import { toast } from 'sonner'

interface Props {
    eventoCompleto: EventoCompleto
}

const CITA_MODALIDAD = {
    PRESENCIAL: { icon: MapPin, label: 'Presencial', color: 'text-green-400' },
    VIRTUAL: { icon: Video, label: 'Virtual', color: 'text-blue-400' },
    TELEFONICA: { icon: Phone, label: 'Telefónica', color: 'text-purple-400' }
} as const

const CITA_TIPO = {
    COMERCIAL: 'Comercial',
    SEGUIMIENTO: 'Seguimiento',
    CIERRE: 'Cierre',
    POST_VENTA: 'Post Venta'
} as const

const CITA_STATUS = {
    PROGRAMADA: { icon: Clock, label: 'Programada', color: 'text-amber-400' },
    CONFIRMADA: { icon: CheckCircle, label: 'Confirmada', color: 'text-blue-400' },
    EN_CURSO: { icon: AlertCircle, label: 'En Curso', color: 'text-orange-400' },
    COMPLETADA: { icon: CheckCircle, label: 'Completada', color: 'text-green-400' },
    CANCELADA: { icon: XCircle, label: 'Cancelada', color: 'text-red-400' },
    NO_ASISTIO: { icon: AlertCircle, label: 'No Asistió', color: 'text-orange-400' }
} as const

export default function FichaCitasWidget({ eventoCompleto }: Props) {
    const [mostrarModal, setMostrarModal] = useState(false)
    const [citas, setCitas] = useState<CitaConDetalle[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [nuevaCita, setNuevaCita] = useState({
        fecha: '',
        hora: '',
        modalidad: CitaModalidad.VIRTUAL,
        tipo: CitaTipo.COMERCIAL,
        titulo: '',
        descripcion: '',
        duracionMinutos: 60
    })

    const cargarCitas = async () => {
        try {
            setLoading(true)
            const citasData = await getCitasByEventoId(eventoCompleto.id)
            setCitas(citasData)
        } catch (error) {
            console.error('Error al cargar citas:', error)
            toast.error('Error al cargar las citas')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargarCitas()
    }, [eventoCompleto.id])

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && mostrarModal) {
                setMostrarModal(false)
            }
        }

        if (mostrarModal) {
            document.addEventListener('keydown', handleEscape)
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
        }
    }, [mostrarModal])

    const handleCrearCita = async () => {
        if (!nuevaCita.fecha || !nuevaCita.hora || !nuevaCita.titulo) {
            toast.error('Completa todos los campos requeridos')
            return
        }

        const fechaHora = new Date(`${nuevaCita.fecha}T${nuevaCita.hora}`)

        const formData: CitaFormData = {
            eventoId: eventoCompleto.id,
            titulo: nuevaCita.titulo,
            descripcion: nuevaCita.descripcion.trim() || undefined,
            fechaHora,
            tipo: nuevaCita.tipo,
            modalidad: nuevaCita.modalidad,
            ubicacion: undefined, // Se maneja externamente
            urlVirtual: undefined // Se genera en el momento y se comparte por WhatsApp
        }

        // Validar con Zod
        const validation = CitaFormSchema.safeParse(formData)
        if (!validation.success) {
            const error = validation.error.issues?.[0]
            if (error) {
                toast.error(error.message)
            } else {
                toast.error('Error de validación')
            }
            return
        }

        try {
            setSubmitting(true)
            const result = await createCita(formData)

            if (result.success) {
                toast.success(result.message)
                setMostrarModal(false)
                setNuevaCita({
                    fecha: '',
                    hora: '',
                    modalidad: CitaModalidad.VIRTUAL,
                    tipo: CitaTipo.COMERCIAL,
                    titulo: '',
                    descripcion: '',
                    duracionMinutos: 60
                })
                await cargarCitas()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.error('Error al crear cita:', error)
            toast.error('Error al crear la cita')
        } finally {
            setSubmitting(false)
        }
    }

    const handleCambiarStatus = async (citaId: string, nuevoStatus: keyof typeof CITA_STATUS) => {
        try {
            const result = await updateCitaStatus(citaId, nuevoStatus, eventoCompleto.id)
            if (result.success) {
                toast.success(result.message)
                await cargarCitas()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.error('Error al actualizar status:', error)
            toast.error('Error al actualizar el status')
        }
    }

    const handleEliminarCita = async (citaId: string) => {
        if (!confirm('¿Estás seguro de eliminar esta cita?')) return

        try {
            const result = await deleteCita(citaId, eventoCompleto.id)
            if (result.success) {
                toast.success(result.message)
                await cargarCitas()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.error('Error al eliminar cita:', error)
            toast.error('Error al eliminar la cita')
        }
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
                    onClick={() => setMostrarModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nueva
                </button>
            </div>

            {/* Lista de Citas Existentes */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-8 text-zinc-500">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50 animate-spin" />
                        <p className="text-sm">Cargando citas...</p>
                    </div>
                ) : citas.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No hay citas programadas</p>
                    </div>
                ) : (
                    citas.map((cita) => {
                        const ModalidadIcon = CITA_MODALIDAD[cita.modalidad]?.icon || Video
                        const StatusIcon = CITA_STATUS[cita.status]?.icon || Clock
                        const statusColor = CITA_STATUS[cita.status]?.color || 'text-amber-400'
                        const modalidadColor = CITA_MODALIDAD[cita.modalidad]?.color || 'text-blue-400'

                        return (
                            <div
                                key={cita.id}
                                className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700/50 hover:border-zinc-600 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                                        <span className="text-sm font-medium text-zinc-200">{cita.asunto}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            <ModalidadIcon className={`w-4 h-4 ${modalidadColor}`} />
                                            <span className={`text-xs ${modalidadColor}`}>
                                                {CITA_MODALIDAD[cita.modalidad]?.label}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleEliminarCita(cita.id)}
                                            className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-zinc-400 mb-2">
                                    <span>{formatearFecha(new Date(cita.fecha))}</span>
                                    <span>{formatearHora(new Date(cita.fecha))}</span>
                                    <span className="text-zinc-500">•</span>
                                    <span className="text-zinc-400">{CITA_TIPO[cita.tipo]}</span>
                                </div>

                                {/* Cambiar Status */}
                                <div className="grid grid-cols-3 gap-1 mb-2 sm:flex sm:flex-wrap">
                                    {Object.entries(CITA_STATUS).map(([status, config]) => (
                                        <button
                                            key={status}
                                            onClick={() => handleCambiarStatus(cita.id, status as keyof typeof CITA_STATUS)}
                                            className={`px-2 py-1 text-xs rounded transition-colors text-center ${cita.status === status
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                                                }`}
                                        >
                                            {config.label}
                                        </button>
                                    ))}
                                </div>                                {cita.descripcion && (
                                    <div className="flex items-start gap-2 mt-2">
                                        <MessageCircle className="w-3 h-3 text-zinc-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-zinc-400 leading-relaxed">{cita.descripcion}</p>
                                    </div>
                                )}

                                {/* Información de modalidad */}
                                <div className="mt-2">
                                    <span className="text-xs text-zinc-500">
                                        {cita.modalidad === 'VIRTUAL' && '📹 Reunión virtual - URL se enviará por WhatsApp'}
                                        {cita.modalidad === 'PRESENCIAL' && '📍 Reunión presencial - Ubicación a coordinar'}
                                        {cita.modalidad === 'TELEFONICA' && '📞 Llamada telefónica'}
                                    </span>
                                </div>
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
                    const necesitaContacto = hoy >= fechaLimite && !citas.some(c => c.status === 'PROGRAMADA' || c.status === 'CONFIRMADA')

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

            {/* Modal para Nueva Cita */}
            {mostrarModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setMostrarModal(false)
                        }
                    }}
                >
                    <div className="bg-zinc-900 rounded-lg border border-zinc-700 w-full max-w-md max-h-[90vh] overflow-y-auto mx-auto">
                        <div className="p-4 sm:p-6 space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-zinc-100">Nueva Cita</h3>
                                <button
                                    onClick={() => setMostrarModal(false)}
                                    className="text-zinc-400 hover:text-zinc-200 text-xl p-1"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Fecha</label>
                                    <input
                                        type="date"
                                        value={nuevaCita.fecha}
                                        onChange={(e) => setNuevaCita(prev => ({ ...prev, fecha: e.target.value }))}
                                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Hora</label>
                                    <input
                                        type="time"
                                        value={nuevaCita.hora}
                                        onChange={(e) => setNuevaCita(prev => ({ ...prev, hora: e.target.value }))}
                                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Tipo</label>
                                    <select
                                        value={nuevaCita.tipo}
                                        onChange={(e) => setNuevaCita(prev => ({ ...prev, tipo: e.target.value as CitaTipo }))}
                                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {Object.entries(CITA_TIPO).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Modalidad</label>
                                    <select
                                        value={nuevaCita.modalidad}
                                        onChange={(e) => setNuevaCita(prev => ({ ...prev, modalidad: e.target.value as CitaModalidad }))}
                                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {Object.entries(CITA_MODALIDAD).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Título</label>
                                <input
                                    type="text"
                                    value={nuevaCita.titulo}
                                    onChange={(e) => setNuevaCita(prev => ({ ...prev, titulo: e.target.value }))}
                                    placeholder="Ej: Presentación de propuesta"
                                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Descripción <span className="text-zinc-500">(opcional)</span></label>
                                <textarea
                                    value={nuevaCita.descripcion}
                                    onChange={(e) => setNuevaCita(prev => ({ ...prev, descripcion: e.target.value }))}
                                    placeholder="Notas adicionales..."
                                    rows={3}
                                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Duración (minutos)</label>
                                <select
                                    value={nuevaCita.duracionMinutos}
                                    onChange={(e) => setNuevaCita(prev => ({ ...prev, duracionMinutos: parseInt(e.target.value) }))}
                                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value={30}>30 minutos</option>
                                    <option value={60}>1 hora</option>
                                    <option value={90}>1.5 horas</option>
                                    <option value={120}>2 horas</option>
                                </select>
                            </div>

                            {/* Nota informativa */}
                            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <div className="text-blue-400 mt-0.5">ℹ️</div>
                                    <div>
                                        <p className="text-xs text-blue-200 leading-relaxed">
                                            <strong>Modalidades:</strong><br />
                                            • <strong>Virtual:</strong> URL se genera en el momento y se comparte por WhatsApp<br />
                                            • <strong>Presencial:</strong> Ubicación se coordina directamente con el cliente<br />
                                            • <strong>Telefónica:</strong> Llamada directa al cliente
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleCrearCita}
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white text-sm rounded-md transition-colors font-medium"
                                >
                                    {submitting ? 'Creando...' : 'Crear Cita'}
                                </button>
                                <button
                                    onClick={() => setMostrarModal(false)}
                                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm rounded-md transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
