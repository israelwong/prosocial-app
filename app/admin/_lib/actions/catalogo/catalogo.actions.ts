// Ruta: app/admin/_lib/actions/catalogo/catalogo.actions.ts

'use server';

import prisma from '@/app/admin/_lib/prismaClient';
import { revalidatePath } from 'next/cache';
import { UpdatePosicionSchema } from './catalogo.schemas';
import { SeccionSchema, CategoriaSchema } from './catalogo.schemas';
import z from 'zod';


const basePath = '/admin/configurar/catalogo'; // Nueva ruta

// --- Función de Lectura Principal ---
export async function obtenerCatalogoCompleto() {
    return await prisma.servicioSeccion.findMany({
        orderBy: { posicion: 'asc' },
        include: {
            seccionCategorias: {
                orderBy: { ServicioCategoria: { posicion: 'asc' } },
                include: {
                    ServicioCategoria: {
                        include: {
                            Servicio: {
                                orderBy: { posicion: 'asc' },
                            },
                        },
                    },
                },
            },
        },
    });
}

// --- Acciones para Secciones ---
export async function crearSeccion(data: { nombre: string, descripcion?: string }) {
    const count = await prisma.servicioSeccion.count();
    await prisma.servicioSeccion.create({ data: { ...data, posicion: count + 1 } });
    revalidatePath(basePath);
}

// --- Acciones para Categorías ---
export async function crearCategoria(data: { nombre: string, seccionId: string }) {
    const count = await prisma.servicioCategoria.count(); // Idealmente, contar por sección
    const categoria = await prisma.servicioCategoria.create({ data: { nombre: data.nombre, posicion: count + 1 } });
    await prisma.seccionCategoria.create({
        data: {
            seccionId: data.seccionId,
            categoriaId: categoria.id,
        }
    });
    revalidatePath(basePath);
}

// --- Acciones para Servicios ---
// (Aquí irían las acciones para crear/actualizar servicios, que ya tenemos)

// --- Acciones para Reordenar (Drag and Drop) ---
export async function reordenarCategorias(seccionId: string, categoriaIds: string[]) {
    const updates = categoriaIds.map((id, index) =>
        prisma.servicioCategoria.update({
            where: { id },
            data: { posicion: index + 1, seccionCategoria: { update: { where: { categoriaId: id }, data: { seccionId } } } },
        })
    );
    await prisma.$transaction(updates);
    revalidatePath(basePath);
}

export async function reordenarServicios(categoriaId: string, servicioIds: string[]) {
    const updates = servicioIds.map((id, index) =>
        prisma.servicio.update({
            where: { id },
            data: { posicion: index + 1, servicioCategoriaId: categoriaId },
        })
    );
    await prisma.$transaction(updates);
    revalidatePath(basePath);
}




