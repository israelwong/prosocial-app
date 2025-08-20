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
    eliminarEvento,
    archivarEvento,
    desarchivarEvento
} from '@/app/admin/_lib/actions/evento/evento/evento.actions'
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
    ArchiveRestore
} from 'lucide-react'

interface Props {
    eventoCompleto: EventoCompleto
    onAsignacionEvento?: (status: boolean) => void
}

export default function FichaEventoUnificadaV2({ eventoCompleto, onAsignacionEvento }: Props) {
    const evento = eventoCompleto

    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [etapas, setEtapas] = useState<EventoEtapa[]>([])
    const [menuAbierto, setMenuAbierto] = useState(false)
    const [archivado, setArchivado] = useState<boolean>(evento.status === 'archived')
    const router = useRouter()

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
            <div className={`space-y-4 ${archivado ? 'opacity-30' : ''}`}>
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
