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

export async function verificarDisponibilidadFecha(fecha: Date, eventoIdExcluir?: string) {
    try {
        // Convertir fecha a inicio y fin del día para búsqueda
        const inicioDelDia = new Date(fecha)
        inicioDelDia.setHours(0, 0, 0, 0)

        const finDelDia = new Date(fecha)
        finDelDia.setHours(23, 59, 59, 999)

        // Buscar eventos en agenda para esa fecha (excluyendo el evento actual si se especifica)
        const eventosEnFecha = await prisma.agenda.findMany({
            where: {
                fecha: {
                    gte: inicioDelDia,
                    lte: finDelDia
                },
                ...(eventoIdExcluir && {
                    eventoId: {
                        not: eventoIdExcluir
                    }
                }),
                status: {
                    not: 'cancelado' // No contar eventos cancelados
                }
            },
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
                }
            }
        })

        return {
            disponible: eventosEnFecha.length === 0,
            eventosEnFecha: eventosEnFecha
        }
    } catch (error) {
        console.error('Error al verificar disponibilidad de fecha:', error)
        throw error
    }
}