// REEMPLAZO PARA reordenarItems, moverCategoriaASeccion, moverServicioACategoria
export async function actualizarPosicionCatalogo(payload: unknown) {
    const validation = UpdatePosicionSchema.safeParse(payload);
    if (!validation.success) {
        throw new Error(`Datos inválidos: ${validation.error.message}`);
    }

    const { itemId, itemType, newParentId } = validation.data;
    let { newIndex } = validation.data;

    await prisma.$transaction(async (tx) => {
        let item, oldParentId, oldIndex, parentRelationField, parentIdField;

        // Paso 1: Obtener el estado actual del ítem que se mueve
        switch (itemType) {
            case 'seccion':
                item = await tx.servicioSeccion.findUniqueOrThrow({ where: { id: itemId } });
                oldIndex = item.posicion;
                // Las secciones no tienen padre en este modelo, se manejan en la raíz
                oldParentId = 'root';
                break;
            case 'categoria':
                const seccionCategoria = await tx.seccionCategoria.findUniqueOrThrow({ where: { categoriaId: itemId } });
                item = await tx.servicioCategoria.findUniqueOrThrow({ where: { id: itemId } });
                oldIndex = item.posicion;
                oldParentId = seccionCategoria.seccionId;
                parentRelationField = 'seccionId'; // Campo en la tabla de unión
                break;
            case 'servicio':
                item = await tx.servicio.findUniqueOrThrow({ where: { id: itemId } });
                oldIndex = item.posicion;
                oldParentId = item.servicioCategoriaId;
                parentIdField = 'servicioCategoriaId'; // Campo directo en la tabla
                break;
        }

        // Si se mueve dentro del mismo contenedor, ajustamos los índices para evitar conflictos
        const isSameContainer = oldParentId === newParentId;
        if (isSameContainer && newIndex > oldIndex) {
            newIndex--; // El array se "acorta" temporalmente
        }

        // Paso 2: "Cerrar el hueco" en la lista de origen
        if (oldParentId) {
            const whereClause = itemType === 'categoria' ? { seccionId: oldParentId } : { [parentIdField!]: oldParentId };
            const model = itemType === 'categoria' ? 'servicioCategoria' : 'servicio';

            // Este es un truco: no podemos actualizar la tabla de la que estamos leyendo en la misma query.
            // Primero, buscamos los IDs de las categorías a actualizar.
            if (itemType === 'categoria') {
                const categoriasEnSeccion = await tx.seccionCategoria.findMany({ where: whereClause });
                const categoriaIds = categoriasEnSeccion.map(sc => sc.categoriaId);
                await tx.servicioCategoria.updateMany({
                    where: { id: { in: categoriaIds }, posicion: { gt: oldIndex } },
                    data: { posicion: { decrement: 1 } },
                });
            } else if (itemType === 'servicio') {
                await tx.servicio.updateMany({
                    where: { ...whereClause, posicion: { gt: oldIndex } },
                    data: { posicion: { decrement: 1 } },
                });
            } else { // seccion
                await tx.servicioSeccion.updateMany({
                    where: { posicion: { gt: oldIndex } },
                    data: { posicion: { decrement: 1 } },
                });
            }
        }


        // Paso 3: "Hacer espacio" en la lista de destino
        const whereClauseDest = itemType === 'categoria' ? { seccionId: newParentId } : itemType === 'seccion' ? {} : { [parentIdField!]: newParentId };
        const modelDest = itemType === 'categoria' ? 'servicioCategoria' : itemType === 'seccion' ? 'servicioSeccion' : 'servicio';

        if (itemType === 'categoria') {
            let categoriasEnSeccion: { categoriaId: string }[] = [];
            if (
                (itemType === 'categoria' && typeof newParentId === 'string')
                || (itemType === 'categoria' && newParentId)
            ) {
                categoriasEnSeccion = await tx.seccionCategoria.findMany({ where: { seccionId: newParentId as string } });
            } else if (itemType === 'categoria') {
                categoriasEnSeccion = [];
            } else {
                if (whereClauseDest.seccionId != null) {
                    categoriasEnSeccion = await tx.seccionCategoria.findMany({ where: { seccionId: whereClauseDest.seccionId as string } });
                } else {
                    categoriasEnSeccion = [];
                }
            }
            const categoriaIds = categoriasEnSeccion.map(sc => sc.categoriaId);
            await tx.servicioCategoria.updateMany({
                where: { id: { in: categoriaIds }, posicion: { gte: newIndex } },
                data: { posicion: { increment: 1 } },
            });
        } else if (itemType === 'servicio') {
            await tx.servicio.updateMany({
                where: { ...whereClauseDest, posicion: { gte: newIndex } },
                data: { posicion: { increment: 1 } },
            });
        } else { // seccion
            await tx.servicioSeccion.updateMany({
                where: { posicion: { gte: newIndex } },
                data: { posicion: { increment: 1 } },
            });
        }

        // Paso 4: Actualizar el ítem movido
        switch (itemType) {
            case 'seccion':
                await tx.servicioSeccion.update({ where: { id: itemId }, data: { posicion: newIndex } });
                break;
            case 'categoria':
                await tx.servicioCategoria.update({ where: { id: itemId }, data: { posicion: newIndex } });
                if (!isSameContainer) {
                    if (typeof newParentId === 'string') {
                        await tx.seccionCategoria.update({ where: { categoriaId: itemId }, data: { seccionId: newParentId } });
                    } else {
                        throw new Error('El nuevo seccionId no puede ser null o undefined');
                    }
                }
                break;
            case 'servicio':
                if (typeof newParentId !== 'string') {
                    throw new Error('El nuevo servicioCategoriaId no puede ser null o undefined');
                }
                await tx.servicio.update({ where: { id: itemId }, data: { servicioCategoriaId: newParentId, posicion: newIndex } });
                break;
        }

    });

    revalidatePath(basePath);
    return { success: true };
}




