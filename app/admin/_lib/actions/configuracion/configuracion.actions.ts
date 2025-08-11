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
            utilidad_servicio: parseFloat(validatedData.utilidad_servicio) / 100,
            utilidad_producto: parseFloat(validatedData.utilidad_producto) / 100,
            comision_venta: parseFloat(validatedData.comision_venta) / 100,
            sobreprecio: parseFloat(validatedData.sobreprecio) / 100,
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
            const utilidadBase = servicio.costo * utilidadPorcentaje;
            const denominador = 1 - (dataToSave.comision_venta + dataToSave.sobreprecio);
            const nuevoPrecioSistema = denominador > 0
                ? (servicio.costo + totalGastos + utilidadBase) / denominador
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

        return { success: true };

    } catch (error) {
        console.error("Error al actualizar la configuración y sincronizar precios:", error);
        return { success: false, error: { root: ["No se pudo completar la operación."] } };
    }
}
