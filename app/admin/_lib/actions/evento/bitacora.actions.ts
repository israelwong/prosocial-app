'use server'

import prisma from '../../prismaClient'
import {
    CrearBitacoraSchema,
    ActualizarBitacoraSchema,
    type CrearBitacora,
    type ActualizarBitacora,
    type BitacoraCompleta
} from './bitacora.schemas'

/**
 * Crear nueva entrada de bitácora
 */
export async function crearBitacora(data: CrearBitacora): Promise<BitacoraCompleta> {
    const validatedData = CrearBitacoraSchema.parse(data)

    const bitacora = await prisma.eventoBitacora.create({
        data: {
            eventoId: validatedData.eventoId,
            comentario: validatedData.comentario
        }
    })

    return {
        id: bitacora.id,
        eventoId: bitacora.eventoId,
        comentario: bitacora.comentario,
        createdAt: bitacora.createdAt,
        updatedAt: bitacora.updatedAt
    }
}

/**
 * Actualizar entrada de bitácora
 */
export async function actualizarBitacora(data: ActualizarBitacora): Promise<BitacoraCompleta> {
    const validatedData = ActualizarBitacoraSchema.parse(data)

    const bitacora = await prisma.eventoBitacora.update({
        where: { id: validatedData.id },
        data: {
            comentario: validatedData.comentario
        }
    })

    return {
        id: bitacora.id,
        eventoId: bitacora.eventoId,
        comentario: bitacora.comentario,
        createdAt: bitacora.createdAt,
        updatedAt: bitacora.updatedAt
    }
}

/**
 * Eliminar entrada de bitácora
 */
export async function eliminarBitacora(bitacoraId: string): Promise<void> {
    await prisma.eventoBitacora.delete({
        where: { id: bitacoraId }
    })
}

/**
 * Obtener bitácora por ID
 */
export async function obtenerBitacoraPorId(bitacoraId: string): Promise<BitacoraCompleta | null> {
    const bitacora = await prisma.eventoBitacora.findUnique({
        where: { id: bitacoraId }
    })

    if (!bitacora) return null

    return {
        id: bitacora.id,
        eventoId: bitacora.eventoId,
        comentario: bitacora.comentario,
        createdAt: bitacora.createdAt,
        updatedAt: bitacora.updatedAt
    }
}
