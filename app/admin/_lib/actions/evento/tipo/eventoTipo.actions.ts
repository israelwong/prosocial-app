// Ruta: app/admin/_lib/actions/eventoTipo/eventoTipo.actions.ts

'use server';

import prisma from '@/app/admin/_lib/prismaClient';
import { revalidatePath } from 'next/cache';
import { EventoTipoCreateSchema, EventoTipoUpdateSchema, UpdatePosicionesSchema } from './eventoTipo.schemas';

const basePath = '/admin/configurar/tipoEvento';

export async function obtenerTiposEvento() {
    return await prisma.eventoTipo.findMany({
        orderBy: { posicion: 'asc' },
    });
}

/**
 * Obtiene un tipo de evento por ID
 * Migrado desde eventoTipo.actions.ts (root)
 */
export async function obtenerTipoEvento(id: string) {
    return await prisma.eventoTipo.findUnique({
        where: { id }
    });
}

export async function crearTipoEvento(data: unknown) {
    const validationResult = EventoTipoCreateSchema.safeParse(data);

    if (!validationResult.success) {
        return { success: false, error: validationResult.error.flatten().fieldErrors };
    }

    try {
        const count = await prisma.eventoTipo.count();
        await prisma.eventoTipo.create({
            data: {
                nombre: validationResult.data.nombre,
                posicion: count + 1,
            },
        });
        revalidatePath(basePath);
        return { success: true };
    } catch (error) {
        return { success: false, message: "El nombre del tipo de evento ya existe." };
    }
}

export async function actualizarTipoEvento(data: unknown) {
    const validationResult = EventoTipoUpdateSchema.safeParse(data);

    if (!validationResult.success) {
        return { success: false, error: validationResult.error.flatten().fieldErrors };
    }

    const { id, nombre } = validationResult.data;

    try {
        await prisma.eventoTipo.update({
            where: { id },
            data: { nombre },
        });
        revalidatePath(basePath);
        return { success: true };
    } catch (error) {
        return { success: false, message: "No se pudo actualizar." };
    }
}

export async function verificarSiPuedeEliminarTipoEvento(id: string) {
    try {
        // Verificar si el tipo de evento tiene paquetes asociados
        const paquetesAsociados = await prisma.paquete.count({
            where: { eventoTipoId: id }
        });

        // Verificar si tiene eventos asociados
        const eventosAsociados = await prisma.evento.count({
            where: { eventoTipoId: id }
        });

        const totalAsociados = paquetesAsociados + eventosAsociados;

        return {
            puedeEliminar: totalAsociados === 0,
            paquetesAsociados,
            eventosAsociados,
            razon: totalAsociados > 0 ?
                `Tiene ${paquetesAsociados} paquete${paquetesAsociados !== 1 ? 's' : ''} y ${eventosAsociados} evento${eventosAsociados !== 1 ? 's' : ''} asociado${totalAsociados !== 1 ? 's' : ''}` :
                null
        };
    } catch (error) {
        return {
            puedeEliminar: false,
            paquetesAsociados: 0,
            eventosAsociados: 0,
            razon: "Error al verificar dependencias"
        };
    }
}

export async function eliminarTipoEvento(id: string) {
    try {
        // Verificar si el tipo de evento tiene paquetes asociados
        const paquetesAsociados = await prisma.paquete.count({
            where: { eventoTipoId: id }
        });

        if (paquetesAsociados > 0) {
            return {
                success: false,
                message: `No se puede eliminar. Este tipo de evento tiene ${paquetesAsociados} paquete${paquetesAsociados > 1 ? 's' : ''} asociado${paquetesAsociados > 1 ? 's' : ''}.`
            };
        }

        // Verificar si tiene eventos asociados
        const eventosAsociados = await prisma.evento.count({
            where: { eventoTipoId: id }
        });

        if (eventosAsociados > 0) {
            return {
                success: false,
                message: `No se puede eliminar. Este tipo de evento tiene ${eventosAsociados} evento${eventosAsociados > 1 ? 's' : ''} asociado${eventosAsociados > 1 ? 's' : ''}.`
            };
        }

        await prisma.eventoTipo.delete({ where: { id } });
        revalidatePath(basePath);
        return { success: true };
    } catch (error) {
        return { success: false, message: "No se pudo eliminar." };
    }
}

export async function actualizarPosicionTipoEvento(items: unknown) {
    const validationResult = UpdatePosicionesSchema.safeParse(items);

    if (!validationResult.success) {
        return { success: false, error: "Datos de entrada inválidos." };
    }

    try {
        const updates = validationResult.data.map(item =>
            prisma.eventoTipo.update({
                where: { id: item.id },
                data: { posicion: item.posicion },
            })
        );
        await prisma.$transaction(updates);
        revalidatePath(basePath);
        return { success: true };
    } catch (error) {
        return { success: false, message: "No se pudieron actualizar las posiciones." };
    }
}

// =============================================================================
// FUNCIONES MIGRADAS DESDE ARCHIVOS LEGACY
// =============================================================================

/**
 * Obtener tipos de evento - MIGRADA desde @/app/admin/_lib/eventoTipo.actions
 * Función simple para obtener tipos de evento ordenados por posición
 * Utilizada por: FormEventoNuevoFinal
 */
export async function obtenerTiposEventoLegacy() {
    return await prisma.eventoTipo.findMany({
        orderBy: {
            posicion: 'asc'
        }
    });
}
