/**
 * Acciones de autenticación del cliente
 */

import { ApiResponse, LoginData, Cliente } from '../types'

export async function loginCliente(data: LoginData): Promise<ApiResponse<Cliente>> {
    try {
        const response = await fetch('/api/cliente/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        const result = await response.json()

        if (response.ok && result.success) {
            return {
                success: true,
                data: result.cliente
            }
        } else {
            return {
                success: false,
                message: result.message || 'Error en el login'
            }
        }
    } catch (error) {
        console.error('Error en loginCliente:', error)
        return {
            success: false,
            message: 'Error de conexión'
        }
    }
}

export async function logoutCliente(): Promise<ApiResponse> {
    try {
        // Limpiar datos locales
        sessionStorage.removeItem('cliente-data')

        // Opcionalmente, llamar al servidor para invalidar la sesión
        await fetch('/api/cliente/auth/logout', {
            method: 'POST',
        })

        return { success: true }
    } catch (error) {
        console.error('Error en logoutCliente:', error)
        return {
            success: false,
            message: 'Error al cerrar sesión'
        }
    }
}

export async function validateClienteSession(): Promise<ApiResponse<Cliente>> {
    try {
        const clienteData = sessionStorage.getItem('cliente-data')

        if (!clienteData) {
            return { success: false }
        }

        const cliente = JSON.parse(clienteData)

        // Aquí puedes agregar validación adicional con el servidor
        // const response = await fetch('/api/cliente/auth/validate')

        return {
            success: true,
            data: cliente
        }
    } catch (error) {
        console.error('Error en validateClienteSession:', error)
        return {
            success: false,
            message: 'Error al validar sesión'
        }
    }
}
