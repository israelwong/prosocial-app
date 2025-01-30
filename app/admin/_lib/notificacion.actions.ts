'use server'
import { Notificacion } from './types';
import prisma from './prismaClient';
export async function obtenerNotificaciones() {
    return await prisma.notificacion.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    })
}

export async function crearNotificacion(data: Notificacion) {
    return await prisma.notificacion.create({
        data: {
            userId: data.userId,
            titulo: data.titulo,
            mensaje: data.mensaje,
            status: 'pendiente',
            cotizacionId: data.cotizacionId
        }
    });
}