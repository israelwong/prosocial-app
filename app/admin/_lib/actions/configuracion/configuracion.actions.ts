// Ruta: lib/actions/configuracion/configuracion.actions.ts

'use server';

import prisma from '@/app/admin/_lib/prismaClient'; // Revisa que la ruta sea correcta
import { revalidatePath } from 'next/cache';
import { ConfiguracionSchema } from './configuracion.schemas';

// La función para obtener la configuración no cambia.
export async function getGlobalConfiguracion() {
    let configuracion = await prisma.configuracion.findFirst();

    if (!configuracion) {
        configuracion = await prisma.configuracion.create({
            data: {
                nombre: `Configuración General`,
                utilidad_servicio: 30,
                utilidad_producto: 0.3,
                comision_venta: 0.1,
                sobreprecio: 0.1,
                status: 'active',
                numeroMaximoServiciosPorDia: 1,
            },
        });
    }
    return configuracion;
}

export async function updateGlobalConfiguracion(data: unknown) {
    const validationResult = ConfiguracionSchema.safeParse(data);

    if (!validationResult.success) {
        return {
            success: false,
            error: validationResult.error.flatten().fieldErrors,
        };
    }

    try {
        const { id, ...validatedData } = validationResult.data;

        const dataToSave = {
            ...validatedData,
            utilidad_servicio: parseFloat((parseFloat(validatedData.utilidad_servicio) / 100).toFixed(4)),
            utilidad_producto: parseFloat((parseFloat(validatedData.utilidad_producto) / 100).toFixed(4)),
            comision_venta: parseFloat((parseFloat(validatedData.comision_venta) / 100).toFixed(4)),
            sobreprecio: parseFloat((parseFloat(validatedData.sobreprecio) / 100).toFixed(4)),
            numeroMaximoServiciosPorDia: validatedData.numeroMaximoServiciosPorDia ? parseInt(validatedData.numeroMaximoServiciosPorDia, 10) : null,
        };

        // --- SOLUCIÓN: Separamos las operaciones ---

        // 1. Actualizamos la configuración base. Esta es una operación rápida.
        await prisma.configuracion.update({
            where: { id },
            data: dataToSave,
        });

        // 2. Obtenemos todos los servicios existentes para el recálculo masivo.
        const todosLosServicios = await prisma.servicio.findMany({
            include: { ServicioGasto: true },
        });

        // 3. Preparamos la lista de operaciones de actualización de precios.
        const updatePromises = todosLosServicios.map(servicio => {
            const totalGastos = servicio.ServicioGasto.reduce((acc, gasto) => acc + gasto.costo, 0);
            const utilidadPorcentaje = servicio.tipo_utilidad === 'servicio'
                ? dataToSave.utilidad_servicio
                : dataToSave.utilidad_producto;

            // CÁLCULO CORREGIDO - usando la misma lógica que calcularServicioDesdeBase
            const utilidadBase = parseFloat((servicio.costo * utilidadPorcentaje).toFixed(2));
            const subtotal = parseFloat((servicio.costo + totalGastos + utilidadBase).toFixed(2));
            const sobreprecioMonto = parseFloat((subtotal * dataToSave.sobreprecio).toFixed(2));
            const montoTrasSobreprecio = parseFloat((subtotal + sobreprecioMonto).toFixed(2));
            const denominador = 1 - dataToSave.comision_venta; // Solo comisión, no sobreprecio
            const nuevoPrecioSistema = denominador > 0
                ? parseFloat((montoTrasSobreprecio / denominador).toFixed(2))
                : 0;

            return prisma.servicio.update({
                where: { id: servicio.id },
                data: {
                    precio_publico: nuevoPrecioSistema,
                    utilidad: utilidadBase
                },
            });
        });

        // 4. Ejecutamos todas las actualizaciones de precios a la vez.
        // Esto ocurre fuera de la transacción inicial, por lo que no tiene el límite de 5 segundos.
        await Promise.all(updatePromises);

        // 5. Revalidamos las rutas para que los cambios se reflejen en la UI.
        revalidatePath("/admin/configurar/parametros");
        revalidatePath("/admin/configurar/servicios");
        revalidatePath("/admin/configurar/catalogo");

        return { success: true };

    } catch (error) {
        console.error("Error al actualizar la configuración y sincronizar precios:", error);
        return { success: false, error: { root: ["No se pudo completar la operación."] } };
    }
}

// =============================================================================
// FUNCIONES LEGACY MIGRADAS DESDE configuracion.actions.ts (ROOT)
// =============================================================================

/**
 * Obtiene todas las configuraciones
 * Migrada desde configuracion.actions.ts
 */
export async function obtenerConfiguraciones() {
    return await prisma.configuracion.findMany({
        orderBy: {
            updatedAt: 'desc'
        }
    });
}

/**
 * Obtiene la configuración activa
 * Migrada desde configuracion.actions.ts - FUNCIÓN MUY UTILIZADA
 */
export async function obtenerConfiguracionActiva() {
    return await prisma.configuracion.findFirst({
        where: {
            status: 'active'
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });
}

/**
 * Obtiene una configuración por ID
 * Migrada desde configuracion.actions.ts
 */
export async function obtenerConfiguracion(id: string) {
    return await prisma.configuracion.findUnique({
        where: {
            id: id
        }
    });
}

/**
 * Crea nueva configuración
 * Migrada desde configuracion.actions.ts
 */
export async function crearConfiguracion(configuracion: any) {
    return await prisma.configuracion.create({
        data: {
            nombre: configuracion.nombre,
            utilidad_producto: Number(configuracion.utilidad_producto),
            utilidad_servicio: Number(configuracion.utilidad_servicio),
            comision_venta: Number(configuracion.comision_venta),
            sobreprecio: Number(configuracion.sobreprecio)
        }
    });
}

/**
 * Actualiza configuración existente
 * Migrada desde configuracion.actions.ts
 */
export async function actualizarConfiguracion(configuracion: any) {
    return await prisma.configuracion.update({
        where: {
            id: configuracion.id
        },
        data: {
            nombre: configuracion.nombre,
            utilidad_producto: Number(configuracion.utilidad_producto),
            utilidad_servicio: Number(configuracion.utilidad_servicio),
            comision_venta: Number(configuracion.comision_venta),
            sobreprecio: Number(configuracion.sobreprecio),
            claveAutorizacion: configuracion.claveAutorizacion,
        }
    });
}

/**
 * Valida código de autorización
 * Migrada desde configuracion.actions.ts
 */
export async function validarCondigoAutorizacion(clave: string) {
    return await prisma.configuracion.findFirst({
        where: {
            claveAutorizacion: clave
        }
    });
}
