// Ruta: lib/actions/categorias/categorias.actions.ts

'use server';

import prisma from '@/app/admin/_lib/prismaClient';
import { revalidatePath } from 'next/cache';
import { CategoriaCreateSchema, CategoriaUpdateSchema, UpdatePosicionesSchema } from './categorias.schemas';

const basePath = '/admin/configurar/categorias';

export async function obtenerCategorias() {
    return await prisma.servicioCategoria.findMany({
        orderBy: { posicion: 'asc' },
    });
}

export async function crearCategoria(data: unknown) {
    const validationResult = CategoriaCreateSchema.safeParse(data);

    if (!validationResult.success) {
        return { success: false, error: validationResult.error.flatten().fieldErrors };
    }

    try {
        // Contamos las categorías existentes para asignar la nueva posición al final.
        const count = await prisma.servicioCategoria.count();
        await prisma.servicioCategoria.create({
            data: {
                nombre: validationResult.data.nombre,
                posicion: count + 1,
            },
        });
        revalidatePath(basePath);
        return { success: true };
    } catch (error) {
        console.error("Error al crear la categoría:", error);
        return { success: false, message: "El nombre de la categoría ya existe." };
    }
}

export async function actualizarCategoria(data: unknown) {
    const validationResult = CategoriaUpdateSchema.safeParse(data);

    if (!validationResult.success) {
        return { success: false, error: validationResult.error.flatten().fieldErrors };
    }

    const { id, nombre } = validationResult.data;

    try {
        await prisma.servicioCategoria.update({
            where: { id },
            data: { nombre },
        });
        revalidatePath(basePath);
        return { success: true };
    } catch (error) {
        console.error("Error al actualizar la categoría:", error);
        return { success: false, message: "No se pudo actualizar la categoría." };
    }
}

export async function eliminarCategoria(id: string) {
    try {
        await prisma.servicioCategoria.delete({ where: { id } });
        revalidatePath(basePath);
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar la categoría:", error);
        return { success: false, message: "No se pudo eliminar la categoría." };
    }
}

export async function actualizarPosicionesCategorias(items: unknown) {
    const validationResult = UpdatePosicionesSchema.safeParse(items);

    if (!validationResult.success) {
        return { success: false, error: "Datos de entrada inválidos." };
    }

    try {
        // Usamos una transacción para actualizar todas las posiciones en una sola operación.
        const updates = validationResult.data.map(item =>
            prisma.servicioCategoria.update({
                where: { id: item.id },
                data: { posicion: item.posicion },
            })
        );
        await prisma.$transaction(updates);
        revalidatePath(basePath);
        return { success: true };
    } catch (error) {
        console.error("Error al actualizar posiciones:", error);
        return { success: false, message: "No se pudieron actualizar las posiciones." };
    }
}
