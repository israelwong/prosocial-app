'use client'
import React, { useState, useEffect } from 'react'
import { Cliente } from '@/app/admin/_lib/types'
import { obtenerCliente, actualizarCliente } from '@/app/admin/_lib/cliente.actions'
import { obtenerCanalesLegacy as obtenerCanales } from '@/app/admin/_lib/actions/canal/canal.actions'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { toast } from 'sonner'
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
    clienteId: string
}

interface Canal {
    id: string
    nombre: string
}

export default function FichaClienteUnificada({ clienteId }: Props) {
    const [cliente, setCliente] = useState<Cliente | null>(null)
    const [canales, setCanales] = useState<Canal[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)

    // Estados para edición
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        email: '',
        direccion: '',
        status: 'prospecto',
        canalId: ''
    })

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [clienteData, canalesData] = await Promise.all([
                    obtenerCliente(clienteId),
                    obtenerCanales()
                ])

                if (clienteData) {
                    setCliente(clienteData)
                    setFormData({
                        nombre: clienteData.nombre ?? '',
                        telefono: clienteData.telefono ?? '',
                        email: clienteData.email ?? '',
                        direccion: clienteData.direccion ?? '',
                        status: clienteData.status ?? 'prospecto',
                        canalId: clienteData.canalId ?? ''
                    })
                }
                setCanales(canalesData)
            } catch (error) {
                console.error('Error cargando datos del cliente:', error)
                toast.error('Error cargando datos del cliente')
            } finally {
                setLoading(false)
            }
        }

        cargarDatos()
    }, [clienteId])

    const handleSave = async () => {
        setSaving(true)
        try {
            const resultado = await actualizarCliente({
                id: clienteId,
                ...formData
            })
            if (resultado && resultado.cliente) {
                setCliente(resultado.cliente)
                setIsEditing(false)
                toast.success('Cliente actualizado correctamente')
            }
        } catch (error) {
            console.error('Error actualizando cliente:', error)
            toast.error('Error al actualizar cliente')
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        if (cliente) {
            setFormData({
                nombre: cliente.nombre ?? '',
                telefono: cliente.telefono ?? '',
                email: cliente.email ?? '',
                direccion: cliente.direccion ?? '',
                status: cliente.status ?? 'prospecto',
                canalId: cliente.canalId ?? ''
            })
        }
        setIsEditing(false)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'prospecto': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            case 'cliente': return 'bg-green-500/20 text-green-400 border-green-500/30'
            case 'inactivo': return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
            default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
        }
    }

    const formatearFecha = (fecha: Date) => {
        return fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const abrirWhatsApp = () => {
        if (cliente?.telefono) {
            const mensaje = `Hola ${cliente.nombre} 👋`
            window.open(`https://wa.me/${cliente.telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')
        }
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

    if (!cliente) {
        return (
            <div className="text-center text-zinc-500 py-4">
                Cliente no encontrado
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-zinc-400" />
                    <h3 className="font-semibold text-zinc-200">Información del Cliente</h3>
                </div>
                {!isEditing ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                    >
                        <Edit3 className="h-3 w-3" />
                    </Button>
                ) : (
                    <div className="flex gap-1">
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
                    </div>
                )}
            </div>

            {/* Contenido */}
            {isEditing ? (
                <div className="space-y-3">
                    <Input
                        value={formData.nombre}
                        onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                        placeholder="Nombre completo"
                        className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-zinc-500"
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            value={formData.telefono}
                            onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                            placeholder="Teléfono"
                            className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-zinc-500"
                        />
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="Email"
                            className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-zinc-500"
                        />
                    </div>

                    <Input
                        value={formData.direccion}
                        onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                        placeholder="Dirección"
                        className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-zinc-500"
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                        >
                            <option value="prospecto">Prospecto</option>
                            <option value="cliente">Cliente</option>
                            <option value="inactivo">Inactivo</option>
                        </select>

                        <select
                            value={formData.canalId}
                            onChange={(e) => setFormData(prev => ({ ...prev, canalId: e.target.value }))}
                            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                        >
                            <option value="">Seleccionar canal</option>
                            {canales.map((canal) => (
                                <option key={canal.id} value={canal.id}>
                                    {canal.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Nombre y Status */}
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-zinc-100">{cliente.nombre}</h4>
                        <span className={`px-2 py-1 rounded-md text-xs border ${getStatusColor(cliente.status || 'prospecto')}`}>
                            {cliente.status || 'prospecto'}
                        </span>
                    </div>

                    {/* Información de contacto */}
                    <div className="space-y-2">
                        {cliente.telefono && (
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-2 text-sm text-zinc-300">
                                    <Phone className="h-3 w-3 text-zinc-500" />
                                    <span>{cliente.telefono}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={abrirWhatsApp}
                                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-green-400 hover:text-green-300"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                </Button>
                            </div>
                        )}

                        {cliente.email && (
                            <div className="flex items-center gap-2 text-sm text-zinc-300">
                                <Mail className="h-3 w-3 text-zinc-500" />
                                <span className="truncate">{cliente.email}</span>
                            </div>
                        )}

                        {cliente.direccion && (
                            <div className="flex items-center gap-2 text-sm text-zinc-300">
                                <MapPin className="h-3 w-3 text-zinc-500" />
                                <span className="truncate">{cliente.direccion}</span>
                            </div>
                        )}
                    </div>

                    {/* Información adicional */}
                    <div className="space-y-1 text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>Creado: {cliente.createdAt ? formatearFecha(new Date(cliente.createdAt)) : 'N/A'}</span>
                        </div>

                        {cliente.canalId && (
                            <div className="flex items-center gap-2">
                                <Tag className="h-3 w-3" />
                                <span>Canal: {canales.find(c => c.id === cliente.canalId)?.nombre || 'N/A'}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
