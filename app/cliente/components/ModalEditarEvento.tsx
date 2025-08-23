'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { EventoDetalle } from '../_lib/types'
import { X, Save, MapPin, Calendar } from 'lucide-react'

interface Props {
    evento: EventoDetalle | null
    isOpen: boolean
    onClose: () => void
    onSave: (datos: EventoEditData) => void
}

export interface EventoEditData {
    nombre: string
    direccion: string
    sede: string
}

export default function ModalEditarEvento({ evento, isOpen, onClose, onSave }: Props) {
    const [formData, setFormData] = useState<EventoEditData>({
        nombre: '',
        direccion: '',
        sede: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Actualizar form data cuando cambie el evento
    useEffect(() => {
        if (evento) {
            setFormData({
                nombre: evento.nombre || '',
                direccion: evento.direccion || '',
                sede: evento.sede || ''
            })
        }
    }, [evento])

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

        setLoading(true)
        setError('')

        try {
            await onSave(formData)
            onClose()
        } catch (error) {
            console.error('Error al guardar evento:', error)
            setError('Error al guardar los cambios')
        } finally {
            setLoading(false)
        }
    }

    if (!evento) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <div className="flex justify-between items-center">
                        <DialogTitle className="text-xl font-bold text-zinc-100">
                            Editar Evento
                        </DialogTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-zinc-400 hover:text-zinc-100"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Información actual */}
                    <div className="bg-zinc-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-blue-400" />
                            <span className="text-sm text-zinc-400">Evento actual</span>
                        </div>
                        <h3 className="font-semibold text-zinc-100">{evento.nombre}</h3>
                        <p className="text-sm text-zinc-400">{evento.lugar || 'Sin ubicación'}</p>
                    </div>

                    {/* Formulario de edición */}
                    <div className="space-y-4">
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

                        {/* Dirección */}
                        <div className="space-y-2">
                            <Label htmlFor="direccion" className="text-zinc-300">
                                Dirección
                            </Label>
                            <Input
                                id="direccion"
                                type="text"
                                value={formData.direccion}
                                onChange={(e) => handleInputChange('direccion', e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                                placeholder="Ej: Av. Reforma 123, Col. Centro"
                            />
                        </div>

                        {/* Sede/Lugar */}
                        <div className="space-y-2">
                            <Label htmlFor="sede" className="text-zinc-300">
                                Sede o lugar del evento
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
                            onClick={onClose}
                            className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
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
            </DialogContent>
        </Dialog>
    )
}
