'use server'

// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
import prisma from './prismaClient';

export async function obtenerEventoBitacora(eventoId: string) {
    const bitacora = await prisma.eventoBitacora.findMany({
        where: {
            eventoId
        },
        orderBy: {
            createdAt: 'asc'
        }
    });
    return bitacora;
}

export async function obtenerBitacora(bitacoraId: string) {
    const bitacora = await prisma.eventoBitacora.findUnique({
        where: {
            id: bitacoraId
        }
    });
    return bitacora;
}

export async function crearBitacoraEvento(eventoId: string, anotacion: string) {
    const bitacora = await prisma.eventoBitacora.create({
        data: {
            eventoId,
            comentario: anotacion
        }
    });
    return bitacora;
}

export async function eliminarBitacoraEvento(bitacoraId: string) {
    const bitacora = await prisma.eventoBitacora.delete({
        where: {
            id: bitacoraId
        }
    });
    return bitacora;
}

export async function actualizarBitacoraEvento(bitacoraId: string, anotacion: string) {
    const bitacora = await prisma.eventoBitacora.update({
        where: {
            id: bitacoraId
        },
        data: {
            comentario: anotacion
        }
    });
    return bitacora;
}