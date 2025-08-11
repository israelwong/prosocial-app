// Ruta: lib/actions/metodoPago/metodoPago.actions.ts

'use server';

import prisma from '@/app/admin/_lib/prismaClient';
import { revalidatePath } from 'next/cache';
import { MetodoPagoSchema } from './metodoPago.schemas';
import { redirect } from 'next/navigation';

const basePath = '/admin/configurar/metodoPago';

// Función para obtener todos los métodos de pago
export async function obtenerMetodosPago() {
    return await prisma.metodoPago.findMany({
        orderBy: {
            orden: 'asc'
        }
    });
}

// Función para obtener un método de pago específico por ID
export async function obtenerMetodoPago(id: string) {
    return await prisma.metodoPago.findUnique({
        where: { id }
    });
}

// Función para crear un nuevo método de pago
export async function crearMetodoPago(data: unknown) {
    const validationResult = MetodoPagoSchema.safeParse(data);

    if (!validationResult.success) {
        return {
            success: false,
            error: validationResult.error.flatten().fieldErrors,
        };
    }

    const { id, ...metodoData } = validationResult.data;

    try {
        const dataToSave = {
            ...metodoData,
            comision_porcentaje_base: metodoData.comision_porcentaje_base ? parseFloat(metodoData.comision_porcentaje_base) : null,
            comision_fija_monto: metodoData.comision_fija_monto ? parseFloat(metodoData.comision_fija_monto) : null,
            num_msi: metodoData.num_msi ? parseInt(metodoData.num_msi, 10) : null,
            comision_msi_porcentaje: metodoData.comision_msi_porcentaje ? parseFloat(metodoData.comision_msi_porcentaje) : null,
        };

        await prisma.metodoPago.create({ data: dataToSave });

    } catch (error) {
        console.error("Error al crear método de pago:", error);
        return { success: false, message: "No se pudo crear el método de pago." };
    }

    revalidatePath(basePath);
    redirect(basePath);
}

// Función para actualizar un método de pago existente
export async function actualizarMetodoPago(data: unknown) {
    const validationResult = MetodoPagoSchema.safeParse(data);

    if (!validationResult.success) {
        return {
            success: false,
            error: validationResult.error.flatten().fieldErrors,
        };
    }

    const { id, ...metodoData } = validationResult.data;

    if (!id) {
        return { success: false, message: "ID no proporcionado." };
    }

    try {
        const dataToSave = {
            ...metodoData,
            comision_porcentaje_base: metodoData.comision_porcentaje_base ? parseFloat(metodoData.comision_porcentaje_base) : null,
            comision_fija_monto: metodoData.comision_fija_monto ? parseFloat(metodoData.comision_fija_monto) : null,
            num_msi: metodoData.num_msi ? parseInt(metodoData.num_msi, 10) : null,
            comision_msi_porcentaje: metodoData.comision_msi_porcentaje ? parseFloat(metodoData.comision_msi_porcentaje) : null,
        };

        await prisma.metodoPago.update({
            where: { id },
            data: dataToSave,
        });

    } catch (error) {
        console.error("Error al actualizar método de pago:", error);
        return { success: false, message: "No se pudo actualizar el método de pago." };
    }

    revalidatePath(basePath);
    redirect(basePath);
}

// Función para eliminar un método de pago
export async function eliminarMetodoPago(id: string) {
    try {
        await prisma.metodoPago.delete({
            where: { id },
        });
    } catch (error) {
        console.error("Error al eliminar método de pago:", error);
        return { success: false, message: "No se pudo eliminar el método de pago." };
    }

    revalidatePath(basePath);
    redirect(basePath);
}
