// Ruta: lib/actions/condicionesComerciales/condicionesComerciales.actions.ts

'use server';

import prisma from '@/app/admin/_lib/prismaClient';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { CondicionComercialSchema } from './condicionesComerciales.schemas';

const basePath = '/admin/configurar/condicionesComerciales';

export async function obtenerCondicionesComerciales() {
    return await prisma.condicionesComerciales.findMany({
        include: {
            CondicionesComercialesMetodoPago: {
                include: {
                    MetodoPago: {
                        select: {
                            id: true,
                            metodo_pago: true
                        }
                    }
                }
            }
        },
        orderBy: { orden: 'asc' },
    });
}

export async function obtenerCondicionComercial(id: string) {
    return await prisma.condicionesComerciales.findUnique({
        where: { id },
        include: {
            // Incluimos los métodos de pago asociados para pre-seleccionar en el formulario
            CondicionesComercialesMetodoPago: {
                select: {
                    metodoPagoId: true,
                },
            },
        },
    });
}

export async function crearCondicionComercial(data: unknown) {
    const validationResult = CondicionComercialSchema.safeParse(data);

    if (!validationResult.success) {
        return { success: false, error: validationResult.error.flatten().fieldErrors };
    }

    const { metodosPagoIds, ...condicionData } = validationResult.data;

    try {
        const dataToSave = {
            ...condicionData,
            descuento: condicionData.descuento ? parseFloat(condicionData.descuento) : null,
            porcentaje_anticipo: condicionData.porcentaje_anticipo ? parseFloat(condicionData.porcentaje_anticipo) : null,
        };

        // Usamos una transacción para asegurar que ambas operaciones (crear condición y enlazar métodos)
        // se completen con éxito.
        await prisma.$transaction(async (tx) => {
            const nuevaCondicion = await tx.condicionesComerciales.create({ data: dataToSave });

            await tx.condicionesComercialesMetodoPago.createMany({
                data: metodosPagoIds.map(metodoId => ({
                    condicionesComercialesId: nuevaCondicion.id,
                    metodoPagoId: metodoId,
                })),
            });
        });

    } catch (error) {
        console.error("Error al crear la condición comercial:", error);
        return { success: false, message: "No se pudo crear la condición." };
    }

    revalidatePath(basePath);
    redirect(basePath);
}

export async function actualizarCondicionComercial(data: unknown) {
    const validationResult = CondicionComercialSchema.safeParse(data);

    if (!validationResult.success) {
        return { success: false, error: validationResult.error.flatten().fieldErrors };
    }

    const { id, metodosPagoIds, ...condicionData } = validationResult.data;

    if (!id) {
        return { success: false, message: "ID no proporcionado." };
    }

    try {
        const dataToSave = {
            ...condicionData,
            descuento: condicionData.descuento ? parseFloat(condicionData.descuento) : null,
            porcentaje_anticipo: condicionData.porcentaje_anticipo ? parseFloat(condicionData.porcentaje_anticipo) : null,
        };

        // Transacción para actualizar la condición y sincronizar los métodos de pago
        interface CondicionComercialUpdateData {
            nombre: string;
            descripcion?: string | null;
            descuento?: number | null;
            porcentaje_anticipo?: number | null;
            orden?: number;
            // Agrega otros campos según tu modelo de Prisma
        }

        interface MetodoPagoAssociation {
            condicionesComercialesId: string;
            metodoPagoId: string;
        }

        await prisma.$transaction(async (tx) => {
            // 1. Actualizar la información principal
            await tx.condicionesComerciales.update({
                where: { id: id as string },
                data: dataToSave as CondicionComercialUpdateData,
            });

            // 2. Borrar las asociaciones antiguas
            await tx.condicionesComercialesMetodoPago.deleteMany({
                where: { condicionesComercialesId: id as string },
            });

            // 3. Crear las nuevas asociaciones
            await tx.condicionesComercialesMetodoPago.createMany({
                data: (metodosPagoIds as string[]).map((metodoId: string): MetodoPagoAssociation => ({
                    condicionesComercialesId: id as string,
                    metodoPagoId: metodoId,
                })),
            });
        });

    } catch (error) {
        console.error("Error al actualizar la condición comercial:", error);
        return { success: false, message: "No se pudo actualizar la condición." };
    }

    revalidatePath(basePath);
    redirect(basePath);
}

export async function eliminarCondicionComercial(id: string) {
    try {
        // Prisma se encargará de borrar en cascada las relaciones en la tabla intermedia
        await prisma.condicionesComerciales.delete({
            where: { id },
        });
    } catch (error) {
        console.error("Error al eliminar la condición comercial:", error);
        return { success: false, message: "No se pudo eliminar la condición." };
    }

    revalidatePath(basePath);
    redirect(basePath);
}

// =============================================================================
// FUNCIONES LEGACY MIGRADAS DESDE condicionesComerciales.actions.ts (ROOT)
// =============================================================================

/**
 * Obtiene condiciones comerciales activas
 * Migrada desde condicionesComerciales.actions.ts - FUNCIÓN MUY UTILIZADA
 */
export async function obtenerCondicionesComercialesActivas() {
    return await prisma.condicionesComerciales.findMany({
        where: {
            status: 'active'
        },
        orderBy: {
            orden: 'asc'
        }
    });
}

/**
 * Obtiene métodos de pago para una condición comercial
 * Migrada desde condicionesComerciales.actions.ts - FUNCIÓN MUY UTILIZADA  
 */
export async function obtenerCondicionesComercialesMetodosPago(condicionesComercialesId: string) {
    return await prisma.condicionesComercialesMetodoPago.findMany({
        where: {
            condicionesComercialesId
        },
        include: {
            MetodoPago: true
        },
        orderBy: {
            orden: 'asc'
        }
    });
}

/**
 * Obtiene condiciones comerciales activas CON métodos de pago asociados
 * Útil para validar que solo se muestren condiciones que realmente se pueden usar
 */
export async function obtenerCondicionesComercialesActivasConMetodos() {
    const condiciones = await prisma.condicionesComerciales.findMany({
        where: {
            status: 'active'
        },
        include: {
            CondicionesComercialesMetodoPago: {
                include: {
                    MetodoPago: true
                }
            }
        },
        orderBy: {
            orden: 'asc'
        }
    });

    // Filtrar solo las que tienen al menos un método de pago
    return condiciones.filter(condicion =>
        condicion.CondicionesComercialesMetodoPago.length > 0
    );
}
