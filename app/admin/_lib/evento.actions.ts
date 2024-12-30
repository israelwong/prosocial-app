'use server';
import { PrismaClient } from "@prisma/client";
import { Evento } from "./types";

const prisma = new PrismaClient();

export async function obtenerEventos() {
    return prisma.evento.findMany({
        orderBy: {
            fecha_evento: 'desc'
        }
    });
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
        },
        orderBy: {
            fecha_evento: 'desc'
        }
    });
}

export async function validarDisponibilidadFecha(fecha_evento: Date) {
    const fechaSinHora = new Date(fecha_evento).toISOString().split('T')[0];
    // console.log(fechaSinHora); // Salida: 2024-12-27

    const eventos = await prisma.evento.findMany({
        where: {
            fecha_evento: {
                gte: new Date(fechaSinHora),
                lt: new Date(new Date(fechaSinHora).getTime() + 24 * 60 * 60 * 1000) // Menor que el día siguiente
            },
            status: 'autorizado'
        }
    });
    return eventos.length > 0;
}

export async function crearEvento(data: Evento) {
    try {
        const nuevoEvento = await prisma.evento.create({
            data: {
                clienteId: data.clienteId,
                eventoTipoId: data.eventoTipoId,
                nombre: data.nombre,
                fecha_evento: data.fecha_evento,
                status: data.status
            }
        });
        return { success: true, id: nuevoEvento.id };
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
    try {
        await prisma.evento.delete({
            where: { id }
        });
        return { success: true };
    } catch {
        return { success: false, message: 'No se puede eliminar el evento, tiene cotizaciones asociadas' };
    }
}

export async function obtenerEventosDetalle() {
    const eventos = await prisma.evento.findMany({
        include: {
            EventoTipo: {
                select: {
                    nombre: true
                }
            },
            Cliente: {
                select: {
                    nombre: true
                }
            }
        },
        orderBy: {
            fecha_evento: 'asc'
        }
    });

    const eventosDetalle = await Promise.all(eventos.map(async evento => {
        let user = null;
        if (evento.userId) {
            user = await prisma.user.findUnique({
                where: {
                    id: evento.userId
                }
            });
        }

        return {
            id: evento.id,
            evento: evento.nombre,
            cliente: evento.Cliente.nombre,
            tipoEvento: evento.EventoTipo?.nombre,
            user: user?.username,
            fecha_evento: evento.fecha_evento,
            creacion: evento.createdAt,
            fecha_actualizacion: evento.updatedAt,
            status: evento.status,
        };
    }));

    return eventosDetalle;
}

export async function asignarEventoUser(eventoId: string, userId: string, status: string) {
    await prisma.evento.update({
        where: {
            id: eventoId
        },
        data: {
            userId,
            status
        }
    });
}


export async function actualizarEventoStatus(data: { eventoId: string, status: string }) {
    await prisma.evento.update({
        where: {
            id: data.eventoId
        },
        data: {
            status: data.status
        }
    });
}

export async function obtenerEventosAprobados() {
    return prisma.evento.findMany({
        where: {
            status: 'aprobado'
        }
    });
}

export async function obtenerEventoSeguimiento(eventoId: string) {

    const evento = await prisma.evento.findUnique({
        where: {
            id: eventoId
        },
        include: {
            EventoTipo: {
                select: {
                    nombre: true
                }
            }
        }
    });

    if (!evento) {
        return { error: 'Evento no encontrado' };
    }

    const cliente = await prisma.cliente.findUnique({
        where: {
            id: evento.clienteId
        }
    });

    const cotizacion = await prisma.cotizacion.findFirst({
        where: {
            eventoId,
            status: 'aprobada'
        }
    });

    const cotizacionServicio = await prisma.cotizacionServicio.findMany({
        where: {
            cotizacionId: cotizacion?.id
        }
    });

    const pago = await prisma.pago.findMany({
        where: {
            cotizacionId: cotizacion?.id
        }
    });

    return {
        evento,
        tipoEvento: evento.EventoTipo?.nombre,
        cliente,
        cotizacion,
        cotizacionServicio,
        pago,
    };

}