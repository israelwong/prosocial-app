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

export async function eliminarTipoEvento(id: string) {
    try {
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
