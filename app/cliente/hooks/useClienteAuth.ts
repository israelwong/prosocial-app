'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface Cliente {
    id: string
    nombre: string
    email: string
    avatar?: string | null
}

export function useClienteAuth() {
    const [cliente, setCliente] = useState<Cliente | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Verificar si hay datos de sesión
                const clienteData = sessionStorage.getItem('cliente-data')

                if (!clienteData) {
                    // No hay sesión activa
                    setIsAuthenticated(false)
                    setCliente(null)

                    // Redirigir al login si no está en páginas públicas
                    if (pathname && !pathname.includes('/login') && !pathname.includes('/auth')) {
                        router.push('/cliente/auth/login')
                    }
                    return
                }

                // Parsear datos del cliente
                const parsedCliente = JSON.parse(clienteData)

                // Aquí puedes agregar validación adicional del token/sesión
                // Por ejemplo, verificar si el token no ha expirado

                setCliente(parsedCliente)
                setIsAuthenticated(true)

            } catch (error) {
                console.error('Error verificando autenticación:', error)

                // Limpiar datos corruptos
                sessionStorage.removeItem('cliente-data')
                setIsAuthenticated(false)
                setCliente(null)

                // Redirigir al login en caso de error
                if (pathname && !pathname.includes('/login') && !pathname.includes('/auth')) {
                    router.push('/cliente/auth/login')
                }
            } finally {
                setLoading(false)
            }
        }

        checkAuth()
    }, [router, pathname])

    const logout = () => {
        // Limpiar datos de sesión
        sessionStorage.removeItem('cliente-data')
        setIsAuthenticated(false)
        setCliente(null)

        // Redirigir al login
        router.push('/cliente/auth/login')
    }

    const login = (clienteData: Cliente) => {
        // Guardar datos de sesión
        sessionStorage.setItem('cliente-data', JSON.stringify(clienteData))
        setCliente(clienteData)
        setIsAuthenticated(true)
    }

    return {
        cliente,
        isAuthenticated,
        loading,
        login,
        logout
    }
}
