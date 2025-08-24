'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { ArrowLeft, Save } from 'lucide-react'
import { useClienteAuth } from '../../../../hooks'
import { obtenerEventoDetalle, editarEvento } from '../../../../_lib/actions/evento.actions'
import { EventoDetalle } from '../../../../_lib/types'
import { EditarEventoSkeleton } from '../../../../components/ui/skeleton'

interface EventoEditData {
    nombre: string
    direccion: string
    sede: string
}

export default function EditarEventoPage() {
    const [evento, setEvento] = useState<EventoDetalle | null>(null)
    const [formData, setFormData] = useState<EventoEditData>({
        nombre: '',
        direccion: '',
        sede: ''
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const { cliente, isAuthenticated } = useClienteAuth()
    const router = useRouter()
    const params = useParams()
    const eventoId = params?.eventoId as string

    useEffect(() => {
        if (!isAuthenticated || !cliente || !eventoId) {
            return
        }

        const fetchEvento = async () => {
            try {
                setLoading(true)
                console.log('🔄 Cargando evento para editar:', eventoId)

                const response = await obtenerEventoDetalle(eventoId)

                if (response.success && response.data) {
                    setEvento(response.data)
                    setFormData({
                        nombre: response.data.nombre || '',
                        direccion: response.data.direccion || '',
                        sede: response.data.sede || ''
                    })
                } else {
                    console.error('❌ Error al cargar evento:', response.message)
                    setError(response.message || 'Error al cargar el evento')
                }
            } catch (error) {
                console.error('❌ Error al cargar evento:', error)
                setError('Error al cargar el evento')
            } finally {
                setLoading(false)
            }
        }

        fetchEvento()
    }, [isAuthenticated, cliente, eventoId])

    const handleInputChange = (field: keyof EventoEditData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
        setError('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.nombre.trim()) {
            setError('El nombre del evento es requerido')
            return
        }

        setSaving(true)
        setError('')

        try {
            console.log('🔄 Guardando cambios del evento:', eventoId)
            const response = await editarEvento(eventoId, formData)

            if (response.success) {
                console.log('✅ Evento actualizado correctamente')
                router.push('/cliente/dashboard')
            } else {
                setError(response.message || 'Error al guardar los cambios')
            }
        } catch (error) {
            console.error('❌ Error al guardar evento:', error)
            setError('Error al guardar los cambios')
        } finally {
            setSaving(false)
        }
    }

    if (!isAuthenticated || loading) {
        return <EditarEventoSkeleton />
    }

    if (error && !evento) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto">
                    <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-red-400 mb-2">
                            Error al cargar el evento
                        </h3>
                        <p className="text-red-300 mb-4">{error}</p>
                        <Button onClick={() => router.push('/cliente/dashboard')}>
                            Volver al Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Header */}
            <div className="bg-zinc-900 shadow-sm border-b border-zinc-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6 space-y-4">
                        {/* Línea 1: Botón de regresar */}
                        <div className="flex items-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/cliente/dashboard')}
                                className="text-zinc-400 hover:text-zinc-100"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver al Dashboard
                            </Button>
                        </div>

                        {/* Línea 2: Títulos */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-100">Edición Básica del Evento</h1>
                                <p className="text-zinc-400">Actualización de Información</p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Formulario de edición */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-zinc-100">Editar Información</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Nombre del evento */}
                            <div className="space-y-2">
                                <Label htmlFor="nombre" className="text-zinc-300">
                                    Nombre del evento *
                                </Label>
                                <Input
                                    id="nombre"
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                                    placeholder="Ej: Boda de María y Juan"
                                    required
                                />
                            </div>

                            {/* Sede/Lugar */}
                            <div className="space-y-2">
                                <Label htmlFor="sede" className="text-zinc-300">
                                    Nombre de la Sede o lugar del evento
                                </Label>
                                <Input
                                    id="sede"
                                    type="text"
                                    value={formData.sede}
                                    onChange={(e) => handleInputChange('sede', e.target.value)}
                                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                                    placeholder="Ej: Jardín Botánico, Salón Los Pinos"
                                />
                            </div>

                            {/* Dirección */}
                            <div className="space-y-2">
                                <Label htmlFor="direccion" className="text-zinc-300">
                                    Dirección
                                </Label>
                                <textarea
                                    id="direccion"
                                    value={formData.direccion}
                                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                                    className="bg-zinc-800 border-zinc-700 text-zinc-100 rounded-md px-3 py-2 w-full min-h-[60px] resize-y"
                                    placeholder="Ej: Av. Reforma 123, Col. Centro"
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            {/* Botones */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/cliente/dashboard')}
                                    className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                    disabled={saving}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin" />
                                            Guardando...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Save className="h-4 w-4" />
                                            Guardar cambios
                                        </div>
                                    )}
                                </Button>
                            </div>

                            {/* Información adicional */}
                            <div className="text-xs text-zinc-500 bg-zinc-800/50 rounded-lg p-3">
                                <p>• Solo puedes editar información básica del evento</p>
                                <p>• Los cambios se actualizarán en tiempo real</p>
                                <p>• Para cambios mayores contacta a tu coordinador</p>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
