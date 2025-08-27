'use client'
import React, { useState, useEffect } from 'react'
import { Building2, Upload, Save, Globe, Mail, Phone, MapPin, AlertCircle, CheckCircle } from 'lucide-react'
import { obtenerNegocio, guardarNegocio, type NegocioData } from '@/app/admin/_lib/actions/negocio/negocio.actions'

export default function NegocioPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [negocio, setNegocio] = useState<NegocioData>({
        nombre: '',
        descripcion: '',
        direccion: '',
        telefono: '',
        email: '',
        sitioWeb: '',
        logoUrl: '',
        isotipoUrl: '',
        moneda: 'MXN',
        timezone: 'America/Mexico_City',
        idioma: 'es'
    })

    // Cargar datos al montar el componente
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true)
                const datos = await obtenerNegocio()
                if (datos) {
                    setNegocio(datos)
                }
            } catch (error) {
                console.error('Error al cargar datos:', error)
                setMessage({
                    type: 'error',
                    text: 'Error al cargar la información del negocio'
                })
            } finally {
                setLoading(false)
            }
        }

        cargarDatos()
    }, [])

    const handleInputChange = (field: keyof NegocioData, value: string) => {
        setNegocio(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSave = async () => {
        if (!negocio.nombre.trim()) {
            setMessage({
                type: 'error',
                text: 'El nombre del negocio es obligatorio'
            })
            return
        }

        setSaving(true)
        setMessage(null)

        try {
            const resultado = await guardarNegocio(negocio)
            
            if (resultado.success) {
                setMessage({
                    type: 'success',
                    text: resultado.message || 'Información guardada correctamente'
                })
                // Si es un nuevo negocio, actualizar el estado con el ID
                if (resultado.data && !negocio.id) {
                    setNegocio(prev => ({ ...prev, id: resultado.data.id }))
                }
            } else {
                setMessage({
                    type: 'error',
                    text: resultado.error || 'Error al guardar la información'
                })
            }
        } catch (error) {
            console.error('Error al guardar:', error)
            setMessage({
                type: 'error',
                text: 'Error inesperado al guardar la información'
            })
        } finally {
            setSaving(false)
        }
    }

    const handleImageUpload = async (type: 'logo' | 'isotipo', file: File) => {
        // TODO: Implementar subida de imágenes
        console.log(`Subiendo ${type}:`, file.name)
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center min-h-96">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="ml-3 text-zinc-400">Cargando información...</span>
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-2">
                            <Building2 className="w-8 h-8 text-blue-500" />
                            <h1 className="text-3xl font-bold text-white">Información del Negocio</h1>
                        </div>
                        <p className="text-zinc-400">
                            Configura la información básica de tu empresa, logotipos y datos de contacto
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Información Básica */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                        <h2 className="text-xl font-semibold text-white mb-4">Datos Generales</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Nombre del Negocio *
                                </label>
                                <input
                                    type="text"
                                    value={negocio.nombre}
                                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ej: ProSocial Events"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    value={negocio.descripcion}
                                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Describe tu negocio brevemente..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-1" />
                                    Dirección
                                </label>
                                <input
                                    type="text"
                                    value={negocio.direccion}
                                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Dirección completa"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    <Phone className="w-4 h-4 inline mr-1" />
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    value={negocio.telefono}
                                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="+52 55 1234 5678"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    <Mail className="w-4 h-4 inline mr-1" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={negocio.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="contacto@empresa.com"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    <Globe className="w-4 h-4 inline mr-1" />
                                    Sitio Web
                                </label>
                                <input
                                    type="url"
                                    value={negocio.sitioWeb}
                                    onChange={(e) => handleInputChange('sitioWeb', e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://www.empresa.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Configuración Regional */}
                    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                        <h2 className="text-xl font-semibold text-white mb-4">Configuración Regional</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Moneda
                                </label>
                                <select
                                    value={negocio.moneda}
                                    onChange={(e) => handleInputChange('moneda', e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="MXN">MXN - Peso Mexicano</option>
                                    <option value="USD">USD - Dólar Americano</option>
                                    <option value="EUR">EUR - Euro</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Zona Horaria
                                </label>
                                <select
                                    value={negocio.timezone}
                                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="America/Mexico_City">México Central</option>
                                    <option value="America/Tijuana">México Pacífico</option>
                                    <option value="America/New_York">Estados Unidos Este</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Idioma
                                </label>
                                <select
                                    value={negocio.idioma}
                                    onChange={(e) => handleInputChange('idioma', e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="es">Español</option>
                                    <option value="en">English</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel de Imágenes */}
                <div className="space-y-6">
                    {/* Logotipo */}
                    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                        <h3 className="text-lg font-semibold text-white mb-4">Logotipo</h3>
                        <div className="space-y-4">
                            <div className="w-full h-32 bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-600 flex items-center justify-center">
                                {negocio.logoUrl ? (
                                    <img
                                        src={negocio.logoUrl}
                                        alt="Logo"
                                        className="max-h-full max-w-full object-contain"
                                    />
                                ) : (
                                    <div className="text-center text-zinc-500">
                                        <Upload className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-sm">Subir logotipo</p>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                onChange={(e) => e.target.files?.[0] && handleImageUpload('logo', e.target.files[0])}
                            />
                            <p className="text-xs text-zinc-500">Recomendado: PNG o SVG, máximo 2MB</p>
                        </div>
                    </div>

                    {/* Isotipo */}
                    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                        <h3 className="text-lg font-semibold text-white mb-4">Isotipo (Icono)</h3>
                        <div className="space-y-4">
                            <div className="w-full h-32 bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-600 flex items-center justify-center">
                                {negocio.isotipoUrl ? (
                                    <img
                                        src={negocio.isotipoUrl}
                                        alt="Isotipo"
                                        className="max-h-full max-w-full object-contain"
                                    />
                                ) : (
                                    <div className="text-center text-zinc-500">
                                        <Upload className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-sm">Subir isotipo</p>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                onChange={(e) => e.target.files?.[0] && handleImageUpload('isotipo', e.target.files[0])}
                            />
                            <p className="text-xs text-zinc-500">
                                Para favicon y apps. Cuadrado, PNG o ICO, máximo 1MB
                            </p>
                        </div>
                    </div>

                    {/* Botón Guardar */}
                    <button
                        onClick={handleSave}
                        disabled={saving || !negocio.nombre}
                        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                        <Save className="w-4 h-4" />
                        <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
                    </button>
                </div>
            </div>
                </>
            )}
        </div>
    )
}
