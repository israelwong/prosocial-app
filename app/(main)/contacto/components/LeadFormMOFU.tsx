'use client'
import React, { useState, useEffect } from 'react'
import { obtenerTiposEvento } from '@/app/admin/_lib/actions/eventoTipo/eventoTipo.actions'
import { EventoTipo } from '@prisma/client'

interface LeadFormMOFUProps {
  ref?: string
}

interface FormData {
  fechaEvento: string
  tipoEventoId: string
  nombreEvento: string
  sede: string
  nombreCliente: string
  telefono: string
  email: string
}

export default function LeadFormMOFU({ ref }: LeadFormMOFUProps) {
  const [tiposEvento, setTiposEvento] = useState<EventoTipo[]>([])
  const [formData, setFormData] = useState<FormData>({
    fechaEvento: '',
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Cargar tipos de evento al montar el componente
  useEffect(() => {
    const loadTiposEvento = async () => {
      try {
        const tipos = await obtenerTiposEvento()
        setTiposEvento(tipos)
        
        // Pre-seleccionar tipo según referencia
        if (ref && tipos.length > 0) {
          const tipoSeleccionado = tipos.find(tipo => {
            if (ref === 'fifteens') {
              return tipo.nombre.toLowerCase().includes('xv') || tipo.nombre.toLowerCase().includes('quince')
            }
            if (ref === 'weddings') {
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
  }, [ref])

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
      setDateAvailable(result.available)
    } catch (error) {
      console.error('Error validando fecha:', error)
      setDateAvailable(null)
    } finally {
      setIsValidatingDate(false)
    }
  }

  // Manejar cambio de fecha
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    setFormData(prev => ({ ...prev, fechaEvento: newDate }))
    setDateAvailable(null)
    
    if (newDate) {
      // Validar con debounce
      setTimeout(() => validateDateAvailability(newDate), 500)
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
      const response = await fetch('/api/crear-evento-landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          canalAdquisicion: 'landing-page',
          referencia: ref
        })
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
    switch (ref) {
      case 'fifteens':
        return currentStep === 1 
          ? '¿Cuándo será tu Celebración de XV Años?' 
          : 'Cuéntanos más sobre tu Quinceañera'
      case 'weddings':
        return currentStep === 1 
          ? '¿Cuándo será tu Boda?' 
          : 'Cuéntanos más sobre tu Matrimonio'
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
            <input
              type="date"
              name="fechaEvento"
              value={formData.fechaEvento}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {isValidatingDate && (
              <p className="text-yellow-400 text-sm mt-1">🔄 Validando disponibilidad...</p>
            )}
            {dateAvailable === true && (
              <p className="text-green-400 text-sm mt-1">✅ ¡Fecha disponible!</p>
            )}
            {dateAvailable === false && (
              <p className="text-red-400 text-sm mt-1">❌ Fecha no disponible</p>
            )}
            {errors.fechaEvento && (
              <p className="text-red-400 text-sm mt-1">{errors.fechaEvento}</p>
            )}
          </div>

          {/* Tipo de evento */}
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

          <button
            onClick={nextStep}
            disabled={!formData.fechaEvento || !formData.tipoEventoId || dateAvailable === false}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-zinc-600 disabled:to-zinc-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
          >
            Continuar
          </button>
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
              {ref === 'fifteens' ? 'Nombre de la quinceañera' : ref === 'weddings' ? 'Nombres de los novios' : 'Nombre del evento'}
            </label>
            <input
              type="text"
              name="nombreEvento"
              value={formData.nombreEvento}
              onChange={handleInputChange}
              placeholder={ref === 'fifteens' ? 'Ej: Carolina' : ref === 'weddings' ? 'Ej: Pedro y María' : 'Ej: Evento Corporativo'}
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
              placeholder="Ej: Salón Los Pinos, Iglesia San José"
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
