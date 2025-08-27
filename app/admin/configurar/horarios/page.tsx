'use client'
import React, { useState, useEffect } from 'react'
import { Clock, Save, ToggleLeft, ToggleRight, AlertCircle, CheckCircle } from 'lucide-react'
import { obtenerHorarios, guardarHorarios, type NegocioHorariosData } from '@/app/admin/_lib/actions/negocio/negocio.actions'

const DIAS_SEMANA = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado'
]

export default function HorariosPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [horarios, setHorarios] = useState<NegocioHorariosData[]>([])

    // Cargar datos al montar el componente
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true)
                const datos = await obtenerHorarios()
                setHorarios(datos)
            } catch (error) {
                console.error('Error al cargar horarios:', error)
                setMessage({
                    type: 'error',
                    text: 'Error al cargar los horarios'
                })
            } finally {
                setLoading(false)
            }
        }

        cargarDatos()
    }, [])

    const handleHorarioChange = (diaSemana: number, field: keyof NegocioHorariosData, value: any) => {
        setHorarios(prev => prev.map(horario =>
            horario.diaSemana === diaSemana
                ? { ...horario, [field]: value }
                : horario
        ))
    }

    const toggleDia = (diaSemana: number) => {
        setHorarios(prev => prev.map(horario =>
            horario.diaSemana === diaSemana
                ? {
                    ...horario,
                    cerrado: !horario.cerrado,
                    horaInicio: !horario.cerrado ? undefined : '09:00',
                    horaFin: !horario.cerrado ? undefined : '18:00'
                }
                : horario
        ))
    }

    const aplicarATodos = (horaInicio: string, horaFin: string) => {
        setHorarios(prev => prev.map(horario =>
            !horario.cerrado
                ? { ...horario, horaInicio, horaFin }
                : horario
        ))
    }

    const handleSave = async () => {
        setSaving(true)
        setMessage(null)

        try {
            const resultado = await guardarHorarios(horarios)
            
            if (resultado.success) {
                setMessage({
                    type: 'success',
                    text: resultado.message || 'Horarios guardados correctamente'
                })
            } else {
                setMessage({
                    type: 'error',
                    text: resultado.error || 'Error al guardar los horarios'
                })
            }
        } catch (error) {
            console.error('Error al guardar horarios:', error)
            setMessage({
                type: 'error',
                text: 'Error inesperado al guardar los horarios'
            })
        } finally {
            setSaving(false)
        }
    }

    const getHorario = (diaSemana: number) => {
        return horarios.find(h => h.diaSemana === diaSemana) || { diaSemana, cerrado: true }
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center min-h-96">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="ml-3 text-zinc-400">Cargando horarios...</span>
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-2">
                            <Clock className="w-8 h-8 text-blue-500" />
                            <h1 className="text-3xl font-bold text-white">Horarios de Atención</h1>
                        </div>
                        <p className="text-zinc-400">
                            Define los horarios en que tu negocio está disponible para atender clientes
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
                {/* Acciones Rápidas */}
                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                    <h2 className="text-xl font-semibold text-white mb-4">Acciones Rápidas</h2>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => aplicarATodos('09:00', '18:00')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                        >
                            Aplicar 9:00-18:00 a todos
                        </button>
                        <button
                            onClick={() => aplicarATodos('08:00', '20:00')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                        >
                            Aplicar 8:00-20:00 a todos
                        </button>
                        <button
                            onClick={() => aplicarATodos('10:00', '19:00')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                        >
                            Aplicar 10:00-19:00 a todos
                        </button>
                    </div>
                </div>

                {/* Configuración de Horarios */}
                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                    <h2 className="text-xl font-semibold text-white mb-6">Configurar por Día</h2>

                    <div className="space-y-4">
                        {DIAS_SEMANA.map((nombreDia, index) => {
                            const horario = getHorario(index)

                            return (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 bg-zinc-800 rounded-lg">
                                    {/* Nombre del día */}
                                    <div className="md:col-span-2">
                                        <span className="font-medium text-white">
                                            {nombreDia}
                                        </span>
                                    </div>

                                    {/* Toggle Abierto/Cerrado */}
                                    <div className="md:col-span-2">
                                        <button
                                            onClick={() => toggleDia(index)}
                                            className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-colors ${horario.cerrado
                                                    ? 'bg-red-900 text-red-300'
                                                    : 'bg-green-900 text-green-300'
                                                }`}
                                        >
                                            {horario.cerrado ? (
                                                <>
                                                    <ToggleLeft className="w-4 h-4" />
                                                    <span className="text-sm">Cerrado</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ToggleRight className="w-4 h-4" />
                                                    <span className="text-sm">Abierto</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Horarios */}
                                    {!horario.cerrado ? (
                                        <>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs text-zinc-400 mb-1">Inicio</label>
                                                <input
                                                    type="time"
                                                    value={horario.horaInicio || ''}
                                                    onChange={(e) => handleHorarioChange(index, 'horaInicio', e.target.value)}
                                                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs text-zinc-400 mb-1">Fin</label>
                                                <input
                                                    type="time"
                                                    value={horario.horaFin || ''}
                                                    onChange={(e) => handleHorarioChange(index, 'horaFin', e.target.value)}
                                                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div className="md:col-span-4">
                                                <label className="block text-xs text-zinc-400 mb-1">Notas (opcional)</label>
                                                <input
                                                    type="text"
                                                    value={horario.notas || ''}
                                                    onChange={(e) => handleHorarioChange(index, 'notas', e.target.value)}
                                                    placeholder="Ej: Solo citas"
                                                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="md:col-span-8 flex items-center">
                                            <span className="text-zinc-500 italic">
                                                Día no laborable
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Vista Previa */}
                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                    <h2 className="text-xl font-semibold text-white mb-4">Vista Previa</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {horarios.map((horario) => {
                            const nombreDia = DIAS_SEMANA[horario.diaSemana]

                            return (
                                <div key={horario.diaSemana} className="flex justify-between items-center p-3 bg-zinc-800 rounded">
                                    <span className="font-medium text-white">
                                        {nombreDia}
                                    </span>
                                    <span className={`text-sm ${horario.cerrado ? 'text-red-400' : 'text-green-400'
                                        }`}>
                                        {horario.cerrado
                                            ? 'Cerrado'
                                            : `${horario.horaInicio} - ${horario.horaFin}`
                                        }
                                        {horario.notas && (
                                            <span className="text-zinc-500 ml-2">
                                                ({horario.notas})
                                            </span>
                                        )}
                                    </span>
                                </div>
                            )
                        })}
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
                        <span>{saving ? 'Guardando...' : 'Guardar Horarios'}</span>
                    </button>
                </div>
            </div>
                </>
            )}
        </div>
    )
}
