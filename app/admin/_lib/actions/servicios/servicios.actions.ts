// Ruta: app/admin/_lib/actions/servicios/servicios.actions.ts

'use server';

import prisma from '@/app/admin/_lib/prismaClient';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ServicioSchema } from './servicios.schemas';
import { z } from 'zod';
import { getGlobalConfiguracion } from '@/app/admin/_lib/actions/configuracion/configuracion.actions';


const basePath = '/admin/configurar/servicios';

// --- Funciones de Lectura ---
export async function obtenerServiciosPorCategoria() {
    return await prisma.servicioCategoria.findMany({
        include: {
            Servicio: {
                orderBy: { posicion: 'asc' },
            },
        },
        orderBy: { posicion: 'asc' },
    });
}

export async function obtenerServicio(id: string) {
    return await prisma.servicio.findUnique({
        where: { id },
        include: { ServicioGasto: true },
    });
}


// --- Funciones de Escritura ---
async function upsertServicio(data: unknown) {
    const validationResult = ServicioSchema.safeParse(data);
    if (!validationResult.success) return { success: false, error: validationResult.error.flatten().fieldErrors };

    const { id, gastos, ...validatedData } = validationResult.data;
    const costo = parseFloat(validatedData.costo);
    const totalGastos = gastos?.reduce((acc, g) => acc + parseFloat(g.costo), 0) ?? 0;

    try {
        const configuracion = await getGlobalConfiguracion();
        if (!configuracion) throw new Error("La configuración base no existe.");

        // CÁLCULO EN EL BACKEND - CORREGIDO
        const utilidadPorcentaje = (validatedData.tipo_utilidad === 'servicio' ? configuracion.utilidad_servicio : configuracion.utilidad_producto);
        const comisionPorcentaje = configuracion.comision_venta;
        const sobreprecioPorcentaje = configuracion.sobreprecio;

        const utilidadBase = costo * utilidadPorcentaje;
        const subtotal = costo + totalGastos + utilidadBase;
        const sobreprecioMonto = subtotal * sobreprecioPorcentaje;
        const montoTrasSobreprecio = subtotal + sobreprecioMonto;
        const denominador = 1 - comisionPorcentaje; // Solo comisión, no sobreprecio
        const precioSistema = denominador > 0 ? (montoTrasSobreprecio / denominador) : 0;

        const dataToSave = {
            ...validatedData,
            costo,
            gasto: totalGastos,
            utilidad: utilidadBase,
            precio_publico: precioSistema, // El Precio Sistema se guarda como Precio Público
        };

        const result = await prisma.$transaction(async (tx) => {
            const count = await tx.servicio.count({ where: { servicioCategoriaId: dataToSave.servicioCategoriaId } });
            const servicioResult = await tx.servicio.upsert({
                where: { id: id || '' },
                update: dataToSave,
                create: { ...dataToSave, posicion: count + 1 },
            });

            const servicioId = id || servicioResult.id;
            await tx.servicioGasto.deleteMany({ where: { servicioId } });
            if (gastos && gastos.length > 0) {
                await tx.servicioGasto.createMany({
                    data: gastos.map(g => ({ nombre: g.nombre, costo: parseFloat(g.costo), servicioId })),
                });
            }
            return servicioResult;
        });
        return { success: true, data: result };

    } catch (error) {
        console.error("Error al guardar el servicio:", error);
        return { success: false, message: "No se pudo guardar el servicio." };
    }
}

export async function crearServicio(data: unknown) {
    const result = await upsertServicio(data);
    if (result.success) {
        revalidatePath(basePath);
        redirect(basePath);
    }
    return result;
}

export async function actualizarServicio(data: unknown) {
    const result = await upsertServicio(data);
    if (result.success) {
        revalidatePath(basePath);
        if (result.data && result.data.id) {
            revalidatePath(`${basePath}/${result.data.id}`);
        }
        return { success: true };
    }
    return result;
}

export async function eliminarServicio(id: string) {
    try {
        // Verificar si el servicio está en uso en paquetes
        const paquetesConServicio = await prisma.paqueteServicio.findMany({
            where: { servicioId: id }
        });

        if (paquetesConServicio.length > 0) {
            console.error('No se puede eliminar el servicio porque está en uso en paquetes');
            return { success: false, message: 'El servicio está en uso en paquetes.' };
        }

        // Eliminar gastos asociados al servicio
        await prisma.servicioGasto.deleteMany({
            where: { servicioId: id }
        });

        // Eliminar el servicio
        await prisma.servicio.delete({
            where: { id }
        });

        revalidatePath(basePath);
        return { success: true };
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('Error eliminando servicio:', errorMsg);
        return { success: false, message: `No se pudo eliminar el servicio: ${errorMsg}` };
    }
}

