'use server'

import prisma from '../../../prismaClient'
import {
    ActualizarClienteSchema,
    type ActualizarCliente,
    type ClienteCompleto
} from './cliente.schemas'

/**
 * Actualizar cliente
 */
export async function actualizarCliente(data: ActualizarCliente): Promise<{ cliente: ClienteCompleto }> {
    try {
        const validatedData = ActualizarClienteSchema.parse(data)

        // Verificar que el cliente existe
        const clienteExistente = await prisma.cliente.findUnique({
            where: { id: validatedData.id },
            include: { Canal: true }
        })

        if (!clienteExistente) {
            throw new Error(`Cliente con ID ${validatedData.id} no encontrado`)
        }

        // Validar que el canalId existe si se proporciona y es diferente al actual
        if (validatedData.canalId && validatedData.canalId !== clienteExistente.canalId) {
            const canalExiste = await prisma.canal.findUnique({
                where: { id: validatedData.canalId }
            })

            if (!canalExiste) {
                throw new Error(`El canal con ID ${validatedData.canalId} no existe`)
            }
        }

        const cliente = await prisma.cliente.update({
            where: { id: validatedData.id },
            data: {
                nombre: validatedData.nombre,
                telefono: validatedData.telefono,
                email: validatedData.email,
                direccion: validatedData.direccion,
                status: validatedData.status,
                canalId: validatedData.canalId
            },
            include: {
                Canal: {
                    select: {
                        nombre: true
                    }
                }
            }
        })

        return {
            cliente: {
                id: cliente.id,
                nombre: cliente.nombre,
                telefono: cliente.telefono,
                email: cliente.email,
                direccion: cliente.direccion,
                status: cliente.status,
                canalId: cliente.canalId,
                userId: cliente.userId,
                createdAt: cliente.createdAt,
                updatedAt: cliente.updatedAt,
                Canal: cliente.Canal
            }
        }
    } catch (error) {
        console.error('Error en actualizarCliente:', {
            error: (error as Error).message,
            data,
            stack: (error as Error).stack
        })
        throw error
    }
}

/**
 * Obtener canales disponibles
 */
export async function obtenerCanales() {
    const canales = await prisma.canal.findMany({
        orderBy: {
            nombre: 'asc'
        },
        select: {
            id: true,
            nombre: true
        }
    })

    return canales
}
