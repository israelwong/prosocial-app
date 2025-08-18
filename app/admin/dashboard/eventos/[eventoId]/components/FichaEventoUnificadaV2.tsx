'use client'
import React, { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import type { EventoCompleto } from '@/app/admin/_lib/actions/evento/evento/evento.schemas'
import type { EventoEtapa } from '@/app/admin/_lib/actions/evento/eventoManejo/eventoManejo.schemas'
import { crearFechaLocal, formatearFecha } from '@/app/admin/_lib/utils/fechas'
import {
    actualizarEventoBasico,
    asignarUsuarioEvento,
    liberarUsuarioEvento,
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
    UserPlus,
    UserMinus,
    Clock,
    Building,
    ChevronDown
} from 'lucide-react'

interface Props {
    eventoCompleto: EventoCompleto
    onAsignacionEvento?: (status: boolean) => void
}

export default function FichaEventoUnificadaV2({ eventoCompleto, onAsignacionEvento }: Props) {
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [asignandoEvento, setAsignandoEvento] = useState(false)
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

    const handleAsignarEvento = async () => {
        setAsignandoEvento(true)
        try {
            const userId = Cookies.get('userId')
            if (!userId) {
                toast.error('Usuario no autenticado')
                return
            }

            await asignarUsuarioEvento({
                eventoId: evento.id,
                userId: userId
            })

            toast.success('Evento asignado correctamente')
            onAsignacionEvento?.(true)
            router.refresh()
        } catch (error) {
            console.error('Error asignando evento:', error)
            toast.error('Error al asignar evento')
        } finally {
            setAsignandoEvento(false)
        }
    }

    // const handleLiberarEvento = async () => {
    //     setAsignandoEvento(true)
    //     try {
    //         await liberarUsuarioEvento(evento.id)
    //         toast.success('Evento liberado correctamente')
    //         onAsignacionEvento?.(false)
    //         router.refresh()
    //     } catch (error) {
    //         console.error('Error liberando evento:', error)
    //         toast.error('Error al liberar evento')
    //     } finally {
    //         setAsignandoEvento(false)
    //     }
    // }

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
            {/* Cabecera con título */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-zinc-200 border-b border-zinc-700 pb-2">Información del Evento</h3>
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

            {/* Footer con botones de acción */}
            <div className="border-t border-zinc-700 pt-3 mt-4">
                <div className="flex gap-2 justify-center md:justify-start">
                    {/* Botón de editar */}
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-blue-100 border border-blue-600 rounded-md hover:bg-blue-600 transition-colors"
                        >
                            <Edit3 className="w-4 h-4" />
                            Editar
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleCancel}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-red-700 text-red-100 border border-red-600 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                <X className="w-4 h-4" />
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-emerald-100 border border-emerald-600 rounded-md hover:bg-emerald-600 transition-colors disabled:opacity-50"
                            >
                                <Check className="w-4 h-4" />
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </>
                    )}

                    {/* Botón de seguimiento (asignación) */}
                    {/* {!eventoAsignado ? (
                        <button
                            onClick={handleAsignarEvento}
                            disabled={asignandoEvento}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-700 text-purple-100 border border-purple-600 rounded-md hover:bg-purple-600 transition-colors disabled:opacity-50"
                        >
                            <UserPlus className="w-4 h-4" />
                            {asignandoEvento ? 'Asignando...' : 'Tomar seguimiento'}
                        </button>
                    ) : (
                        <button
                            onClick={handleLiberarEvento}
                            disabled={asignandoEvento}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-700 text-amber-100 border border-amber-600 rounded-md hover:bg-amber-600 transition-colors disabled:opacity-50"
                        >
                            <UserMinus className="w-4 h-4" />
                            {asignandoEvento ? 'Liberando...' : 'Liberar seguimiento'}
                        </button>
                    )} */}
                </div>
            </div>
        </div>
    )
}
