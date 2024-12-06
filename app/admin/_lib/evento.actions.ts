'use server';
import { PrismaClient } from "@prisma/client";
import { Evento } from "./types";
const prisma = new PrismaClient();

export async function obtenerEventos() {
    return prisma.evento.findMany();
}

export async function obtenerEventoPorId(id: string) {
    return prisma.evento.findUnique({
        where: { id }
    });
}

export async function obtenerEventosPorCliente(clienteId: string) {
    return await prisma.evento.findMany({
        where: {
            clienteId
        }
    });
}

export async function crearEvento(data: Evento) {
    try {
        await prisma.evento.create({
            data: {
                clienteId: data.clienteId,
                eventoTipoId: data.eventoTipoId,
                nombre: data.nombre,
                fecha_evento: data.fecha_evento
            }
        });
        return { success: true };
    } catch {
        return { error: 'Error creating event' };
    }
}

export async function actualizarEvento(evento: Evento) {
    try {
        await prisma.evento.update({
            where: {
                id: evento.id
            },
            data: {
                eventoTipoId: evento.eventoTipoId,
                nombre: evento.nombre,
                fecha_evento: evento.fecha_evento,
                status: evento.status
            }
        });
        return { success: true };
    } catch {
        return { error: 'Error updating event' };
    }
}

export async function eliminarEvento(id: string) {
    return prisma.evento.delete({
        where: { id }
    });
}

