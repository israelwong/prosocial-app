'use server'
import { EventoTipo } from "@/app/admin/_lib/types";
import prisma from './prismaClient';

export async function obtenerTiposEvento() {
    return await prisma.eventoTipo.findMany({
        orderBy: {
            posicion: 'asc'
        }
    });
}

export async function obtenerTipoEvento(id: string) {
    return await prisma.eventoTipo.findUnique({
        where: { id }
    });
}

export async function crearTipoEvento(data: { nombre: string, descripcion?: string }) {
    return await prisma.eventoTipo.create({
        data:
        {
            nombre: data.nombre,
        }
    });
}

export async function actualizarTipoEvento(id: string, nombre: string) {
    console.log('Actualizar tipo de evento:', id, nombre);
    return await prisma.eventoTipo.update({
        where: { id },
        data: { nombre }
    });
}

export async function eliminarTipoEvento(id: string) {
    return await prisma.eventoTipo.delete({
        where: { id }
    });
}

export async function actualizarPosicionTipoEvento(data: EventoTipo[]) {
    data.forEach(async (item) => {
        await prisma.eventoTipo.update({
            where: { id: item.id },
            data: { posicion: item.posicion }
        });
    })
}