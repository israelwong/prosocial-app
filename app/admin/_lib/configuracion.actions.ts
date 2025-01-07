'use server'
import { Configuracion } from "@/app/admin/_lib/types";

// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
import prisma from './prismaClient';

export async function obtenerConfiguraciones() {
    return await prisma.configuracion.findMany({
        orderBy: {
            updatedAt: 'desc'
        }
    });
}

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

export async function obtenerConfiguracion(id: string) {
    return await prisma.configuracion.findUnique({
        where: {
            id: id
        }
    });
}

export async function crearConfiguracion(configuracion: Configuracion) {
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

export async function actualizarConfiguracion(configuracion: Configuracion) {
    return await prisma.configuracion.update({
        where: {
            id: configuracion.id
        },
        data: {
            nombre: configuracion.nombre,
            utilidad_producto: Number(configuracion.utilidad_producto),
            utilidad_servicio: Number(configuracion.utilidad_servicio),
            comision_venta: Number(configuracion.comision_venta),
            sobreprecio: Number(configuracion.sobreprecio)
        }
    });
}