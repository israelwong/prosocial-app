'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { Agenda, AgendaTipo } from '@/app/admin/_lib/types'
import { obtenerAgendaDeEvento, eliminarAgendaEvento, actualzarStatusAgendaActividad, crearAgendaEvento, actualizarAgendaEvento } from '@/app/admin/_lib/agenda.actions'
import { obtenerAgendaTipos } from '@/app/admin/_lib/actions/agendaTipos/agendaTipos.actions'
import { Edit, Trash, Calendar, Clock, MessageCircle, MapPin, Link, Plus, MoreVertical, CheckCircle, XCircle, X, Clock4, RotateCcw, AlertCircle } from 'lucide-react'
import Cookies from 'js-cookie'
import { AGENDA_STATUS } from '@/app/admin/_lib/constants/status'

interface Props {
    eventoId: string
}

export default function FichaAgenda({ eventoId }: Props) {
    const [agenda, setAgenda] = useState<Agenda[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalAgendaNuevoOpen, setIsModalAgendaNuevoOpen] = useState(false)
    const [isModalAgendaEditarOpen, setIsModalAgendaEditarOpen] = useState(false)
    const [agendaTipos, setAgendaTipos] = useState<AgendaTipo[]>()
    const [userId, setUserId] = useState<string | null>(null)
    const [agendaId, setAgendaId] = useState<string | null>(null)
    const [menuAbierto, setMenuAbierto] = useState<string | null>(null)

    // Estados del formulario
    const [formData, setFormData] = useState({
        concepto: '',
        descripcion: '',
        fecha: '',
        hora: '',
        direccion: '',
        googleMapsUrl: '',
        agendaTipo: ''
    })
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        // Obtener id del usuario de la sesión actual
        const user = Cookies.get('user')
        const userId = user ? JSON.parse(user).id : null
        setUserId(userId)
    }, [])

    const fetchAgendaTipos = useMemo(() => {
        return async () => {
            obtenerAgendaTipos().then((data) => {
                if (data) {
                    setAgendaTipos(data)
                }
            })
        }
    }, [])

    const fetchAgenda = useMemo(() => {
        return async () => {
            obtenerAgendaDeEvento(eventoId).then((data) => {
                if (data) {
                    setAgenda(data)
                }
                setLoading(false)
            })
        }
    }, [eventoId])

    useEffect(() => {
        fetchAgenda()
        fetchAgendaTipos()
    }, [fetchAgenda, fetchAgendaTipos])

    // Cerrar menús al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element
            if (!target.closest('.menu-container')) {
                setMenuAbierto(null)
            }
        }

        if (menuAbierto) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [menuAbierto])

    const handleDeleteAgenda = async (agendaId: string) => {
        if (confirm('¿Estás seguro de eliminar este agendamiento?')) {
            await eliminarAgendaEvento(agendaId)
            fetchAgenda()
            setMenuAbierto(null)
        }
    }

    const handleStatusAgendaActividad = async (agendaId: string, status: string) => {
        await actualzarStatusAgendaActividad(agendaId, status)
        fetchAgenda()
        setMenuAbierto(null)
    }

    const handleSubmitAgenda = () => {
        setIsModalAgendaNuevoOpen(false)
        setIsModalAgendaEditarOpen(false)
        fetchAgenda()
        limpiarFormulario()
    }

    const limpiarFormulario = () => {
        setFormData({
            concepto: '',
            descripcion: '',
            fecha: '',
            hora: '',
            direccion: '',
            googleMapsUrl: '',
            agendaTipo: ''
        })
        setAgendaId(null)
    }

    const handleNuevoAgendamiento = () => {
        limpiarFormulario()
        setIsModalAgendaNuevoOpen(true)
    }

    const handleEditarAgendamiento = async (id: string) => {
        // Buscar el agendamiento en la lista actual
        const agendamiento = agenda.find(a => a.id === id)
        if (agendamiento) {
            // Buscar el tipo de agenda que coincida (case-insensitive)
            const tipoCorrespondiente = agendaTipos?.find(tipo =>
                tipo.nombre.toLowerCase() === (agendamiento.agendaTipo || '').toLowerCase()
            )

            setFormData({
                concepto: agendamiento.concepto || '',
                descripcion: agendamiento.descripcion || '',
                fecha: agendamiento.fecha ? new Date(agendamiento.fecha).toISOString().split('T')[0] : '',
                hora: agendamiento.hora || '',
                direccion: agendamiento.direccion || '',
                googleMapsUrl: agendamiento.googleMapsUrl || '',
                agendaTipo: tipoCorrespondiente?.nombre || agendamiento.agendaTipo || ''
            })
            setAgendaId(id)
            setIsModalAgendaEditarOpen(true)
        }
        setMenuAbierto(null)
    }

    const handleGuardarAgendamiento = async () => {
        if (!formData.concepto || !formData.agendaTipo) {
            alert('Por favor completa los campos requeridos')
            return
        }

        setGuardando(true)
        try {
            const agendaData: Agenda = {
                concepto: formData.concepto,
                descripcion: formData.descripcion,
                fecha: formData.fecha ? new Date(formData.fecha) : null,
                hora: formData.hora,
                direccion: formData.direccion,
                googleMapsUrl: formData.googleMapsUrl,
                agendaTipo: formData.agendaTipo,
                eventoId: eventoId,
                userId: userId || '',
                status: AGENDA_STATUS.PENDIENTE
            }

            if (isModalAgendaEditarOpen && agendaId) {
                // Actualizar
                await actualizarAgendaEvento({ ...agendaData, id: agendaId })
            } else {
                // Crear nuevo
                await crearAgendaEvento(agendaData)
            }

            handleSubmitAgenda()
        } catch (error) {
            console.error('Error al guardar agendamiento:', error)
            alert('Error al guardar el agendamiento')
        } finally {
            setGuardando(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case AGENDA_STATUS.COMPLETADO:
                return 'text-green-400 bg-green-500/20 border-green-500/30'
            case AGENDA_STATUS.PENDIENTE:
                return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
            case AGENDA_STATUS.CONFIRMADO:
                return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
            case AGENDA_STATUS.CANCELADO:
                return 'text-red-400 bg-red-500/20 border-red-500/30'
            case AGENDA_STATUS.REAGENDADO:
                return 'text-purple-400 bg-purple-500/20 border-purple-500/30'
            default:
                return 'text-zinc-400 bg-zinc-500/20 border-zinc-500/30'
        }
    }

    // Función helper para obtener opciones de cambio de estado
    const getStatusChangeOptions = (currentStatus: string) => {
        const options = []

        // Desde cualquier estado se puede marcar como:
        if (currentStatus !== AGENDA_STATUS.PENDIENTE) {
            options.push({
                status: AGENDA_STATUS.PENDIENTE,
                label: 'Marcar como pendiente',
                icon: Clock4,
                color: 'text-yellow-400'
            })
        }

        if (currentStatus !== AGENDA_STATUS.CONFIRMADO) {
            options.push({
                status: AGENDA_STATUS.CONFIRMADO,
                label: 'Marcar como confirmado',
                icon: CheckCircle,
                color: 'text-blue-400'
            })
        }

        if (currentStatus !== AGENDA_STATUS.COMPLETADO) {
            options.push({
                status: AGENDA_STATUS.COMPLETADO,
                label: 'Marcar como completado',
                icon: CheckCircle,
                color: 'text-green-400'
            })
        }

        if (currentStatus !== AGENDA_STATUS.REAGENDADO) {
            options.push({
                status: AGENDA_STATUS.REAGENDADO,
                label: 'Marcar como reagendado',
                icon: RotateCcw,
                color: 'text-purple-400'
            })
        }

        if (currentStatus !== AGENDA_STATUS.CANCELADO) {
            options.push({
                status: AGENDA_STATUS.CANCELADO,
                label: 'Marcar como cancelado',
                icon: XCircle,
                color: 'text-red-400'
            })
        }

        return options
    }

    const getTipoAgendaColor = (tipo: string) => {
        switch (tipo.toLowerCase()) {
            case 'evento':
                return 'text-pink-300 border-pink-500'
            case 'cita virtual':
                return 'text-yellow-300 border-yellow-500'
            case 'visita':
                return 'text-blue-300 border-blue-500'
            default:
                return 'text-purple-300 border-purple-500'
        }
    }

    if (loading) {
        return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-zinc-800 rounded"></div>
                    <div className="h-4 bg-zinc-800 rounded"></div>
                    <div className="h-4 bg-zinc-800 rounded"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-700 px-6 py-4">
                <h3 className="text-lg font-semibold text-zinc-200">
                    Agendamientos del evento
                </h3>

                <button
                    onClick={handleNuevoAgendamiento}
                    disabled={!agendaTipos || !eventoId || !userId}
                    className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Agregar agendamiento"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="p-6">
                {agenda.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="space-y-2">
                            <p className="text-zinc-500 text-sm">
                                No hay agendamientos para este evento
                            </p>
                            <p className="text-zinc-600 text-xs">
                                Usa el botón + para crear un nuevo agendamiento
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {agenda.map((item, index) => (
                            <div
                                key={item.id || index}
                                className="bg-zinc-800 border border-zinc-700 rounded-lg p-4"
                            >
                                {/* Header del item */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start gap-3 flex-1">
                                        {/* Tipo de agenda */}
                                        <span className={`px-2 py-1 rounded-md text-xs border ${getTipoAgendaColor(item.agendaTipo || '')}`}>
                                            {item.agendaTipo}
                                        </span>

                                        {/* Estado */}
                                        <span className={`px-2 py-1 rounded-md text-xs border ${getStatusColor(item.status || AGENDA_STATUS.PENDIENTE)}`}>
                                            {item.status === AGENDA_STATUS.COMPLETADO ? 'Completado' :
                                                item.status === AGENDA_STATUS.CONFIRMADO ? 'Confirmado' :
                                                    item.status === AGENDA_STATUS.CANCELADO ? 'Cancelado' :
                                                        item.status === AGENDA_STATUS.REAGENDADO ? 'Reagendado' : 'Pendiente'}
                                        </span>
                                    </div>

                                    {/* Menú contextual */}
                                    <div className="relative menu-container">
                                        <button
                                            onClick={() => setMenuAbierto(menuAbierto === item.id ? null : item.id || '')}
                                            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 rounded-md transition-colors"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>

                                        {menuAbierto === item.id && (
                                            <div className="absolute right-0 top-8 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg py-1 z-10 min-w-48">
                                                {/* Opciones de cambio de estado */}
                                                {getStatusChangeOptions(item.status || AGENDA_STATUS.PENDIENTE).map((option) => {
                                                    const IconComponent = option.icon
                                                    return (
                                                        <button
                                                            key={option.status}
                                                            onClick={() => item.id && handleStatusAgendaActividad(item.id, option.status)}
                                                            className={`w-full px-3 py-2 text-left hover:bg-zinc-700 flex items-center gap-2 text-sm ${option.color}`}
                                                        >
                                                            <IconComponent className="w-4 h-4" />
                                                            {option.label}
                                                        </button>
                                                    )
                                                })}

                                                {/* Separador solo si hay opciones de estado */}
                                                {getStatusChangeOptions(item.status || AGENDA_STATUS.PENDIENTE).length > 0 && (
                                                    <div className="border-t border-zinc-700 my-1"></div>
                                                )}

                                                {/* Editar */}
                                                <button
                                                    onClick={() => handleEditarAgendamiento(item.id || '')}
                                                    className="w-full px-3 py-2 text-left text-zinc-200 hover:bg-zinc-700 flex items-center gap-2 text-sm"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Editar
                                                </button>

                                                <div className="border-t border-zinc-700 my-1"></div>

                                                {/* Eliminar */}
                                                <button
                                                    onClick={() => item.id && handleDeleteAgenda(item.id)}
                                                    className="w-full px-3 py-2 text-left text-red-400 hover:bg-zinc-700 flex items-center gap-2 text-sm"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                    Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Contenido del agendamiento */}
                                <div className="space-y-2">
                                    {/* Concepto */}
                                    {item.concepto && (
                                        <div className="text-zinc-200 font-medium">
                                            {item.concepto}
                                        </div>
                                    )}

                                    {/* Fecha y hora */}
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        {item.fecha && (
                                            <div className="flex items-center gap-2 text-yellow-400">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {new Date(new Date(item.fecha).getTime() + new Date().getTimezoneOffset() * 60000).toLocaleString('es-ES', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        )}

                                        {item.hora && (
                                            <div className="flex items-center gap-2 text-red-400">
                                                <Clock className="w-4 h-4" />
                                                <span>{item.hora}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Descripción */}
                                    {item.descripcion && (
                                        <div className="flex items-start gap-2 text-zinc-400 text-sm">
                                            <MessageCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <p>{item.descripcion}</p>
                                        </div>
                                    )}

                                    {/* Dirección */}
                                    {item.direccion && (
                                        <div className="flex items-start gap-2 text-zinc-400 text-sm">
                                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>{item.direccion}</span>
                                        </div>
                                    )}

                                    {/* Google Maps Link */}
                                    {item.googleMapsUrl && (
                                        <div className="flex items-center gap-2 text-blue-400 text-sm">
                                            <Link className="w-4 h-4" />
                                            <a
                                                href={item.googleMapsUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="hover:text-blue-300 transition-colors"
                                            >
                                                Abrir en Google Maps
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal unificado para crear/editar */}
            {(isModalAgendaNuevoOpen || isModalAgendaEditarOpen) && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                    <div className="bg-zinc-800 rounded-lg shadow-lg p-6 w-full max-w-md m-4">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-zinc-200">
                                {isModalAgendaEditarOpen ? 'Editar agendamiento' : 'Nuevo agendamiento'}
                            </h2>
                            <button
                                onClick={() => {
                                    setIsModalAgendaNuevoOpen(false)
                                    setIsModalAgendaEditarOpen(false)
                                    limpiarFormulario()
                                }}
                                className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Formulario */}
                        <div className="space-y-4">
                            {/* Tipo de agenda */}
                            <div>
                                <label className="block text-zinc-400 text-sm font-medium mb-2">
                                    Tipo de agendamiento *
                                </label>
                                <select
                                    value={formData.agendaTipo}
                                    onChange={(e) => setFormData({ ...formData, agendaTipo: e.target.value })}
                                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-200 focus:outline-none focus:border-blue-500"
                                    required
                                >
                                    <option value="">Selecciona un tipo</option>
                                    {agendaTipos?.map((tipo) => (
                                        <option key={tipo.id} value={tipo.nombre}>
                                            {tipo.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Concepto */}
                            <div>
                                <label className="block text-zinc-400 text-sm font-medium mb-2">
                                    Concepto *
                                </label>
                                <input
                                    type="text"
                                    value={formData.concepto}
                                    onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-200 focus:outline-none focus:border-blue-500"
                                    placeholder="Ej: Reunión con el cliente"
                                    required
                                />
                            </div>

                            {/* Fecha y hora */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-zinc-400 text-sm font-medium mb-2">
                                        Fecha
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.fecha}
                                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-200 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-zinc-400 text-sm font-medium mb-2">
                                        Hora
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.hora}
                                        onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-200 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className="block text-zinc-400 text-sm font-medium mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-200 focus:outline-none focus:border-blue-500"
                                    rows={3}
                                    placeholder="Detalles adicionales..."
                                />
                            </div>

                            {/* Dirección */}
                            <div>
                                <label className="block text-zinc-400 text-sm font-medium mb-2">
                                    Dirección
                                </label>
                                <input
                                    type="text"
                                    value={formData.direccion}
                                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-200 focus:outline-none focus:border-blue-500"
                                    placeholder="Dirección del lugar"
                                />
                            </div>

                            {/* Google Maps URL */}
                            <div>
                                <label className="block text-zinc-400 text-sm font-medium mb-2">
                                    URL de Google Maps
                                </label>
                                <input
                                    type="url"
                                    value={formData.googleMapsUrl}
                                    onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-200 focus:outline-none focus:border-blue-500"
                                    placeholder="https://maps.google.com/..."
                                />
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setIsModalAgendaNuevoOpen(false)
                                    setIsModalAgendaEditarOpen(false)
                                    limpiarFormulario()
                                }}
                                className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-md transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleGuardarAgendamiento}
                                disabled={guardando || !formData.concepto || !formData.agendaTipo}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {guardando ? 'Guardando...' : (isModalAgendaEditarOpen ? 'Actualizar' : 'Crear')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
