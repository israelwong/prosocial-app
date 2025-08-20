'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
    const [formData, setFormData] = useState({
        email: '',
        telefono: ''
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
            if (!formData.email && !formData.telefono) {
                setError('Por favor ingresa tu email o teléfono')
                return
            }

            // Validar formato de email si se proporciona
            if (formData.email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(formData.email)) {
                    setError('Por favor ingresa un email válido')
                    return
                }
            }

            // Validar formato de teléfono si se proporciona
            if (formData.telefono) {
                const telefonoRegex = /^[0-9]{10}$/
                if (!telefonoRegex.test(formData.telefono.replace(/\s/g, ''))) {
                    setError('Por favor ingresa un teléfono válido de 10 dígitos')
                    return
                }
            }

            // Llamada a API para validar credenciales
            const response = await fetch('/api/cliente-portal/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.email || null,
                    telefono: formData.telefono || null
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                setError(errorData.message || 'Error al iniciar sesión')
                return
            }

            const data = await response.json()
            console.log('🔐 Login response:', data) // Debug log

            // Si el cliente no tiene contraseña, redirigir a onboarding
            if (!data.hasPassword) {
                console.log('👤 Cliente sin contraseña, redirigiendo a setup') // Debug log
                sessionStorage.setItem('cliente-setup', JSON.stringify(data.cliente))
                router.push('/cliente-portal/auth/setup')
                return
            }

            // Si ya tiene contraseña, ir al dashboard
            console.log('✅ Cliente con contraseña, redirigiendo a dashboard') // Debug log
            sessionStorage.setItem('cliente-data', JSON.stringify(data.cliente))
            router.push('/cliente-portal/dashboard')

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
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                    Correo electrónico
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-zinc-700/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="tu@email.com"
                />
            </div>

            {/* Divider */}
            <div className="flex items-center">
                <div className="flex-1 border-t border-zinc-600"></div>
                <div className="px-3 text-zinc-500 text-sm">o</div>
                <div className="flex-1 border-t border-zinc-600"></div>
            </div>

            {/* Campo de teléfono */}
            <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-zinc-300 mb-2">
                    Número de teléfono
                </label>
                <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-zinc-700/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="5544546582"
                />
            </div>

            {/* Error message */}
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Submit button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-800"
            >
                {loading ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        Verificando...
                    </div>
                ) : (
                    'Continuar'
                )}
            </button>

            {/* Ayuda */}
            <div className="text-center">
                <p className="text-zinc-500 text-sm">
                    Usa el email o teléfono registrado en tu evento
                </p>
            </div>
        </form>
    )
}
