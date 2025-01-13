'use server'
import prisma from './prismaClient';
import { Agenda } from './types';

export async function obtenerAgenda() {
    return await prisma.agenda.findMany();
}

export async function obtenerAgendaConEventos() {
    try {
        return await prisma.agenda.findMany({
            include: {
                Evento: {
                    select: {
                        nombre: true,
                        EventoTipo: {
                            select: {
                                nombre: true
                            }
                        }
                    }
                },
                User: {
                    select: {
                        username: true
                    }
                }
            },
            orderBy: {
                fecha: 'asc'
            }
        });
    } catch (error) {
        console.error('Error al obtener la agenda con eventos:', error);
        throw error;
    }
}

export async function obtenerAgendaPorEvento(agendaId: string) {
    try {
        return await prisma.agenda.findFirst({
            where: { id: agendaId }
        });
    } catch (error) {
        console.error('Error al obtener la agenda por evento:', error);
        throw error;
    }
}

export async function obtenerAgendaDeEvento(eventoId: string) {
    try {
        return await prisma.agenda.findMany({
            where: { eventoId },
            orderBy: {
                fecha: 'asc'
            }
        });
    } catch (error) {
        console.error('Error al obtener la agenda del evento:', error);
        throw error;
    }
}

export async function crearAgendaEvento(agenda: Agenda) {

    try {
        await prisma.agenda.create({
            data: {
                concepto: agenda.concepto,
                descripcion: agenda.descripcion,
                googleMapsUrl: agenda.googleMapsUrl,
                direccion: agenda.direccion,
                fecha: agenda.fecha,
                hora: agenda.hora,
                eventoId: agenda.eventoId ?? '',
                userId: agenda.userId ?? '',
                agendaTipo: agenda.agendaTipo,
            }
        });
        return { success: true };
    } catch (error) {
        console.error('Error al crear la agenda del evento:', (error as Error).message);
        throw error;
    }
}

export async function actualizarAgendaEvento(agenda: Agenda) {
    try {
        await prisma.agenda.update({
            where: { id: agenda.id },
            data: {
                concepto: agenda.concepto,
                descripcion: agenda.descripcion,
                googleMapsUrl: agenda.googleMapsUrl,
                direccion: agenda.direccion,
                fecha: agenda.fecha,
                hora: agenda.hora,
            }
        });
        return { success: true };
    } catch (error) {
        console.error('Error al actualizar la agenda del evento:', error);
        throw error;
    }
}

export async function eliminarAgendaEvento(agendaId: string) {
    try {
        await prisma.agenda.delete({ where: { id: agendaId } });
        return { success: true };
    } catch (error) {
        console.error('Error al eliminar la agenda del evento:', error);
        throw error;

    }
}

export async function actualzarStatusAgendaActividad(agendaId: string, status: string) {
    try {
        await prisma.agenda.update({
            where: { id: agendaId },
            data: {
                status
            }
        });
        return { success: true };
    } catch (error) {
        console.error('Error al actualizar el status de la agenda:', error);
        throw error;
    }
}