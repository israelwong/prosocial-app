'use client'
import React, { useState, useEffect } from 'react'
import { Share2, Save, Plus, Trash2, Eye, EyeOff, GripVertical, AlertCircle, CheckCircle } from 'lucide-react'
import { obtenerRedesSociales, guardarRedesSociales, type NegocioRRSSData } from '@/app/admin/_lib/actions/negocio/negocio.actions'

interface RedSocialData {
    id?: string
    plataforma: string
    username?: string
    url: string
    activo: boolean
    orden: number
}

// Iconos y colores para cada plataforma
const PLATAFORMAS = {
    facebook: { name: 'Facebook', color: 'bg-blue-600', icon: '📘' },
    instagram: { name: 'Instagram', color: 'bg-pink-500', icon: '📷' },
    twitter: { name: 'Twitter/X', color: 'bg-black', icon: '🐦' },
    linkedin: { name: 'LinkedIn', color: 'bg-blue-700', icon: '💼' },
    tiktok: { name: 'TikTok', color: 'bg-black', icon: '🎵' },
    youtube: { name: 'YouTube', color: 'bg-red-600', icon: '📹' },
    whatsapp: { name: 'WhatsApp', color: 'bg-green-600', icon: '📞' },
    telegram: { name: 'Telegram', color: 'bg-blue-500', icon: '✈️' },
    pinterest: { name: 'Pinterest', color: 'bg-red-500', icon: '📌' },
    snapchat: { name: 'Snapchat', color: 'bg-yellow-400', icon: '👻' }
}

