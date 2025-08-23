'use server'

/**
 * Server Actions de autenticación del cliente
 */

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/app/admin/_lib/prismaClient'
import { ApiResponse, LoginData, Cliente } from '../types'

export async function loginCliente(data: LoginData): Promise<ApiResponse<Cliente>> {
    try {
        // Buscar cliente por email
        const cliente = await prisma.cliente.findUnique({
            where: { email: data.email }
        })

        if (!cliente) {
            return {
                success: false,
                message: 'Cliente no encontrado'
            }
        }

        // Verificar teléfono (en lugar de password para clientes)
        if (cliente.telefono !== data.telefono) {
            return {
                success: false,
                message: 'Teléfono incorrecto'
            }
        }

        // Crear sesión simple (usando cookies)
        const cookieStore = await cookies()
        cookieStore.set('cliente-session', JSON.stringify({
            id: cliente.id,
            email: cliente.email,
            nombre: cliente.nombre
        }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7 // 7 días
        })

        return {
            success: true,
            data: {
                id: cliente.id,
                nombre: cliente.nombre,
                email: cliente.email,
                telefono: cliente.telefono,
                avatar: cliente.avatar
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

export async function logoutCliente(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete('cliente-session')
    redirect('/cliente/login')
}

export async function getClienteSession(): Promise<Cliente | null> {
    try {
        const cookieStore = await cookies()
        const session = cookieStore.get('cliente-session')
        
        if (!session) {
            return null
        }

        const clienteData = JSON.parse(session.value)
        
        // Verificar que el cliente aún existe
        const cliente = await prisma.cliente.findUnique({
            where: { id: clienteData.id }
        })

        if (!cliente) {
            return null
        }

        return {
            id: cliente.id,
            nombre: cliente.nombre,
            email: cliente.email,
            telefono: cliente.telefono,
            avatar: cliente.avatar
        }
    } catch (error) {
        console.error('Error al obtener sesión:', error)
        return null
    }
}
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
