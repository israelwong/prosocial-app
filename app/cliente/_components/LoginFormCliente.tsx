'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginFormCliente() {
    const [formData, setFormData] = useState({
        email: '',
        codigoEvento: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    
    const router = useRouter()

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        setError('') // Limpiar error al escribir
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // Validaciones básicas
            if (!formData.email || !formData.codigoEvento) {
                setError('Por favor completa todos los campos')
                return
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(formData.email)) {
                setError('Por favor ingresa un email válido')
                return
            }

            // Simular llamada a API para validar credenciales
            const response = await fetch('/api/cliente/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                const errorData = await response.json()
                setError(errorData.message || 'Error al iniciar sesión')
                return
            }

            const data = await response.json()
            
            // Si el login es exitoso, redirigir al dashboard del cliente
            router.push(`/cliente/dashboard?eventosId=${data.eventosId}`)

        } catch (error) {
            console.error('Error en login:', error)
            setError('Error de conexión. Por favor intenta de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de email */}
            <div>
                <label htmlFor="email" className="block text-zinc-400 mb-2 text-sm font-medium">
                    Email registrado
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                    className="w-full bg-zinc-700 border border-zinc-600 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    disabled={loading}
                />
            </div>

            {/* Campo de código de evento */}
            <div>
                <label htmlFor="codigoEvento" className="block text-zinc-400 mb-2 text-sm font-medium">
                    Código de evento
                </label>
                <input
                    type="text"
                    id="codigoEvento"
                    name="codigoEvento"
                    value={formData.codigoEvento}
                    onChange={handleInputChange}
                    placeholder="Código proporcionado por ProSocial"
                    className="w-full bg-zinc-700 border border-zinc-600 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors uppercase"
                    disabled={loading}
                />
                <div className="text-zinc-500 text-xs mt-1">
                    Este código te fue proporcionado al contratar el servicio
                </div>
            </div>

            {/* Mensaje de error */}
            {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Botón de submit */}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-zinc-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
                {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Validando...</span>
                    </div>
                ) : (
                    'Acceder a mis eventos'
                )}
            </button>

            {/* Información adicional */}
            <div className="text-center">
                <div className="text-zinc-500 text-xs">
                    Al acceder, podrás ver el estado de tus eventos contratados
                </div>
            </div>

            {/* Versión demo - Eliminar en producción */}
            <div className="border-t border-zinc-700 pt-4">
                <div className="text-zinc-500 text-xs mb-2 text-center">Datos de prueba:</div>
                <div className="flex space-x-2">
                    <button
                        type="button"
                        onClick={() => setFormData({ email: 'cliente@test.com', codigoEvento: 'DEMO2024' })}
                        className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs py-2 px-3 rounded transition-colors"
                    >
                        Usar datos demo
                    </button>
                </div>
            </div>
        </form>
    )
}
