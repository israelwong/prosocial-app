'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SetupForm() {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [clienteId, setClienteId] = useState<string | null>(null)
    
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (searchParams) {
            const id = searchParams.get('clienteId')
            if (!id) {
                router.push('/cliente-portal/auth/login')
            } else {
                setClienteId(id)
            }
        }
    }, [searchParams, router])

    const validatePassword = (password: string) => {
        if (password.length < 8) {
            return 'La contraseña debe tener al menos 8 caracteres'
        }
        if (!/(?=.*[a-z])/.test(password)) {
            return 'La contraseña debe contener al menos una letra minúscula'
        }
        if (!/(?=.*[A-Z])/.test(password)) {
            return 'La contraseña debe contener al menos una letra mayúscula'
        }
        if (!/(?=.*\d)/.test(password)) {
            return 'La contraseña debe contener al menos un número'
        }
        return null
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        setError('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // Validaciones
            if (!formData.password || !formData.confirmPassword) {
                setError('Por favor completa todos los campos')
                return
            }

            const passwordError = validatePassword(formData.password)
            if (passwordError) {
                setError(passwordError)
                return
            }

            if (formData.password !== formData.confirmPassword) {
                setError('Las contraseñas no coinciden')
                return
            }

            // Hash de la contraseña se hará en el servidor por seguridad

            // Enviar al servidor
            const response = await fetch('/api/cliente-portal/auth/setup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    clienteId,
                    password: formData.password // El servidor hará su propio hash
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                setError(errorData.message || 'Error al configurar contraseña')
                return
            }

            const data = await response.json()
            
            // Guardar datos del cliente y redirigir al dashboard
            sessionStorage.setItem('cliente-data', JSON.stringify(data.cliente))
            sessionStorage.removeItem('cliente-setup') // Limpiar datos de setup
            router.push('/cliente-portal/dashboard')

        } catch (error) {
            console.error('Error en setup:', error)
            setError('Error de conexión. Por favor intenta de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    if (!clienteId) {
        return (
            <div className="text-center py-8">
                <div className="text-zinc-400">Cargando...</div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de contraseña */}
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                    Nueva contraseña
                </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-zinc-700/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Mínimo 8 caracteres"
                />
            </div>

            {/* Campo de confirmación */}
            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300 mb-2">
                    Confirmar contraseña
                </label>
                <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-zinc-700/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Repite tu contraseña"
                />
            </div>

            {/* Requisitos de contraseña */}
            <div className="bg-zinc-700/30 border border-zinc-600/50 rounded-lg p-4">
                <p className="text-zinc-300 text-sm font-medium mb-2">Requisitos de contraseña:</p>
                <ul className="text-zinc-400 text-xs space-y-1">
                    <li className={`flex items-center gap-2 ${formData.password.length >= 8 ? 'text-green-400' : ''}`}>
                        <span className="w-1 h-1 bg-current rounded-full"></span>
                        Mínimo 8 caracteres
                    </li>
                    <li className={`flex items-center gap-2 ${/(?=.*[a-z])/.test(formData.password) ? 'text-green-400' : ''}`}>
                        <span className="w-1 h-1 bg-current rounded-full"></span>
                        Una letra minúscula
                    </li>
                    <li className={`flex items-center gap-2 ${/(?=.*[A-Z])/.test(formData.password) ? 'text-green-400' : ''}`}>
                        <span className="w-1 h-1 bg-current rounded-full"></span>
                        Una letra mayúscula
                    </li>
                    <li className={`flex items-center gap-2 ${/(?=.*\d)/.test(formData.password) ? 'text-green-400' : ''}`}>
                        <span className="w-1 h-1 bg-current rounded-full"></span>
                        Un número
                    </li>
                </ul>
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
                        Configurando...
                    </div>
                ) : (
                    'Completar configuración'
                )}
            </button>
        </form>
    )
}