export async function upsertSeccion(data: z.infer<typeof SeccionSchema>) {
    const { id, ...rest } = SeccionSchema.parse(data);
    let savedSeccion;
    if (id) {
        savedSeccion = await prisma.servicioSeccion.update({ where: { id }, data: rest });
    } else {
        const count = await prisma.servicioSeccion.count();
        savedSeccion = await prisma.servicioSeccion.create({ data: { ...rest, posicion: count } });
    }
    revalidatePath(basePath);
    // Devuelve solo el item guardado, no todo el catálogo
    return savedSeccion;
}

export async function upsertCategoria(data: z.infer<typeof CategoriaSchema> & { id?: string, seccionId?: string }) {
    const CategoriaCreateSchema = CategoriaSchema.extend({
        id: z.string().cuid().optional(),
        seccionId: z.string().cuid().optional(),
    });

    const { id, nombre, seccionId } = CategoriaCreateSchema.parse(data);
    let savedCategoria;

    if (id) {
        savedCategoria = await prisma.servicioCategoria.update({ where: { id }, data: { nombre } });
    } else if (seccionId) {
        const count = await prisma.seccionCategoria.count({ where: { seccionId: seccionId } });
        savedCategoria = await prisma.servicioCategoria.create({ data: { nombre, posicion: count } });
        await prisma.seccionCategoria.create({ data: { seccionId: seccionId, categoriaId: savedCategoria.id } });
    } else {
        throw new Error('SeccionId es requerido para crear una nueva categoría.');
    }
    revalidatePath(basePath);
    // Devuelve solo el item guardado
    return savedCategoria;
}

export async function deleteItem(id: string, type: 'seccion' | 'categoria') {
    await prisma.$transaction(async (tx) => {
        if (type === 'seccion') {
            const seccionToDelete = await tx.servicioSeccion.findUnique({ where: { id }, include: { seccionCategorias: true } });
            if (!seccionToDelete) throw new Error("Sección no encontrada.");
            if (seccionToDelete.seccionCategorias.length > 0) throw new Error("No se puede eliminar una sección con categorías.");

            await tx.servicioSeccion.delete({ where: { id } });
            // Reordenar las secciones restantes
            const remaining = await tx.servicioSeccion.findMany({ orderBy: { posicion: 'asc' } });
            await Promise.all(remaining.map((item, index) => tx.servicioSeccion.update({ where: { id: item.id }, data: { posicion: index } })));

        } else if (type === 'categoria') {
            const categoriaToDelete = await tx.servicioCategoria.findUnique({ where: { id }, include: { Servicio: true } });
            if (!categoriaToDelete) throw new Error("Categoría no encontrada.");
            if (categoriaToDelete.Servicio.length > 0) throw new Error("No se puede eliminar una categoría con servicios.");

            await tx.seccionCategoria.delete({ where: { categoriaId: id } });
            await tx.servicioCategoria.delete({ where: { id } });
            // Reordenar las categorías restantes en la misma sección
            const seccion = await tx.seccionCategoria.findFirst({ where: { categoriaId: id } });
            if (seccion) {
                const remaining = await tx.servicioCategoria.findMany({ where: { seccionCategoria: { seccionId: seccion.seccionId } }, orderBy: { posicion: 'asc' } });
                await Promise.all(remaining.map((item, index) => tx.servicioCategoria.update({ where: { id: item.id }, data: { posicion: index } })));
            }
        }
    });
    revalidatePath(basePath);
}