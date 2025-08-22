'use client'

import React, { useState, useEffect } from 'react'
import { obtenerEventoBitacora, crearBitacoraEvento, eliminarBitacoraEvento, actualizarBitacoraEvento } from '@/app/admin/_lib/actions/evento/bitacora.actions'
import { Clock, FileText, AlertCircle, Plus, MoreVertical, Edit, Trash, X, MessageCircle } from 'lucide-react'

interface BitacoraItem {
    id: string
    eventoId: string
    comentario: string
    importancia: string
    status: string
    createdAt: Date
    updatedAt: Date
}

interface BitacoraSimpleProps {
    eventoId: string
}

export function BitacoraSimple({ eventoId }: BitacoraSimpleProps) {
    const [bitacora, setBitacora] = useState<BitacoraItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [menuAbierto, setMenuAbierto] = useState<string | null>(null)
    const [editandoId, setEditandoId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        comentario: '',
        importancia: 'informativo'
    })
    const [guardando, setGuardando] = useState(false)

    // Cargar bitácora al montar el componente
    useEffect(() => {
        cargarBitacora()
    }, [eventoId])

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

    const cargarBitacora = async () => {
        try {
            setLoading(true)
            const data = await obtenerEventoBitacora(eventoId)
            console.log('🔍 DEBUG - Bitácora cargada:', data.length, 'registros')
            if (data.length > 0) {
                console.log('🔍 DEBUG - Último registro:', {
                    id: data[data.length - 1].id,
                    comentario: data[data.length - 1].comentario,
                    importancia: data[data.length - 1].importancia,
                    createdAt: data[data.length - 1].createdAt
                })
            }
            setBitacora(data)
        } catch (error) {
            console.error('Error cargando bitácora:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatearFecha = (fecha: Date) => {
        try {
            // Verificar que sea una fecha válida
            if (!fecha || !(fecha instanceof Date) || isNaN(fecha.getTime())) {
                return 'Fecha no válida'
            }

            // Formatear directamente sin conversiones adicionales
            return fecha.toLocaleString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch (error) {
            console.error('Error formateando fecha:', error, fecha)
            return 'Error en fecha'
        }
    }

    const getImportanciaColor = (importancia: string) => {
        const nivel = mapearImportancia(importancia)
        switch (nivel) {
            case 'alto':
                return 'text-red-400 bg-red-500/20 border-red-500/30'
            case 'medio':
                return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
            case 'bajo':
                return 'text-green-400 bg-green-500/20 border-green-500/30'
            case 'informativo':
                return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
            default:
                return 'text-zinc-400 bg-zinc-500/20 border-zinc-500/30'
        }
    }

    const mapearImportancia = (importancia: string) => {
        // Mapear números a texto para compatibilidad con datos existentes
        switch (importancia) {
            case '1':
            case 'informativo':
                return 'informativo'
            case '2':
            case 'bajo':
                return 'bajo'
            case '3':
            case 'medio':
                return 'medio'
            case '4':
            case 'alto':
                return 'alto'
            default:
                return 'informativo'
        }
    }

    const getImportanciaOrder = (importancia: string) => {
        const nivel = mapearImportancia(importancia)
        switch (nivel) {
            case 'alto': return 1
            case 'medio': return 2
            case 'bajo': return 3
            case 'informativo': return 4
            default: return 5
        }
    }

    const getItemStyle = (importancia: string) => {
        const nivel = mapearImportancia(importancia)
        if (nivel === 'alto') {
            return 'bg-zinc-800 border border-red-500/40 rounded-lg p-4 shadow-lg shadow-red-500/10'
        }
        return 'bg-zinc-800 border border-zinc-700 rounded-lg p-4'
    }

    const handleNuevaNota = () => {
        setFormData({ comentario: '', importancia: 'informativo' })
        setEditandoId(null)
        setIsModalOpen(true)
    }

    const handleEditarNota = (item: BitacoraItem) => {
        setFormData({
            comentario: item.comentario,
            importancia: mapearImportancia(item.importancia) // Usar la versión mapeada
        })
        setEditandoId(item.id)
        setIsModalOpen(true)
        setMenuAbierto(null)
    }

    const handleGuardarNota = async () => {
        if (!formData.comentario.trim()) {
            alert('Por favor escribe un comentario')
            return
        }

        setGuardando(true)
        try {
            if (editandoId) {
                // Actualizar nota existente con importancia
                await actualizarBitacoraEvento(editandoId, formData.comentario, formData.importancia)
            } else {
                // Crear nueva nota con importancia
                await crearBitacoraEvento(eventoId, formData.comentario, formData.importancia)
            }

            await cargarBitacora()
            setIsModalOpen(false)
            setFormData({ comentario: '', importancia: 'informativo' })
            setEditandoId(null)
        } catch (error) {
            console.error('Error guardando nota:', error)
            alert('Error al guardar la nota')
        } finally {
            setGuardando(false)
        }
    }

    const handleEliminarNota = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta nota?')) return

        try {
            await eliminarBitacoraEvento(id)
            await cargarBitacora()
            setMenuAbierto(null)
        } catch (error) {
            console.error('Error eliminando nota:', error)
            alert('Error al eliminar la nota')
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
                <h3 className="text-lg font-semibold text-zinc-200 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Bitácora del Evento
                    {bitacora.length > 0 && (
                        <span className="px-2 py-1 rounded-md text-xs bg-zinc-700 text-zinc-300 border border-zinc-600">
                            {bitacora.length}
                        </span>
                    )}
                </h3>

                <button
                    onClick={handleNuevaNota}
                    className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
                    title="Agregar nota"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="p-6">
                {bitacora.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="space-y-2">
                            <AlertCircle className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                            <p className="text-zinc-500 text-sm">
                                No hay registros en la bitácora
                            </p>
                            <p className="text-zinc-600 text-xs">
                                Los eventos y cambios aparecerán aquí automáticamente
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bitacora
                            .sort((a, b) => {
                                // Primero ordenar por importancia, luego por fecha (más reciente primero)
                                const orderA = getImportanciaOrder(a.importancia)
                                const orderB = getImportanciaOrder(b.importancia)

                                if (orderA !== orderB) {
                                    return orderA - orderB
                                }

                                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                            })
                            .slice(0, 10)
                            .map((item) => (
                                <div
                                    key={item.id}
                                    className={getItemStyle(item.importancia)}
                                >
                                    {/* Contenido minimalista */}
                                    <div className="space-y-2">
                                        {/* Primera línea: etiqueta + comentario + menú */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                <span className={`px-2 py-1 rounded-md text-xs border ${getImportanciaColor(item.importancia)}`}>
                                                    {mapearImportancia(item.importancia).charAt(0).toUpperCase() + mapearImportancia(item.importancia).slice(1)}
                                                </span>
                                                <p className="text-zinc-200 text-sm leading-relaxed flex-1">
                                                    {item.comentario}
                                                </p>
                                            </div>

                                            {/* Menú contextual */}
                                            <div className="relative menu-container flex-shrink-0">
                                                <button
                                                    onClick={() => setMenuAbierto(menuAbierto === item.id ? null : item.id)}
                                                    className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 rounded-md transition-colors"
                                                >
                                                    <MoreVertical className="w-3 h-3" />
                                                </button>

                                                {menuAbierto === item.id && (
                                                    <div className="absolute right-0 top-6 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg py-1 z-10 min-w-32">
                                                        <button
                                                            onClick={() => handleEditarNota(item)}
                                                            className="w-full px-3 py-2 text-left text-zinc-200 hover:bg-zinc-700 flex items-center gap-2 text-sm"
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleEliminarNota(item.id)}
                                                            className="w-full px-3 py-2 text-left text-red-400 hover:bg-zinc-700 flex items-center gap-2 text-sm"
                                                        >
                                                            <Trash className="w-3 h-3" />
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Segunda línea: fecha */}
                                        <div className="flex items-center gap-1 text-xs text-zinc-500 ml-12">
                                            <Clock className="h-3 w-3" />
                                            {formatearFecha(item.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            ))}

                        {bitacora.length > 10 && (
                            <div className="text-center pt-4 border-t border-zinc-700">
                                <p className="text-sm text-zinc-500">
                                    Se muestran los últimos 10 registros de {bitacora.length} total
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal para crear/editar nota */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                    <div className="bg-zinc-800 rounded-lg shadow-lg p-6 w-full max-w-md m-4">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-zinc-200">
                                {editandoId ? 'Editar nota' : 'Nueva nota'}
                            </h2>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false)
                                    setFormData({ comentario: '', importancia: 'informativo' })
                                    setEditandoId(null)
                                }}
                                className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Formulario */}
                        <div className="space-y-4">
                            {/* Importancia */}
                            <div>
                                <label className="block text-zinc-400 text-sm font-medium mb-2">
                                    Importancia
                                </label>
                                <select
                                    value={formData.importancia}
                                    onChange={(e) => setFormData({ ...formData, importancia: e.target.value })}
                                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-200 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="informativo">Informativo</option>
                                    <option value="bajo">Baja</option>
                                    <option value="medio">Media</option>
                                    <option value="alto">Alta</option>
                                </select>
                            </div>

                            {/* Comentario */}
                            <div>
                                <label className="block text-zinc-400 text-sm font-medium mb-2">
                                    Comentario *
                                </label>
                                <textarea
                                    value={formData.comentario}
                                    onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
                                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-200 focus:outline-none focus:border-blue-500"
                                    rows={4}
                                    placeholder="Escribe tu nota aquí..."
                                    required
                                />
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setIsModalOpen(false)
                                    setFormData({ comentario: '', importancia: 'informativo' })
                                    setEditandoId(null)
                                }}
                                className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-md transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleGuardarNota}
                                disabled={guardando || !formData.comentario.trim()}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {guardando ? 'Guardando...' : (editandoId ? 'Actualizar' : 'Crear')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
