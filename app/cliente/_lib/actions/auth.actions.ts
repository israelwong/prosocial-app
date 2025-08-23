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
        // Buscar cliente por teléfono (campo único en DB)
        const cliente = await prisma.cliente.findUnique({
            where: { telefono: data.telefono }
        })

        if (!cliente) {
            return {
                success: false,
                message: 'Cliente no encontrado'
            }
        }

        // Verificar email (verificación adicional)
        if (cliente.email !== data.email) {
            return {
                success: false,
                message: 'Email incorrecto'
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
