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

/**
 * Eliminar entrada de bitácora con validación para FichaBitacoraUnificada
 */
export async function fichaBitacoraUnificadaEliminarBitacora(bitacoraId: string): Promise<{ success: boolean; error?: string }> {
    try {
        // Verificar primero si existe el registro
        const existingBitacora = await prisma.eventoBitacora.findUnique({
            where: { id: bitacoraId }
        });

        if (!existingBitacora) {
            return {
                success: false,
                error: 'La entrada de bitácora no existe o ya fue eliminada'
            };
        }

        // Proceder con la eliminación
        await prisma.eventoBitacora.delete({
            where: { id: bitacoraId }
        });

        return { success: true };
    } catch (error) {
        console.error('Error al eliminar bitácora:', error);
        return {
            success: false,
            error: 'Error interno al eliminar la entrada de bitácora'
        };
    }
}

// =============================================================================
// FUNCIONES MIGRADAS DESDE ARCHIVOS LEGACY
// =============================================================================

/**
 * Crear bitácora evento - MIGRADA desde @/app/admin/_lib/EventoBitacora.actions
 * Función simple para crear entrada de bitácora con parámetros básicos
 * Utilizada por: FormEventoNuevoFinal
 */
export async function crearBitacoraEventoLegacy(eventoId: string, anotacion: string, importancia: string = 'informativo') {
    try {
        const bitacora = await prisma.eventoBitacora.create({
            data: {
                eventoId,
                comentario: anotacion,
                importancia: importancia
            }
        });
        return bitacora;
    } catch (error) {
        console.error('Error creando bitácora:', error);
        throw new Error('No se pudo crear la entrada de bitácora');
    }
}
