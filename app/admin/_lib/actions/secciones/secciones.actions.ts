// Ruta: app/admin/_lib/actions/secciones/secciones.actions.ts

'use server';

import prisma from '@/app/admin/_lib/prismaClient';
import { revalidatePath } from 'next/cache';
import { SeccionSchema, AsignarCategoriaSchema } from './secciones.schemas';

const basePath = '/admin/configurar/secciones'; // Asumiendo que esta será la nueva ruta

// --- Funciones de Lectura ---
export async function obtenerSeccionesConCategorias() {
    return await prisma.servicioSeccion.findMany({
        include: {
            seccionCategorias: {
                include: {
                    ServicioCategoria: true,
                },
            },
        },
        orderBy: { posicion: 'asc' },
    });
}

export async function obtenerCategoriasHuerfanas() {
    return await prisma.servicioCategoria.findMany({
        where: {
            seccionCategoria: null, // Filtra las categorías que NO tienen una sección asignada
        },
        orderBy: { posicion: 'asc' },
    });
}

// --- Obtener una sola sección ---
export async function obtenerSeccion(id: string) {
    return await prisma.servicioSeccion.findUnique({
        where: { id },
    });
}

// --- Funciones de Escritura ---
export async function crearSeccion(data: unknown) {
    const validationResult = SeccionSchema.safeParse(data);
    if (!validationResult.success) {
        return { success: false, error: validationResult.error.flatten().fieldErrors };
    }
    try {
        const count = await prisma.servicioSeccion.count();
        await prisma.servicioSeccion.create({
            data: { ...validationResult.data, posicion: count + 1 },
        });
        revalidatePath(basePath);
        return { success: true };
    } catch (error) {
        return { success: false, message: "El nombre de la sección ya existe." };
    }
}

export async function eliminarSeccion(id: string) {
    try {
        // La base de datos se encargará de borrar en cascada las relaciones en SeccionCategoria
        await prisma.servicioSeccion.delete({ where: { id } });
        revalidatePath(basePath);
        return { success: true };
    } catch (error) {
        return { success: false, message: "No se pudo eliminar la sección." };
    }
}

export async function asignarCategoriaASeccion(data: unknown) {
    const validationResult = AsignarCategoriaSchema.safeParse(data);
    if (!validationResult.success) return { success: false, message: "Datos inválidos." };

    const { categoriaId, seccionId } = validationResult.data;
    try {
        await prisma.seccionCategoria.upsert({
            where: { categoriaId },
            update: { seccionId },
            create: { categoriaId, seccionId },
        });
        revalidatePath(basePath);
        return { success: true };
    } catch (error) {
        return { success: false, message: "No se pudo asignar la categoría." };
    }
}



// --- ¡NUEVA FUNCIÓN! ---
export async function actualizarSeccion(data: unknown) {
    const validationResult = SeccionSchema.safeParse(data);
    if (!validationResult.success) {
        return { success: false, error: validationResult.error.flatten().fieldErrors };
    }
    const { id, ...seccionData } = validationResult.data;
    if (!id) return { success: false, message: "ID no proporcionado." };

    try {
        await prisma.servicioSeccion.update({
            where: { id },
            data: seccionData,
        });
        revalidatePath(basePath);
        return { success: true };
    } catch (error) {
        return { success: false, message: "No se pudo actualizar la sección." };
    }
}


export async function desasignarCategoria(categoriaId: string) {
    if (!categoriaId) return { success: false, message: "ID de categoría no proporcionado." };
    try {
        await prisma.seccionCategoria.delete({
            where: { categoriaId },
        });
        revalidatePath(basePath);
        return { success: true };
    } catch (error) {
        // No es un error crítico si no se encuentra, puede que ya estuviera desasignada.
        return { success: true };
    }
}