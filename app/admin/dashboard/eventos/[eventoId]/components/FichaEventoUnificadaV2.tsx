'use client'
import React, { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { toast } from 'sonner'
import type { EventoCompleto } from '@/app/admin/_lib/actions/evento/evento/evento.schemas'
import type { EventoEtapa } from '@/app/admin/_lib/actions/evento/eventoManejo/eventoManejo.schemas'
import { crearFechaLocal, formatearFecha } from '@/app/admin/_lib/utils/fechas'
import {
    actualizarEventoBasico,
    cambiarEtapaEvento,
    obtenerEtapasEvento
} from '@/app/admin/_lib/actions/evento/eventoManejo/eventoManejo.actions'
import {
    Calendar,
    MapPin,
    Users,
    Tag,
    Edit3,
    Check,
    X,
    Clock
} from 'lucide-react'

interface Props {
    eventoCompleto: EventoCompleto
    onAsignacionEvento?: (status: boolean) => void
}

export default function FichaEventoUnificadaV2({ eventoCompleto, onAsignacionEvento }: Props) {
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [etapas, setEtapas] = useState<EventoEtapa[]>([])
    const router = useRouter()

    const evento = eventoCompleto

    // Helper para convertir fecha a formato input (YYYY-MM-DD)
    const fechaParaInput = (fecha: Date | string | null): string => {
        if (!fecha) return '';
        const fechaLocal = crearFechaLocal(fecha);
        const year = fechaLocal.getFullYear();
        const month = String(fechaLocal.getMonth() + 1).padStart(2, '0');
        const day = String(fechaLocal.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Estados del formulario
    const [formData, setFormData] = useState({
        nombre: evento.nombre || '',
        fecha_evento: fechaParaInput(evento.fecha_evento),
        sede: evento.sede || '',
        direccion: evento.direccion || '',
        status: evento.status || 'active'
    })

    useEffect(() => {
        const cargarEtapas = async () => {
            try {
                const etapasData = await obtenerEtapasEvento()
                setEtapas(etapasData)
            } catch (error) {
                console.error('Error cargando etapas:', error)
                toast.error('Error cargando etapas')
            } finally {
                setLoading(false)
            }
        }

        cargarEtapas()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            await actualizarEventoBasico({
                id: evento.id,
                nombre: formData.nombre,
                fecha_evento: formData.fecha_evento ? new Date(formData.fecha_evento) : new Date(),
                sede: formData.sede,
                direccion: formData.direccion,
                status: formData.status
            })

            setIsEditing(false)
            toast.success('Evento actualizado correctamente')
            router.refresh()
        } catch (error) {
            console.error('Error actualizando evento:', error)
            toast.error('Error al actualizar evento')
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setFormData({
            nombre: evento.nombre || '',
            fecha_evento: fechaParaInput(evento.fecha_evento),
            sede: evento.sede || '',
            direccion: evento.direccion || '',
            status: evento.status || 'active'
        })
        setIsEditing(false)
    }

    const handleCambiarEtapa = async (etapaId: string) => {
        try {
            await cambiarEtapaEvento({
                eventoId: evento.id,
                etapaId: etapaId
            })
            toast.success('Etapa cambiada correctamente')
            router.refresh()
        } catch (error) {
            console.error('Error cambiando etapa:', error)
            toast.error('Error al cambiar etapa')
        }
    }

    const eventoAsignado = !!evento.userId

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-6 bg-zinc-800 rounded animate-pulse"></div>
                <div className="h-4 bg-zinc-800 rounded animate-pulse"></div>
                <div className="h-4 bg-zinc-800 rounded animate-pulse"></div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Cabecera con título y botón de edición */}
            <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
                <h3 className="text-lg font-semibold text-zinc-200">Información del Evento</h3>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
                        title="Editar información"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                )}
                {isEditing && (
                    <div className="flex gap-1">
                        <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-50"
                            title="Cancelar edición"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-50"
                            title={saving ? 'Guardando...' : 'Guardar cambios'}
                        >
                            <Check className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Contenido */}
            <div className="space-y-4">
                {/* Tipo de evento */}
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Tipo de evento
                    </label>
                    <p className="text-zinc-200">{evento.EventoTipo?.nombre || 'No especificado'}</p>
                </div>

                {/* Nombre del evento */}
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Nombre del evento
                    </label>
                    {isEditing ? (
                        <Input
                            value={formData.nombre}
                            onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                            className="bg-zinc-800 border-zinc-700"
                        />
                    ) : (
                        <p className="text-zinc-200">{evento.nombre || 'Sin nombre'}</p>
                    )}
                </div>

                {/* Fecha del evento */}
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Fecha del evento
                    </label>
                    {isEditing ? (
                        <Input
                            type="date"
                            value={formData.fecha_evento}
                            onChange={(e) => setFormData(prev => ({ ...prev, fecha_evento: e.target.value }))}
                            className="bg-zinc-800 border-zinc-700"
                        />
                    ) : (
                        <p className="text-zinc-200">
                            {evento.fecha_evento ?
                                formatearFecha(evento.fecha_evento, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) :
                                'No especificada'
                            }
                        </p>
                    )}
                </div>

                {/* Etapa actual */}
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Etapa actual
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-200">
                            {evento.EventoEtapa?.nombre || 'Sin etapa'}
                        </span>
                        <select
                            onChange={(e) => e.target.value && handleCambiarEtapa(e.target.value)}
                            value=""
                            className="ml-2 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200"
                        >
                            <option value="">Cambiar etapa...</option>
                            {etapas.map(etapa => (
                                <option key={etapa.id} value={etapa.id}>
                                    {etapa.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Fecha de creación */}
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Fecha de creación
                    </label>
                    <p className="text-zinc-200">
                        {new Date(evento.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
            </div>
        </div>
    )
}
