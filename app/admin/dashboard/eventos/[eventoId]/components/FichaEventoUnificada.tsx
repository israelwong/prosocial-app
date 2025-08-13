'use client'
import React, { useEffect, useState } from "react"
import {
    actualizarEvento,
    actualizarEventoStatus,
    obtenerEventoPorId,
    asignarEventoUser,
    liberarEventoUser,
    actualizarEtapa
} from '@/app/admin/_lib/evento.actions'
import { obtenerEventoEtapas } from "@/app/admin/_lib/EventoEtapa.actions"
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import {
    Calendar,
    MapPin,
    Users,
    Tag,
    Edit3,
    Check,
    X,
    UserPlus,
    UserMinus,
    Clock,
    Building,
    ChevronDown
} from 'lucide-react'

interface Props {
    eventoId: string
    onAsignacionEvento?: (status: boolean) => void
}

interface EventoEtapa {
    id: string
    nombre: string
    orden: number
}

export default function FichaEventoUnificada({ eventoId, onAsignacionEvento }: Props) {
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [asignandoEvento, setAsignandoEvento] = useState(false)

    // Estados del evento
    const [formData, setFormData] = useState({
        nombre: '',
        fecha_evento: '',
        sede: '',
        direccion: '',
        status: 'activo'
    })

    const [eventoTipo, setEventoTipo] = useState<string>('')
    const [userId, setUserId] = useState<string | null>(null)
    const [eventoAsignado, setEventoAsignado] = useState(false)
    const [fechaCreacion, setFechaCreacion] = useState<Date | null>(null)

    // Estados para etapas
    const [etapas, setEtapas] = useState<EventoEtapa[]>([])
    const [etapaActualId, setEtapaActualId] = useState<string>()

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [eventoData, etapasData] = await Promise.all([
                    obtenerEventoPorId(eventoId),
                    obtenerEventoEtapas()
                ])

                if (eventoData) {
                    setFormData({
                        nombre: eventoData.nombre ?? '',
                        fecha_evento: eventoData.fecha_evento ?
                            new Date(eventoData.fecha_evento).toISOString().split('T')[0] : '',
                        sede: eventoData.sede ?? '',
                        direccion: eventoData.direccion ?? '',
                        status: eventoData.status ?? 'activo'
                    })

                    setEventoTipo(eventoData.EventoTipo?.nombre ?? '')
                    setUserId(eventoData.userId)
                    setEventoAsignado(!!eventoData.userId)
                    setFechaCreacion(eventoData.createdAt ? new Date(eventoData.createdAt) : null)
                    setEtapaActualId(eventoData.eventoEtapaId ?? undefined)
                }

                setEtapas(
                    etapasData.map((etapa: any) => ({
                        id: etapa.id,
                        nombre: etapa.nombre,
                        orden: etapa.posicion
                    }))
                )
            } catch (error) {
                console.error('Error cargando datos del evento:', error)
                toast.error('Error cargando datos del evento')
            } finally {
                setLoading(false)
            }
        }

        cargarDatos()
    }, [eventoId])

    const handleSave = async () => {
        setSaving(true)
        try {
            const resultado = await actualizarEvento({
                ...formData,
                id: eventoId,
                fecha_evento: formData.fecha_evento ? new Date(formData.fecha_evento) : new Date()
            })

            if (resultado) {
                setIsEditing(false)
                toast.success('Evento actualizado correctamente')
            }
        } catch (error) {
            console.error('Error actualizando evento:', error)
            toast.error('Error al actualizar evento')
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = async () => {
        try {
            const eventoData = await obtenerEventoPorId(eventoId)
            if (eventoData) {
                setFormData({
                    nombre: eventoData.nombre ?? '',
                    fecha_evento: eventoData.fecha_evento ?
                        new Date(eventoData.fecha_evento).toISOString().split('T')[0] : '',
                    sede: eventoData.sede ?? '',
                    direccion: eventoData.direccion ?? '',
                    status: eventoData.status ?? 'activo'
                })
            }
        } catch (error) {
            console.error('Error recargando datos:', error)
        }
        setIsEditing(false)
    }

    const handleAsignarEvento = async () => {
        setAsignandoEvento(true)
        try {
            const userIdFromCookie = Cookies.get('userId')
            if (!userIdFromCookie) {
                toast.error('Usuario no identificado')
                return
            }

            if (eventoAsignado) {
                await liberarEventoUser(eventoId)
                setEventoAsignado(false)
                setUserId(null)
                toast.success('Evento liberado')
                onAsignacionEvento?.(false)
            } else {
                await asignarEventoUser(eventoId, userIdFromCookie, etapaActualId || '')
                setEventoAsignado(true)
                setUserId(userIdFromCookie)
                toast.success('Evento asignado')
                onAsignacionEvento?.(true)
            }
        } catch (error) {
            console.error('Error en asignación:', error)
            toast.error('Error al asignar/liberar evento')
        } finally {
            setAsignandoEvento(false)
        }
    }

    const handleCambiarEtapa = async (nuevaEtapaId: string) => {
        try {
            await actualizarEtapa(eventoId, nuevaEtapaId)
            setEtapaActualId(nuevaEtapaId)
            toast.success('Etapa actualizada')
        } catch (error) {
            console.error('Error cambiando etapa:', error)
            toast.error('Error al cambiar etapa')
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'activo': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            case 'aprobado': return 'bg-green-500/20 text-green-400 border-green-500/30'
            case 'cancelado': return 'bg-red-500/20 text-red-400 border-red-500/30'
            case 'completado': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
            default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
        }
    }

    const formatearFecha = (fechaString: string) => {
        if (!fechaString) return 'Por definir'
        return new Date(fechaString).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-4 bg-zinc-700 rounded w-3/4"></div>
                <div className="space-y-2">
                    <div className="h-3 bg-zinc-700 rounded"></div>
                    <div className="h-3 bg-zinc-700 rounded w-5/6"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-zinc-400" />
                    <h3 className="font-semibold text-zinc-200">Información del Evento</h3>
                </div>
                <div className="flex gap-1">
                    {!isEditing ? (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleAsignarEvento}
                                disabled={asignandoEvento}
                                className={`h-8 px-2 text-xs ${eventoAsignado
                                    ? 'text-red-400 hover:text-red-300'
                                    : 'text-green-400 hover:text-green-300'
                                    } hover:bg-zinc-800`}
                            >
                                {eventoAsignado ? <UserMinus className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                                className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                            >
                                <Edit3 className="h-3 w-3" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancel}
                                disabled={saving}
                                className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSave}
                                disabled={saving}
                                className="h-8 w-8 p-0 text-zinc-200 hover:text-zinc-100 hover:bg-zinc-700"
                            >
                                <Check className="h-3 w-3" />
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Contenido */}
            {isEditing ? (
                <div className="space-y-3">
                    <Input
                        value={formData.nombre}
                        onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                        placeholder="Nombre del evento"
                        className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-zinc-500"
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            type="date"
                            value={formData.fecha_evento}
                            onChange={(e) => setFormData(prev => ({ ...prev, fecha_evento: e.target.value }))}
                            className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-zinc-500"
                        />
                    </div>

                    <Input
                        value={formData.sede}
                        onChange={(e) => setFormData(prev => ({ ...prev, sede: e.target.value }))}
                        placeholder="Sede del evento"
                        className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-zinc-500"
                    />

                    <Input
                        value={formData.direccion}
                        onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                        placeholder="Dirección completa"
                        className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-zinc-500"
                    />

                    <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    >
                        <option value="activo">Activo</option>
                        <option value="aprobado">Aprobado</option>
                        <option value="cancelado">Cancelado</option>
                        <option value="completado">Completado</option>
                    </select>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Nombre y Status */}
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-zinc-100">{formData.nombre}</h4>
                        <span className={`px-2 py-1 rounded-md text-xs border ${getStatusColor(formData.status)}`}>
                            {formData.status}
                        </span>
                    </div>

                    {/* Información del evento */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                            <Clock className="h-3 w-3 text-zinc-500" />
                            <span>{formatearFecha(formData.fecha_evento)}</span>
                        </div>

                        {formData.sede && (
                            <div className="flex items-center gap-2 text-sm text-zinc-300">
                                <Building className="h-3 w-3 text-zinc-500" />
                                <span>{formData.sede}</span>
                            </div>
                        )}

                        {formData.direccion && (
                            <div className="flex items-center gap-2 text-sm text-zinc-300">
                                <MapPin className="h-3 w-3 text-zinc-500" />
                                <span className="truncate">{formData.direccion}</span>
                            </div>
                        )}

                        {eventoTipo && (
                            <div className="flex items-center gap-2 text-sm text-zinc-300">
                                <Tag className="h-3 w-3 text-zinc-500" />
                                <span>{eventoTipo}</span>
                            </div>
                        )}
                    </div>

                    {/* Gestión de etapas */}
                    {etapas.length > 0 && (
                        <div className="pt-2 border-t border-zinc-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-zinc-400">Etapa del Evento</span>
                                <span className={`text-xs ${eventoAsignado ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {eventoAsignado ? 'Asignado' : 'Sin asignar'}
                                </span>
                            </div>
                            <select
                                value={etapaActualId || ''}
                                onChange={(e) => handleCambiarEtapa(e.target.value)}
                                className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                            >
                                {etapas.map((etapa) => (
                                    <option key={etapa.id} value={etapa.id}>
                                        {etapa.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Información adicional */}
                    {fechaCreacion && (
                        <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                            Creado: {fechaCreacion.toLocaleDateString('es-ES')}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
