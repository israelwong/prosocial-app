'use client'
import React, { useState, useEffect } from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import { es } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'
import { useSearchParams, useRouter } from 'next/navigation';
import { User, Users, Rss } from 'lucide-react';
import { obtenerTiposEvento } from '@/app/admin/_lib/actions/evento/tipo/eventoTipo.actions'
import toast from 'react-hot-toast';
import { EventoTipo } from '@prisma/client'

// Registrar localización en español
registerLocale('es', es)

interface LeadFormMOFUProps {
    refSource?: string
}

interface FormData {
    fechaEvento: Date | null
    tipoEventoId: string
    nombreEvento: string
    sede: string
    nombreCliente: string
    telefono: string
    email: string
}

export default function LeadFormMOFU({ refSource }: LeadFormMOFUProps) {
    const [tiposEvento, setTiposEvento] = useState<EventoTipo[]>([])
    const [formData, setFormData] = useState<FormData>({
        fechaEvento: null,
        tipoEventoId: '',
        nombreEvento: '',
        sede: '',
        nombreCliente: '',
        telefono: '',
        email: ''
    })
    const [currentStep, setCurrentStep] = useState(1)
    const [isValidatingDate, setIsValidatingDate] = useState(false)
    const [dateAvailable, setDateAvailable] = useState<boolean | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<{ [key: string]: string }>({})    // Cargar tipos de evento al montar el componente
    useEffect(() => {
        const loadTiposEvento = async () => {
            try {
                const tipos = await obtenerTiposEvento()
                setTiposEvento(tipos)

                // Pre-seleccionar tipo según referencia
                if (refSource && tipos.length > 0) {
                    const tipoSeleccionado = tipos.find(tipo => {
                        if (refSource === 'fifteens') {
                            return tipo.nombre.toLowerCase().includes('xv') || tipo.nombre.toLowerCase().includes('quince')
                        }
                        if (refSource === 'weddings') {
                            return tipo.nombre.toLowerCase().includes('boda') || tipo.nombre.toLowerCase().includes('matrimonio')
                        }
                        return false
                    })

                    if (tipoSeleccionado) {
                        setFormData(prev => ({ ...prev, tipoEventoId: tipoSeleccionado.id }))
                    }
                }
            } catch (error) {
                console.error('Error cargando tipos de evento:', error)
            }
        }

        loadTiposEvento()
    }, [refSource])

    // Validar disponibilidad de fecha
    const validateDateAvailability = async (fecha: string) => {
        if (!fecha) return

        setIsValidatingDate(true)
        try {
            const response = await fetch('/api/validar-fecha-disponible', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fecha })
            })

            const result = await response.json()
            console.log('🔍 Debug validación fecha:', result) // Debug log
            setDateAvailable(result.available)
        } catch (error) {
            console.error('Error validando fecha:', error)
            setDateAvailable(null)
        } finally {
            setIsValidatingDate(false)
        }
    }    // Manejar cambio de fecha con react-datepicker
    const handleDateChange = (date: Date | null) => {
        setFormData(prev => ({ ...prev, fechaEvento: date }))
        setDateAvailable(null)

        if (date) {
            // Validar con debounce - convertir Date a string ISO
            const dateString = date.toISOString().split('T')[0]
            setTimeout(() => validateDateAvailability(dateString), 500)
        }
    }

    // Manejar cambio de campos
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        // Limpiar error del campo
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    // Validar paso actual
    const validateCurrentStep = (): boolean => {
        const newErrors: { [key: string]: string } = {}

        if (currentStep === 1) {
            if (!formData.fechaEvento) newErrors.fechaEvento = 'La fecha del evento es requerida'
            if (!formData.tipoEventoId) newErrors.tipoEventoId = 'El tipo de evento es requerido'
            if (dateAvailable === false) newErrors.fechaEvento = 'La fecha seleccionada no está disponible'
        }

        if (currentStep === 2) {
            if (!formData.nombreCliente) newErrors.nombreCliente = 'Tu nombre es requerido'
            if (!formData.telefono) newErrors.telefono = 'El teléfono es requerido'
            if (!formData.email) newErrors.email = 'El email es requerido'
            if (!formData.nombreEvento) newErrors.nombreEvento = 'El nombre del evento es requerido'
            if (!formData.sede) newErrors.sede = 'El lugar del evento es requerido'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Siguiente paso
    const nextStep = () => {
        if (validateCurrentStep()) {
            setCurrentStep(prev => prev + 1)
        }
    }

    // Enviar formulario
    const handleSubmit = async () => {
        if (!validateCurrentStep()) return

        setIsSubmitting(true)
        try {
            // Preparar datos para envío - convertir fecha a string
            const dataToSend = {
                ...formData,
                fechaEvento: formData.fechaEvento ? formData.fechaEvento.toISOString().split('T')[0] : '',
                canalAdquisicion: 'landing-page',
                referencia: refSource
            }

            const response = await fetch('/api/crear-evento-landing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            })

            const result = await response.json()

            if (result.success) {
                // Redireccionar a la página del evento
                window.location.href = `/evento/${result.eventoId}`
            } else {
                alert('Error creando el evento: ' + result.message)
            }
        } catch (error) {
            console.error('Error enviando formulario:', error)
            alert('Error interno del servidor')
        } finally {
            setIsSubmitting(false)
        }
    }

    const getStepTitle = () => {
        switch (refSource) {
            case 'fifteens':
                return currentStep === 1
                    ? '¿Cuándo será tu Celebración de XV Años?'
                    : 'Cuéntanos más sobre tu Quinceañera'
            case 'weddings':
                return currentStep === 1
                    ? '¿Cuándo será tu Boda?'
                    : 'Cuéntanos más sobre tu boda'
            default:
                return currentStep === 1
                    ? '¿Cuándo será tu Evento?'
                    : 'Cuéntanos más sobre tu Evento'
        }
    }

    return (
        <div className="max-w-2xl mx-auto bg-zinc-800 rounded-lg p-8">
            {/* Indicador de progreso */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-zinc-400">Paso {currentStep} de 2</span>
                    <span className="text-sm text-zinc-400">{currentStep === 1 ? 'Fecha y Tipo' : 'Información Personal'}</span>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / 2) * 100}%` }}
                    />
                </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-6 text-center">
                {getStepTitle()}
            </h2>

            {currentStep === 1 && (
                <div className="space-y-6">
                    {/* Fecha del evento */}
                    <div>
                        <label className="block text-zinc-300 text-sm font-medium mb-2">
                            Fecha del evento
                        </label>

                        <div className="react-datepicker-wrapper w-full">
                            <DatePicker
                                selected={formData.fechaEvento}
                                onChange={handleDateChange}
                                minDate={new Date()}
                                locale="es"
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Selecciona la fecha del evento"
                                className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-zinc-400"
                                wrapperClassName="w-full"
                                calendarClassName="dark-calendar"
                                showPopperArrow={false}
                                popperClassName="z-50"
                            />
                        </div>

                        {isValidatingDate && (
                            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 mt-2">
                                <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-yellow-400 text-sm font-medium">Verificando disponibilidad...</p>
                            </div>
                        )}
                        {errors.fechaEvento && (
                            <p className="text-red-400 text-sm mt-1">{errors.fechaEvento}</p>
                        )}
                    </div>

                    {/* Tipo de evento - Solo mostrar si NO viene con referencia específica */}
                    {!refSource && dateAvailable === true && (
                        <div>
                            <label className="block text-zinc-300 text-sm font-medium mb-2">
                                Tipo de evento
                            </label>
                            <select
                                name="tipoEventoId"
                                value={formData.tipoEventoId}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="">Selecciona el tipo de evento</option>
                                {tiposEvento.map(tipo => (
                                    <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                                ))}
                            </select>
                            {errors.tipoEventoId && (
                                <p className="text-red-400 text-sm mt-1">{errors.tipoEventoId}</p>
                            )}
                        </div>
                    )}

                    {/* Mensaje informativo cuando viene con referencia */}
                    {refSource && dateAvailable === true && (
                        <div className="bg-zinc-700 rounded-lg p-4 border border-zinc-600">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-green-400 font-medium">
                                        ¡Perfecto! Tu fecha está disponible
                                    </p>
                                    <p className="text-zinc-300 text-sm mt-1">
                                        Ahora continuemos con algunos datos adicionales necesarios para maximizar tu experiencia
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mensaje empático cuando fecha no disponible */}
                    {dateAvailable === false && (
                        <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-red-400 font-medium mb-2">
                                        ¡Lo sentimos mucho! 😔
                                    </p>
                                    <p className="text-zinc-300 text-sm mb-3">
                                        La fecha que buscas no está disponible, pero <strong className="text-white">¡no te preocupes!</strong>
                                    </p>
                                    <div className="bg-zinc-700/50 rounded-md p-3">
                                        <p className="text-zinc-200 text-sm">
                                            Por favor, <span className="text-purple-400 font-medium">considéranos para un próximo evento</span>.
                                            Estaremos <span className="text-blue-400 font-medium">encantados de ser parte</span> de ese momento especial.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, fechaEvento: null }))
                                            setDateAvailable(null)
                                        }}
                                        className="mt-3 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                                    >
                                        ✨ Elegir otra fecha
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Botón continuar - Solo mostrar si fecha disponible y tipo seleccionado */}
                    {dateAvailable === true && (
                        <button
                            onClick={nextStep}
                            disabled={!formData.fechaEvento || !formData.tipoEventoId}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-zinc-600 disabled:to-zinc-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
                        >
                            {refSource ? '✨ Continuar con mi evento' : 'Continuar'}
                        </button>
                    )}
                </div>
            )}

            {currentStep === 2 && (
                <div className="space-y-6">
                    {/* Información personal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-zinc-300 text-sm font-medium mb-2">
                                Tu nombre
                            </label>
                            <input
                                type="text"
                                name="nombreCliente"
                                value={formData.nombreCliente}
                                onChange={handleInputChange}
                                placeholder="Ej: María González"
                                className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            {errors.nombreCliente && (
                                <p className="text-red-400 text-sm mt-1">{errors.nombreCliente}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-zinc-300 text-sm font-medium mb-2">
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleInputChange}
                                placeholder="Ej: 5551234567"
                                className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            {errors.telefono && (
                                <p className="text-red-400 text-sm mt-1">{errors.telefono}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-zinc-300 text-sm font-medium mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="tu@email.com"
                            className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        {errors.email && (
                            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-zinc-300 text-sm font-medium mb-2">
                            {refSource === 'fifteens' ? 'Nombre de la quinceañera' : refSource === 'weddings' ? 'Nombres de los novios' : 'Nombre del evento'}
                        </label>
                        <input
                            type="text"
                            name="nombreEvento"
                            value={formData.nombreEvento}
                            onChange={handleInputChange}
                            placeholder={refSource === 'fifteens' ? 'Ej: Carolina' : refSource === 'weddings' ? 'Ej: Pedro y María' : 'Ej: Evento Corporativo'}
                            className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        {errors.nombreEvento && (
                            <p className="text-red-400 text-sm mt-1">{errors.nombreEvento}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-zinc-300 text-sm font-medium mb-2">
                            Lugar del evento
                        </label>
                        <input
                            type="text"
                            name="sede"
                            value={formData.sede}
                            onChange={handleInputChange}
                            placeholder="Ej: Salón Los Pinos, Jardín Andalucía"
                            className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        {errors.sede && (
                            <p className="text-red-400 text-sm mt-1">{errors.sede}</p>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setCurrentStep(1)}
                            className="flex-1 bg-zinc-600 hover:bg-zinc-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                        >
                            ← Atrás
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-zinc-600 disabled:to-zinc-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
                        >
                            {isSubmitting ? '🔄 Creando...' : '🎉 Ver Paquetes'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
