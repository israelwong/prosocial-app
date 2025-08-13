'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { toast } from 'sonner'
import type { EventoCompleto } from '@/app/admin/_lib/actions/evento/evento/evento.schemas'
import { actualizarCliente, obtenerCanales } from '@/app/admin/_lib/actions/evento/cliente/cliente.actions'
import {
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Tag,
    Edit3,
    Check,
    X,
    ExternalLink
} from 'lucide-react'

interface Props {
    eventoCompleto: EventoCompleto
    showActions?: boolean
}

interface Canal {
    id: string
    nombre: string
}

// Exportamos los botones como un componente separado
export function FichaClienteActions({ eventoCompleto }: { eventoCompleto: EventoCompleto }) {
    const [canales, setCanales] = useState<Canal[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const router = useRouter()

    const cliente = eventoCompleto.Cliente

    // Estados para edición
    const [formData, setFormData] = useState({
        nombre: cliente.nombre || '',
        telefono: cliente.telefono || '',
        email: cliente.email || '',
        direccion: cliente.direccion || '',
        status: cliente.status || 'prospecto',
        canalId: cliente.canalId || ''
    })

    useEffect(() => {
        async function cargarCanales() {
            try {
                const canalesData = await obtenerCanales()
                setCanales(canalesData)
            } catch (error) {
                console.error('Error al cargar canales:', error)
                toast.error('Error al cargar canales')
            } finally {
                setLoading(false)
            }
        }
        cargarCanales()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            await actualizarCliente({
                id: cliente.id,
                ...formData
            })
            toast.success('Cliente actualizado exitosamente')
            setIsEditing(false)
            router.refresh()
        } catch (error) {
            console.error('Error al actualizar cliente:', error)
            toast.error('Error al actualizar cliente')
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setFormData({
            nombre: cliente.nombre || '',
            telefono: cliente.telefono || '',
            email: cliente.email || '',
            direccion: cliente.direccion || '',
            status: cliente.status || 'prospecto',
            canalId: cliente.canalId || ''
        })
        setIsEditing(false)
    }

    if (!isEditing) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-2"
            >
                <Edit3 className="w-4 h-4" />
                Editar
            </Button>
        )
    }

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={saving}
                className="gap-2"
            >
                <X className="w-4 h-4" />
                Cancelar
            </Button>
            <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="gap-2"
            >
                <Check className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar'}
            </Button>
        </div>
    )
}

export default function FichaClienteUnificadaV2({ eventoCompleto, showActions = true }: Props) {
    const [canales, setCanales] = useState<Canal[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const router = useRouter()

    const cliente = eventoCompleto.Cliente

    // Estados para edición
    const [formData, setFormData] = useState({
        nombre: cliente.nombre || '',
        telefono: cliente.telefono || '',
        email: cliente.email || '',
        direccion: cliente.direccion || '',
        status: cliente.status || 'prospecto',
        canalId: cliente.canalId || ''
    })

    useEffect(() => {
        const cargarCanales = async () => {
            try {
                const canalesData = await obtenerCanales()
                setCanales(canalesData)
            } catch (error) {
                console.error('Error cargando canales:', error)
                toast.error('Error cargando canales')
            } finally {
                setLoading(false)
            }
        }

        cargarCanales()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            await actualizarCliente({
                id: cliente.id,
                ...formData
            })
            setIsEditing(false)
            toast.success('Cliente actualizado correctamente')
            // Refrescar la página para mostrar los datos actualizados
            router.refresh()
        } catch (error) {
            console.error('Error actualizando cliente:', error)
            toast.error('Error al actualizar cliente')
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setFormData({
            nombre: cliente.nombre || '',
            telefono: cliente.telefono || '',
            email: cliente.email || '',
            direccion: cliente.direccion || '',
            status: cliente.status || 'prospecto',
            canalId: cliente.canalId || ''
        })
        setIsEditing(false)
    }

    const abrirWhatsApp = () => {
        if (cliente.telefono) {
            window.open(`https://wa.me/52${cliente.telefono}`, '_blank')
        }
    }

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
                <h3 className="text-lg font-semibold text-zinc-200 border-b border-zinc-700 pb-2">Información del Cliente</h3>
            </div>

            {/* Contenido */}
            <div className="space-y-4">
                {/* Nombre */}
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Nombre
                    </label>
                    {isEditing ? (
                        <Input
                            value={formData.nombre}
                            onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                            className="bg-zinc-800 border-zinc-700"
                        />
                    ) : (
                        <p className="text-zinc-200">{cliente.nombre}</p>
                    )}
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Teléfono
                    </label>
                    {isEditing ? (
                        <Input
                            value={formData.telefono}
                            onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                            className="bg-zinc-800 border-zinc-700"
                        />
                    ) : (
                        <p className="text-zinc-200">{cliente.telefono || 'No especificado'}</p>
                    )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                    </label>
                    {isEditing ? (
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="bg-zinc-800 border-zinc-700"
                        />
                    ) : (
                        <p className="text-zinc-200">{cliente.email || 'No especificado'}</p>
                    )}
                </div>

                {/* Dirección */}
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Dirección
                    </label>
                    {isEditing ? (
                        <Input
                            value={formData.direccion}
                            onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                            className="bg-zinc-800 border-zinc-700"
                        />
                    ) : (
                        <p className="text-zinc-200">{cliente.direccion || 'No especificada'}</p>
                    )}
                </div>

                {/* Canal */}
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Canal
                    </label>
                    {isEditing ? (
                        <select
                            value={formData.canalId}
                            onChange={(e) => setFormData(prev => ({ ...prev, canalId: e.target.value }))}
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-200"
                        >
                            <option value="">Sin canal</option>
                            {canales.map(canal => (
                                <option key={canal.id} value={canal.id}>
                                    {canal.nombre}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <p className="text-zinc-200">{cliente.Canal?.nombre || 'Sin canal'}</p>
                    )}
                </div>

                {/* Fecha de registro */}
                <div className="space-y-2">
                    <label className="text-sm text-zinc-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Fecha de registro
                    </label>
                    <p className="text-zinc-200">
                        {new Date(cliente.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
            </div>

            {/* Footer con botones de acción */}
            {showActions && (
                <div className="border-t border-zinc-700 pt-3 mt-4">
                    <div className="flex gap-2 justify-center md:justify-start">
                        {!isEditing ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-blue-100 border border-blue-600 rounded-md hover:bg-blue-600 transition-colors"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    Editar
                                </button>
                                {cliente.telefono && (
                                    <button
                                        onClick={abrirWhatsApp}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-700 text-green-100 border border-green-600 rounded-md hover:bg-green-600 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        WhatsApp
                                    </button>
                                )}
                            </>
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
                    </div>
                </div>
            )}
        </div>
    )
}