export default function RedesSocialesPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [redesSociales, setRedesSociales] = useState<NegocioRRSSData[]>([])

    const [nuevaRed, setNuevaRed] = useState<Partial<NegocioRRSSData>>({
        plataforma: 'facebook',
        username: '',
        url: '',
        activo: true,
        orden: 1
    })

    const [mostrarFormulario, setMostrarFormulario] = useState(false)

    // Cargar datos al montar el componente
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true)
                const datos = await obtenerRedesSociales()
                setRedesSociales(datos)
            } catch (error) {
                console.error('Error al cargar redes sociales:', error)
                setMessage({
                    type: 'error',
                    text: 'Error al cargar las redes sociales'
                })
            } finally {
                setLoading(false)
            }
        }

        cargarDatos()
    }, [])

    const handleInputChange = (index: number, field: keyof NegocioRRSSData, value: any) => {
        setRedesSociales(prev => prev.map((red, i) => 
            i === index ? { ...red, [field]: value } : red
        ))
    }

    const toggleActivo = (index: number) => {
        setRedesSociales(prev => prev.map((red, i) =>
            i === index ? { ...red, activo: !red.activo } : red
        ))
    }

    const eliminarRed = (index: number) => {
        setRedesSociales(prev => prev.filter((_, i) => i !== index))
    }

    const agregarRed = () => {
        if (!nuevaRed.url) return

        const redCompleta: NegocioRRSSData = {
            plataforma: nuevaRed.plataforma!,
            username: nuevaRed.username || '',
            url: nuevaRed.url!,
            activo: nuevaRed.activo!,
            orden: redesSociales.length + 1
        }

        setRedesSociales(prev => [...prev, redCompleta])
        setNuevaRed({
            plataforma: 'facebook',
            username: '',
            url: '',
            activo: true,
            orden: redesSociales.length + 2
        })
        setMostrarFormulario(false)
    }

    const handleSave = async () => {
        setSaving(true)
        setMessage(null)

        try {
            const resultado = await guardarRedesSociales(redesSociales)
            
            if (resultado.success) {
                setMessage({
                    type: 'success',
                    text: resultado.message || 'Redes sociales guardadas correctamente'
                })
            } else {
                setMessage({
                    type: 'error',
                    text: resultado.error || 'Error al guardar las redes sociales'
                })
            }
        } catch (error) {
            console.error('Error al guardar redes sociales:', error)
            setMessage({
                type: 'error',
                text: 'Error inesperado al guardar las redes sociales'
            })
        } finally {
            setSaving(false)
        }
    }

    const getPlatformInfo = (plataforma: string) => {
        return PLATAFORMAS[plataforma as keyof typeof PLATAFORMAS] || {
            name: plataforma,
            color: 'bg-zinc-600',
            icon: '🔗'
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center min-h-96">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="ml-3 text-zinc-400">Cargando redes sociales...</span>
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-2">
                            <Share2 className="w-8 h-8 text-blue-500" />
                            <h1 className="text-3xl font-bold text-white">Redes Sociales</h1>
                        </div>
                        <p className="text-zinc-400">
                            Configura los enlaces a las redes sociales de tu negocio
                        </p>
                    </div>

                    {/* Mensaje de feedback */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
                            message.type === 'success' 
                                ? 'bg-green-900/30 border border-green-700 text-green-300' 
                                : 'bg-red-900/30 border border-red-700 text-red-300'
                        }`}>
                            {message.type === 'success' ? (
                                <CheckCircle className="w-5 h-5" />
                            ) : (
                                <AlertCircle className="w-5 h-5" />
                            )}
                            <span>{message.text}</span>
                        </div>
                    )}

            <div className="space-y-6">
                {/* Lista de Redes Sociales */}
                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white">Redes Configuradas</h2>
                        <button
                            onClick={() => setMostrarFormulario(!mostrarFormulario)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Agregar Red Social</span>
                        </button>
                    </div>

                    {/* Lista de redes */}
                    <div className="space-y-4">
                        {redesSociales.map((red, index) => {
                            const platformInfo = getPlatformInfo(red.plataforma)

                            return (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 bg-zinc-800 rounded-lg">
                                    {/* Drag handle */}
                                    <div className="md:col-span-1 flex justify-center">
                                        <GripVertical className="w-4 h-4 text-zinc-500 cursor-move" />
                                    </div>

                                    {/* Plataforma */}
                                    <div className="md:col-span-2 flex items-center space-x-2">
                                        <div className={`w-8 h-8 ${platformInfo.color} rounded-full flex items-center justify-center text-white text-xs`}>
                                            {platformInfo.icon}
                                        </div>
                                        <span className="text-white font-medium">
                                            {platformInfo.name}
                                        </span>
                                    </div>

                                    {/* Username */}
                                    <div className="md:col-span-2">
                                        <input
                                            type="text"
                                            value={red.username || ''}
                                            onChange={(e) => handleInputChange(index, 'username', e.target.value)}
                                            placeholder="@usuario"
                                            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* URL */}
                                    <div className="md:col-span-4">
                                        <input
                                            type="url"
                                            value={red.url}
                                            onChange={(e) => handleInputChange(index, 'url', e.target.value)}
                                            placeholder="https://..."
                                            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Acciones */}
                                    <div className="md:col-span-3 flex items-center justify-end space-x-2">
                                        {/* Toggle activo */}
                                        <button
                                            onClick={() => toggleActivo(index)}
                                            className={`p-2 rounded transition-colors ${red.activo
                                                    ? 'text-green-400 hover:bg-green-900'
                                                    : 'text-zinc-500 hover:bg-zinc-700'
                                                }`}
                                            title={red.activo ? 'Ocultar' : 'Mostrar'}
                                        >
                                            {red.activo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>

                                        {/* Eliminar */}
                                        <button
                                            onClick={() => eliminarRed(index)}
                                            className="p-2 text-red-400 hover:bg-red-900 rounded transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}

                        {redesSociales.length === 0 && (
                            <div className="text-center py-12 text-zinc-500">
                                <Share2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No hay redes sociales configuradas</p>
                                <p className="text-sm">Agrega tu primera red social usando el botón de arriba</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Formulario para agregar nueva red */}
                {mostrarFormulario && (
                    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 border-l-4 border-l-blue-500">
                        <h3 className="text-lg font-semibold text-white mb-4">Agregar Nueva Red Social</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Plataforma
                                </label>
                                <select
                                    value={nuevaRed.plataforma}
                                    onChange={(e) => setNuevaRed(prev => ({ ...prev, plataforma: e.target.value }))}
                                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {Object.entries(PLATAFORMAS).map(([key, info]) => (
                                        <option key={key} value={key}>
                                            {info.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Usuario (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={nuevaRed.username || ''}
                                    onChange={(e) => setNuevaRed(prev => ({ ...prev, username: e.target.value }))}
                                    placeholder="@usuario"
                                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    URL *
                                </label>
                                <input
                                    type="url"
                                    value={nuevaRed.url || ''}
                                    onChange={(e) => setNuevaRed(prev => ({ ...prev, url: e.target.value }))}
                                    placeholder="https://..."
                                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setMostrarFormulario(false)}
                                className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={agregarRed}
                                disabled={!nuevaRed.url}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                            >
                                Agregar Red Social
                            </button>
                        </div>
                    </div>
                )}

                {/* Vista Previa */}
                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                    <h2 className="text-xl font-semibold text-white mb-4">Vista Previa</h2>
                    <p className="text-zinc-400 mb-4">Así se verán tus redes sociales en el sitio web:</p>

                    <div className="flex flex-wrap gap-3">
                        {redesSociales
                            .filter(red => red.activo)
                            .sort((a, b) => a.orden - b.orden)
                            .map((red, index) => {
                                const platformInfo = getPlatformInfo(red.plataforma)

                                return (
                                    <a
                                        key={index}
                                        href={red.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center space-x-2 px-4 py-2 ${platformInfo.color} hover:opacity-90 rounded-full text-white text-sm transition-opacity`}
                                    >
                                        <span>{platformInfo.icon}</span>
                                        <span>{red.username || platformInfo.name}</span>
                                    </a>
                                )
                            })
                        }

                        {redesSociales.filter(red => red.activo).length === 0 && (
                            <p className="text-zinc-500 italic">No hay redes sociales activas</p>
                        )}
                    </div>
                </div>

                {/* Botón Guardar */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
                    >
                        <Save className="w-4 h-4" />
                        <span>{saving ? 'Guardando...' : 'Guardar Redes Sociales'}</span>
                    </button>
                </div>
            </div>
                </>
            )}
        </div>
    )
}
