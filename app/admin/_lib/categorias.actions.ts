'use server'
import { ServicioCategoria } from "@/app/admin/_lib/types";
import prisma from './prismaClient';

export async function obtenerCategories() {
    return prisma.servicioCategoria.findMany({
        orderBy: {
            posicion: 'asc'
        }
    });
}

export async function obtenerCategoryById(id: string) {
    return prisma.servicioCategoria.findUnique({
        where: { id: id }
    });
}

export async function crearCategoria(nombre: string): Promise<ServicioCategoria> {
    // Verificar si el nombre ya existe
    const existingCategory = await prisma.servicioCategoria.findUnique({
        where: { nombre },
    });

    if (existingCategory) {
        throw new Error('El nombre de la categoría ya existe');
    }

    // Obtener la posición máxima actual
    const maxPosicion = await prisma.servicioCategoria.aggregate({
        _max: {
            posicion: true,
        },
    });

    // Asignar la nueva posición
    const nuevaPosicion = (maxPosicion._max.posicion || 0) + 1;

    // Crear la nueva categoría con la posición asignada
    return prisma.servicioCategoria.create({
        data: {
            nombre,
            posicion: nuevaPosicion,
        },
    });
}

export async function actualizarCategoria(id: string, nombre: string) {

    try {
        const response = await prisma.servicioCategoria.update({
            where: { id: id },
            data: {
                nombre: nombre
            }
        });
        return { status: 'success', data: response };
    } catch {
        return { status: 'error', message: 'Nombre duplicado' };
    }
}

export async function eliminarCategoria(id: string) {

    try {

        // Verificar si hay servicios asociados a la categoría
        const serviciosAsociados = await prisma.servicio.findMany({
            where: { servicioCategoriaId: id },
        });

        if (serviciosAsociados.length > 0) {
            return {
                status: 'error',
                message: 'No se puede eliminar la categoría porque tiene servicios asociados',
            }
        } else {

            const response = await prisma.servicioCategoria.delete({
                where: { id: id }
            });
            console.log('response', response);
            return { status: 'success', data: response };
        }
    } catch {
        return { status: 'error', message: 'Error al eliminar la categoría porque tiene servicios asociados' };
    }
}

export async function actualizarPosicionesCategorias(categorias: ServicioCategoria[]) {
    categorias.forEach(async (categoria) => {
        await prisma.servicioCategoria.update({
            where: { id: categoria.id },
            data: {
                posicion: categoria.posicion
            }
        });
    });

}