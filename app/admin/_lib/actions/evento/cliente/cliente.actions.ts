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
    const validatedData = ActualizarClienteSchema.parse(data)

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
