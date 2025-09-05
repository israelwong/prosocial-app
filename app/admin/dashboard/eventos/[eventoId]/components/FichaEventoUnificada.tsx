'use client'
import React, { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { toast } from 'sonner'
import type { EventoCompleto } from '@/app/admin/_lib/actions/evento/evento.schemas'
import type { EventoEtapa } from '@/app/admin/_lib/actions/evento/eventoManejo/eventoManejo.schemas'
import { crearFechaLocal, formatearFecha } from '@/app/admin/_lib/utils/fechas'
import {
    actualizarEventoBasico,
    cambiarEtapaEvento,
    obtenerEtapasEvento,
    actualizarTipoEvento
} from '@/app/admin/_lib/actions/evento/eventoManejo/eventoManejo.actions'
import {
    confirmarFechaTentativa,
    verificarDisponibilidadFecha,
    actualizarFechaEvento
} from '@/app/admin/_lib/actions/agenda/agenda.actions'
import { AGENDA_STATUS } from '@/app/admin/_lib/constants/status'
import { obtenerTiposEvento } from '@/app/admin/_lib/actions/eventoTipo/eventoTipo.actions'
import { useEventoSync } from '@/app/admin/hooks/useEventoSync'
import {
    eliminarEvento,
    archivarEvento,
    desarchivarEvento
} from '@/app/admin/_lib/actions/evento/evento.actions'
import ModalConfirmacionEliminacion from '@/app/components/ui/ModalConfirmacionEliminacion'
import { useModalEliminacionEvento } from '@/app/hooks/useModalEliminacionEvento'
import {
    Calendar,
    MapPin,
    Users,
    Tag,
    Edit3,
    Check,
    X,
    Clock,
    MoreVertical,
    Trash2,
    Archive,
    ArchiveRestore,
    AlertTriangle,
    CheckCircle,
    CalendarCheck
} from 'lucide-react'

interface Props {
    eventoCompleto: EventoCompleto
    onAsignacionEvento?: (status: boolean) => void
}

export default function FichaEventoUnificada({ eventoCompleto, onAsignacionEvento }: Props) {
    const evento = eventoCompleto

    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [etapas, setEtapas] = useState<EventoEtapa[]>([])
    const [tiposEvento, setTiposEvento] = useState<{ id: string; nombre: string; }[]>([])
    const [menuAbierto, setMenuAbierto] = useState(false)
    const [archivado, setArchivado] = useState<boolean>(evento.status === 'archived')
    const [validandoFecha, setValidandoFecha] = useState(false)
    const [disponibilidadFecha, setDisponibilidadFecha] = useState<{
        disponible: boolean;
        conflictos?: Array<{
            id: string;
            eventoId: string;
            eventoNombre?: string;
            status: string;
            hora?: string;
        }>;
    } | null>(null)
    const [validandoDisponibilidad, setValidandoDisponibilidad] = useState(false)
    const router = useRouter()

    // Hook para sincronización de tipo de evento
    const { eventoTipoId, actualizarTipoEvento: syncActualizarTipoEvento } = useEventoSync(evento.id, evento.eventoTipoId)

    // Hook para modal de eliminación
    const modalEliminacion = useModalEliminacionEvento()

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
        const cargarDatos = async () => {
            try {
                const [etapasData, tiposEventoData] = await Promise.all([
                    obtenerEtapasEvento(),
                    obtenerTiposEvento()
                ])
                setEtapas(etapasData)
                setTiposEvento(tiposEventoData)
            } catch (error) {
                console.error('Error cargando datos:', error)
                toast.error('Error cargando datos')
            } finally {
                setLoading(false)
            }
        }

        cargarDatos()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const fechaOriginal = fechaParaInput(evento.fecha_evento)
            const fechaCambiada = formData.fecha_evento !== fechaOriginal

            // Si la fecha cambió, usar la función de actualización de fecha con validación
            if (fechaCambiada) {
                if (disponibilidadFecha && !disponibilidadFecha.disponible) {
                    toast.error('No se puede guardar: la fecha seleccionada no está disponible')
                    setSaving(false)
                    return
                }

                const resultado = await actualizarFechaEvento(
                    evento.id,
                    new Date(formData.fecha_evento),
                    false // Por defecto como pendiente, usuario puede confirmar después
                )

                if (!resultado.success) {
                    toast.error(resultado.message || 'Error al actualizar fecha')
                    setSaving(false)
                    return
                }
            }

            // Actualizar otros campos del evento
            await actualizarEventoBasico({
                id: evento.id,
                nombre: formData.nombre,
                fecha_evento: formData.fecha_evento ? new Date(formData.fecha_evento) : new Date(),
                sede: formData.sede,
                direccion: formData.direccion,
                status: formData.status
            })

            setIsEditing(false)
            setDisponibilidadFecha(null) // Limpiar validación
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
        setDisponibilidadFecha(null) // Limpiar validación
        setIsEditing(false)
    }

    // Manejar cambio de tipo de evento
    const handleTipoEventoChange = async (nuevoTipoId: string) => {
        try {
            // Actualizar en backend
            await actualizarTipoEvento(evento.id, nuevoTipoId || null)

            // Sincronizar con otros componentes
            await syncActualizarTipoEvento(nuevoTipoId || null)

            toast.success('Tipo de evento actualizado correctamente')

            // Refresh para obtener datos actualizados
            router.refresh()
        } catch (error) {
            console.error('Error actualizando tipo de evento:', error)
            toast.error('Error al actualizar tipo de evento')
        }
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

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element
            if (!target.closest('.menu-container')) {
                setMenuAbierto(false)
            }
        }

        if (menuAbierto) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [menuAbierto])

    //! Eliminar evento usando el modal
    const handleEliminarEvento = async (eventoId: string) => {
        try {
            await modalEliminacion.abrirModal(eventoId, evento.nombre || 'Evento sin nombre')
        } catch (error) {
            toast.error('Error verificando dependencias del evento')
        }
    }

    const confirmarEliminacion = async () => {
        await modalEliminacion.ejecutarEliminacion(
            () => eliminarEvento(evento.id),
            (resultado) => {
                toast.success(resultado.message || 'Evento eliminado exitosamente')
                router.push('/admin/dashboard/eventos')
            },
            (error) => {
                toast.error(typeof error === 'string' ? error : 'Error inesperado al eliminar el evento')
            }
        )
    }

    //! Archivar evento
    const handleArchivarEvento = async () => {
        if (!evento.id) return

        try {
            const resultado = await archivarEvento(evento.id)
            if (resultado.success) {
                setArchivado(true)
                toast.success('Evento archivado exitosamente')
            } else {
                toast.error(resultado.message || 'Error al archivar evento')
            }
        } catch (error) {
            console.error('Error archivando evento:', error)
            toast.error('Error al archivar evento')
        }
        setMenuAbierto(false)
    }

    //! Desarchivar evento
    const handleDesarchivarEvento = async () => {
        if (!evento.id) return

        try {
            const resultado = await desarchivarEvento(evento.id)
            if (resultado.success) {
                setArchivado(false)
                toast.success('Evento desarchivado exitosamente')
            } else {
                toast.error(resultado.message || 'Error al desarchivar evento')
            }
        } catch (error) {
            console.error('Error desarchivando evento:', error)
            toast.error('Error al desarchivar evento')
        }
        setMenuAbierto(false)
    }

    //! Confirmar fecha tentativa
    const handleConfirmarFecha = async () => {
        try {
            const resultado = await confirmarFechaTentativa(evento.id)
            if (resultado.success) {
                toast.success(resultado.message)
                router.refresh()
            }
        } catch (error) {
            console.error('Error confirmando fecha:', error)
            toast.error('Error al confirmar fecha')
        }
    }

    //! Cambiar fecha del evento
    const handleCambiarFecha = async (nuevaFecha: string, confirmar: boolean = false) => {
        if (!nuevaFecha) return

        setValidandoFecha(true)
        try {
            const resultado = await actualizarFechaEvento(
                evento.id,
                new Date(nuevaFecha),
                confirmar
            )

            if (resultado.success) {
                toast.success(resultado.message)
                setFormData(prev => ({ ...prev, fecha_evento: nuevaFecha }))
                router.refresh()
            } else {
                toast.error(resultado.message || 'Error al actualizar fecha')
                if (resultado.conflictos) {
                    console.log('Conflictos encontrados:', resultado.conflictos)
                }
            }
        } catch (error) {
            console.error('Error cambiando fecha:', error)
            toast.error('Error al cambiar fecha')
        } finally {
            setValidandoFecha(false)
        }
    }

    //! Obtener status de la agenda
    const getAgendaStatus = () => {
        return evento.Agenda?.[0]?.status || null
    }

    //! Verificar si la fecha es tentativa
    const esFechaTentativa = () => {
        return getAgendaStatus() === AGENDA_STATUS.POR_CONFIRMAR
    }

    //! Verificar si el evento fue creado originalmente como tentativo
    const fueCreadoComoTentativo = () => {
        // Buscar en la bitácora si hay una entrada que indique fecha tentativa
        return evento.EventoBitacora?.some(entrada =>
            entrada.comentario?.includes('⚠️ FECHA TENTATIVA') ||
            entrada.comentario?.toLowerCase().includes('fecha tentativa')
        ) || false
    }

    //! Validar disponibilidad de fecha en tiempo real
    const validarDisponibilidadFecha = async (fechaString: string) => {
        if (!fechaString) {
            setDisponibilidadFecha(null)
            return
        }

        setValidandoDisponibilidad(true)
        try {
            const nuevaFecha = new Date(fechaString)
            const resultado = await verificarDisponibilidadFecha(nuevaFecha, evento.id)
            setDisponibilidadFecha(resultado)
        } catch (error) {
            console.error('Error validando disponibilidad:', error)
            setDisponibilidadFecha({ disponible: false })
        } finally {
            setValidandoDisponibilidad(false)
        }
    }

    //! Manejar cambio de fecha en modo edición
    const handleFechaChange = (nuevaFecha: string) => {
        setFormData(prev => ({ ...prev, fecha_evento: nuevaFecha }))

        // Solo validar si estamos en modo edición y la fecha es diferente a la original
        if (isEditing && nuevaFecha !== fechaParaInput(evento.fecha_evento)) {
            validarDisponibilidadFecha(nuevaFecha)
        } else {
            setDisponibilidadFecha(null)
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
        <div className={`space-y-4 ${archivado ? 'bg-amber-900/30 border-2 border-amber-600/60 rounded-lg p-4' : ''}`}>
            {/* Indicador de archivado */}
            {archivado && (
                <div className="bg-amber-900/50 border border-amber-500 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-200 text-sm font-medium">
                            <Archive className="w-4 h-4" />
                            Evento Archivado
                        </div>
                        <button
                            onClick={handleDesarchivarEvento}
                            className="text-amber-200 hover:text-amber-100 text-xs px-2 py-1 bg-amber-800/60 hover:bg-amber-800/80 rounded transition-colors flex items-center gap-1"
                        >
                            <ArchiveRestore className="w-3 h-3" />
                            Desarchivar
                        </button>
                    </div>
                </div>
            )}

            {/* Cabecera con título y botones */}
            <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
                <h3 className="text-lg font-semibold text-zinc-200">Información del Evento</h3>
                {!isEditing && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
                            title="Editar información"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Menú contextual */}
                        <div className="relative menu-container">
                            <button
                                onClick={() => setMenuAbierto(!menuAbierto)}
                                className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
                                title="Opciones"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>

                            {menuAbierto && (
                                <div className="absolute right-0 top-8 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg py-1 z-10 min-w-48">

                                    {/* Archivar/Desarchivar */}
                                    <button
                                        onClick={archivado ? handleDesarchivarEvento : handleArchivarEvento}
                                        className="w-full px-3 py-2 text-left text-amber-400 hover:bg-zinc-700 flex items-center gap-2 text-sm"
                                    >
                                        {archivado ? (
                                            <>
                                                <ArchiveRestore className="w-4 h-4" />
                                                Desarchivar evento
                                            </>
                                        ) : (
                                            <>
                                                <Archive className="w-4 h-4" />
                                                Archivar evento
                                            </>
                                        )}
                                    </button>

                                    <div className="border-t border-zinc-700 my-1"></div>

                                    {/* Eliminar */}
                                    <button
                                        onClick={() => evento.id && handleEliminarEvento(evento.id)}
                                        disabled={modalEliminacion.isLoading}
                                        className="w-full px-3 py-2 text-left text-red-400 hover:bg-zinc-700 flex items-center gap-2 text-sm disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {modalEliminacion.isLoading ? 'Verificando...' : 'Eliminar evento'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
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
                            disabled={saving || (disponibilidadFecha && !disponibilidadFecha.disponible) || validandoDisponibilidad}
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-50"
                            title={
                                saving ? 'Guardando...' :
                                    (disponibilidadFecha && !disponibilidadFecha.disponible) ? 'Fecha no disponible' :
                                        validandoDisponibilidad ? 'Validando fecha...' :
                                            'Guardar cambios'
                            }
                        >
                            <Check className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Contenido */}
            <div className={`space-y-4 ${archivado ? 'opacity-30' : ''}`}>


                {/* Tipo de evento */}
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Tipo de evento
                    </label>
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                <Tag className="w-3 h-3 mr-1.5" />
                                {evento.EventoTipo?.nombre || 'Sin tipo especificado'}
                            </span>
                            <select
                                value=""
                                onChange={(e) => e.target.value && handleTipoEventoChange(e.target.value)}
                                className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200"
                                title="Cambiar tipo de evento"
                            >
                                <option value="">Cambiar tipo...</option>
                                {tiposEvento.map(tipo => (
                                    <option key={tipo.id} value={tipo.id}>
                                        {tipo.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            <Tag className="w-3 h-3 mr-1.5" />
                            {evento.EventoTipo?.nombre || 'Sin tipo especificado'}
                        </span>
                    )}
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
                        <div className="space-y-3">
                            <div className="relative">
                                <Input
                                    type="date"
                                    value={formData.fecha_evento}
                                    onChange={(e) => handleFechaChange(e.target.value)}
                                    className={`bg-zinc-800 border-zinc-700 ${disponibilidadFecha && !disponibilidadFecha.disponible
                                        ? 'border-red-500 focus:border-red-500'
                                        : ''
                                        }`}
                                />
                                {validandoDisponibilidad && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>

                            {/* Indicador de disponibilidad para modo edición */}
                            {isEditing && disponibilidadFecha && (
                                <div className={`p-3 rounded-lg border ${disponibilidadFecha.disponible
                                    ? 'bg-emerald-900/30 border-emerald-600/50 text-emerald-300'
                                    : 'bg-red-900/30 border-red-600/50 text-red-300'
                                    }`}>
                                    <div className="flex items-center gap-2">
                                        {disponibilidadFecha.disponible ? (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                <span className="text-sm font-medium">Fecha disponible</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertTriangle className="w-4 h-4" />
                                                <span className="text-sm font-medium">Fecha no disponible</span>
                                            </>
                                        )}
                                    </div>
                                    {!disponibilidadFecha.disponible && disponibilidadFecha.conflictos && (
                                        <div className="mt-2 space-y-1">
                                            <p className="text-xs text-red-400">Conflictos encontrados:</p>
                                            {disponibilidadFecha.conflictos.map((conflicto, index) => (
                                                <div key={index} className="text-xs text-red-300 bg-red-900/20 p-2 rounded">
                                                    • {conflicto.eventoNombre} ({conflicto.status})
                                                    {conflicto.hora && ` - ${conflicto.hora}`}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${esFechaTentativa()
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                }`}>
                                {esFechaTentativa() ? (
                                    <AlertTriangle className="w-3 h-3 mr-1.5" />
                                ) : (
                                    <Calendar className="w-3 h-3 mr-1.5" />
                                )}
                                {evento.fecha_evento ?
                                    formatearFecha(evento.fecha_evento, {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) :
                                    'No especificada'
                                }
                            </span>

                            {/* Indicador de status */}
                            {esFechaTentativa() && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-900/30 text-amber-400 border border-amber-600/50">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Fecha tentativa
                                </span>
                            )}

                            {getAgendaStatus() === AGENDA_STATUS.CONFIRMADO && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-600/50">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Confirmada
                                </span>
                            )}

                            {/* Botones de acción */}
                            {!isEditing && (
                                <div className="flex gap-1">
                                    {esFechaTentativa() && fueCreadoComoTentativo() && (
                                        <button
                                            onClick={handleConfirmarFecha}
                                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-md transition-colors flex items-center gap-1"
                                            title="Confirmar fecha tentativa"
                                        >
                                            <CalendarCheck className="w-3 h-3" />
                                            Confirmar
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sede del evento */}
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Sede del evento
                    </label>
                    {isEditing ? (
                        <Input
                            value={formData.sede || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, sede: e.target.value }))}
                            placeholder="Nombre de la sede o lugar del evento"
                            className="bg-zinc-800 border-zinc-700"
                        />
                    ) : (
                        <p className="text-zinc-200">{evento.sede || 'No especificada'}</p>
                    )}
                </div>

                {/* Dirección del evento */}
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Dirección
                    </label>
                    {isEditing ? (
                        <textarea
                            value={formData.direccion || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                            placeholder="Dirección completa del evento"
                            rows={2}
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    ) : (
                        <p className="text-zinc-200">{evento.direccion || 'No especificada'}</p>
                    )}
                </div>

                {/* Etapa actual */}
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Etapa actual
                    </label>
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <span className="text-zinc-200">
                                {evento.EventoEtapa?.nombre || 'Sin etapa'}
                            </span>
                            <select
                                onChange={(e) => e.target.value && handleCambiarEtapa(e.target.value)}
                                value=""
                                className="ml-2 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200"
                                title="Cambiar etapa"
                            >
                                <option value="">Cambiar etapa...</option>
                                {etapas.map(etapa => (
                                    <option key={etapa.id} value={etapa.id}>
                                        {etapa.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <span className="text-zinc-200">
                            {evento.EventoEtapa?.nombre || 'Sin etapa'}
                        </span>
                    )}
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

            {/* Modal de confirmación de eliminación */}
            {modalEliminacion.datos && (
                <ModalConfirmacionEliminacion
                    isOpen={modalEliminacion.isOpen}
                    onClose={modalEliminacion.cerrarModal}
                    onConfirm={confirmarEliminacion}
                    titulo="Eliminar Evento"
                    entidad={modalEliminacion.datos.entidad}
                    dependencias={modalEliminacion.datos.dependencias}
                    advertencias={modalEliminacion.datos.advertencias}
                    bloqueos={modalEliminacion.datos.bloqueos}
                    isLoading={modalEliminacion.isLoading}
                    loadingText="Eliminando evento..."
                    onArchivar={handleArchivarEvento}
                    mostrarBotonArchivar={!archivado}
                />
            )}
        </div>
    )
}
