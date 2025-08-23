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
        let cliente = null

        // Buscar cliente por teléfono O por email
        if (data.telefono) {
            // Teléfono es único, usar findUnique
            cliente = await prisma.cliente.findUnique({
                where: { telefono: data.telefono }
            })
        } else if (data.email) {
            // Email no es único, usar findFirst
            cliente = await prisma.cliente.findFirst({
                where: { email: data.email }
            })
        }

        if (!cliente) {
            return {
                success: false,
                message: 'Cliente no encontrado con los datos proporcionados'
            }
        }

        // Verificación adicional: si proporcionaron ambos campos, verificar que coincidan
        if (data.email && data.telefono) {
            if (cliente.email !== data.email || cliente.telefono !== data.telefono) {
                return {
                    success: false,
                    message: 'Los datos proporcionados no coinciden'
                }
            }
        } else if (data.email && cliente.email !== data.email) {
            return {
                success: false,
                message: 'Email incorrecto'
            }
        } else if (data.telefono && cliente.telefono !== data.telefono) {
            return {
                success: false,
                message: 'Teléfono incorrecto'
            }
        }

        // Crear sesión simple (usando cookies)
        const cookieStore = await cookies()

        // Cookie de sesión completa
        cookieStore.set('cliente-session', JSON.stringify({
            id: cliente.id,
            email: cliente.email,
            nombre: cliente.nombre
        }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7 // 7 días
        })

        // Cookie simple para ID (usado por otros Server Actions)
        cookieStore.set('clienteId', cliente.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7 // 7 días
        })

        return {
            success: true,
            data: {
                id: cliente.id,
                nombre: cliente.nombre,
                email: cliente.email || '',
                telefono: cliente.telefono || undefined
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
    cookieStore.delete('clienteId')
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
            email: cliente.email || '',
            telefono: cliente.telefono || undefined
        }
    } catch (error) {
        console.error('Error al obtener sesión:', error)
        return null
    }
}