// --- ¡NUEVAS FUNCIONES AÑADIDAS! ---

export async function actualizarPosicionServicio(items: { id: string, posicion: number }[]) {
    try {
        await prisma.$transaction(
            items.map(item =>
                prisma.servicio.update({
                    where: { id: item.id },
                    data: { posicion: item.posicion },
                })
            )
        );
        revalidatePath(basePath);
        return { success: true };
    } catch (error) {
        console.error("Error al reordenar servicios:", error);
        return { success: false, message: "No se pudo guardar el nuevo orden." };
    }
}

export async function duplicarServicio(id: string) {
    try {
        const servicioOriginal = await prisma.servicio.findUnique({
            where: { id },
            include: { ServicioGasto: true },
        });

        if (!servicioOriginal) throw new Error("Servicio no encontrado");

        await prisma.servicio.create({
            data: {
                ...servicioOriginal,
                id: undefined, // Dejar que Prisma genere un nuevo ID
                nombre: `${servicioOriginal.nombre} (Copia)`,
                posicion: await prisma.servicio.count() + 1,
                ServicioGasto: {
                    create: servicioOriginal.ServicioGasto.map(gasto => ({
                        nombre: gasto.nombre,
                        costo: gasto.costo,
                    })),
                },
            },
        });
        revalidatePath(basePath);
        return { success: true };
    } catch (error) {
        console.error("Error al duplicar servicio:", error);
        return { success: false, message: "No se pudo duplicar el servicio." };
    }
}

export async function actualizarVisibilidadCliente(id: string, visible: boolean) {
    try {
        await prisma.servicio.update({
            where: { id },
            data: { visible_cliente: visible },
        });
        revalidatePath(basePath);
        return { success: true };
    } catch (error) {
        console.error("Error al actualizar visibilidad:", error);
        return { success: false, message: "No se pudo cambiar la visibilidad." };
    }
}

// =============================================================================
// FUNCIONES MIGRADAS DESDE /servicio/servicio.actions.ts
// =============================================================================

export async function obtenerServicos() {
    return prisma.servicio.findMany({
        orderBy: {
            posicion: 'asc'
        }
    });
}

export async function obtenerServiciosActivos() {
    return prisma.servicio.findMany({
        where: {
            status: 'active'
        },
        orderBy: {
            posicion: 'asc'
        }
    });
}

export async function obtenerServicioPorCategoria(id: string) {
    const tareas = await prisma.servicio.findMany({
        where: {
            servicioCategoriaId: id
        },
        orderBy: {
            posicion: 'asc'
        }
    });
    return tareas.length > 0 ? tareas : null;
}

export async function cambiarCategoriaTarea(id: string, categoriaId: string) {
    const updatedTarea = await prisma.servicio.update({
        where: { id: id },
        data: { servicioCategoriaId: categoriaId }
    });
    return updatedTarea;
}

export async function actualizarCategoriaTarea(id: string, categoriaId: string) {
    const updatedTarea = await prisma.servicio.update({
        where: { id: id },
        data: { servicioCategoriaId: categoriaId }
    });
    return updatedTarea;
}

export async function obtenerServiciosAdyacentes(servicioId: string): Promise<{ servicioAnterior: any | null, servicioSiguiente: any | null }> {
    const servicioActual = await prisma.servicio.findUnique({
        where: { id: servicioId },
        select: { posicion: true, servicioCategoriaId: true }
    });

    if (!servicioActual) {
        return { servicioAnterior: null, servicioSiguiente: null };
    }

    const servicioAnterior = await prisma.servicio.findFirst({
        where: {
            servicioCategoriaId: servicioActual.servicioCategoriaId,
            posicion: { lt: servicioActual.posicion }
        },
        orderBy: { posicion: 'desc' }
    });

    const servicioSiguiente = await prisma.servicio.findFirst({
        where: {
            servicioCategoriaId: servicioActual.servicioCategoriaId,
            posicion: { gt: servicioActual.posicion }
        },
        orderBy: { posicion: 'asc' }
    });

    return { servicioAnterior, servicioSiguiente };
}

export async function obtenerServiciosConRelaciones() {
    return await prisma.servicio.findMany({
        include: {
            ServicioCategoria: {
                include: {
                    seccionCategoria: {
                        include: {
                            Seccion: true
                        }
                    }
                }
            }
        },
        orderBy: [
            { ServicioCategoria: { seccionCategoria: { Seccion: { posicion: 'asc' } } } },
            { ServicioCategoria: { posicion: 'asc' } },
            { posicion: 'asc' }
        ]
    });
}
