// Ruta: app/admin/_lib/actions/agenda/agenda.actions.ts

'use server'

import prisma from '../../prismaClient';
import {
    AgendaCreateSchema,
    AgendaUpdateSchema,
    AgendaBusquedaSchema,
    AgendaStatusSchema,
    type AgendaCreateForm,
    type AgendaUpdateForm,
    type AgendaBusquedaForm,
    type AgendaStatusForm
} from './agenda.schemas';
import { revalidatePath } from 'next/cache';

// Obtener todas las agendas con paginación y filtros
export async function obtenerAgendasConFiltros(params?: AgendaBusquedaForm) {
    try {
        const validatedParams = AgendaBusquedaSchema.parse(params || {});
        const { search, status, agendaTipo, eventoId, fechaDesde, fechaHasta, page, limit } = validatedParams;

        const skip = (page - 1) * limit;

        // Construir condiciones de búsqueda
        const where: any = {};

        if (search) {
            where.OR = [
                { concepto: { contains: search, mode: 'insensitive' } },
                {
                    Evento: {
                        nombre: { contains: search, mode: 'insensitive' }
                    }
                },
                {
                    User: {
                        username: { contains: search, mode: 'insensitive' }
                    }
                }
            ];
        }

        if (status) {
            where.status = status;
        }

        if (agendaTipo) {
            where.agendaTipo = agendaTipo;
        }

        if (eventoId) {
            where.eventoId = eventoId;
        }

        if (fechaDesde || fechaHasta) {
            where.fecha = {};
            if (fechaDesde) where.fecha.gte = new Date(fechaDesde);
            if (fechaHasta) where.fecha.lte = new Date(fechaHasta);
        }

        // Ejecutar consultas en paralelo
        const [agendas, total] = await Promise.all([
            prisma.agenda.findMany({
                where,
                include: {
                    Evento: {
                        select: {
                            id: true,
                            nombre: true,
                            EventoTipo: {
                                select: {
                                    nombre: true,
                                }
                            }
                        }
                    },
                    User: {
                        select: {
                            id: true,
                            username: true,
                        }
                    }
                },
                orderBy: [
                    { fecha: 'asc' },
                    { hora: 'asc' },
                ],
                skip,
                take: limit,
            }),
            prisma.agenda.count({ where }),
        ]);

        return {
            success: true,
            data: agendas,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            }
        };
    } catch (error) {
        console.error('Error al obtener agendas:', error);
        return {
            success: false,
            message: 'Error al obtener la lista de agendas',
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

// Obtener agenda por ID
export async function obtenerAgenda(id: string) {
    try {
        const agenda = await prisma.agenda.findUnique({
            where: { id },
            include: {
                Evento: {
                    select: {
                        id: true,
                        nombre: true,
                        EventoTipo: {
                            select: {
                                nombre: true,
                            }
                        }
                    }
                },
                User: {
                    select: {
                        id: true,
                        username: true,
                    }
                }
            }
        });

        if (!agenda) {
            return {
                success: false,
                message: 'Agenda no encontrada'
            };
        }

        return {
            success: true,
            data: agenda
        };
    } catch (error) {
        console.error('Error al obtener agenda:', error);
        return {
            success: false,
            message: 'Error al obtener la agenda',
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

// Crear nueva agenda
export async function crearAgenda(data: AgendaCreateForm) {
    try {
        const validatedData = AgendaCreateSchema.parse(data);

        const nuevaAgenda = await prisma.agenda.create({
            data: {
                fecha: new Date(validatedData.fecha),
                hora: validatedData.hora,
                concepto: validatedData.concepto || null,
                agendaTipo: validatedData.agendaTipo,
                eventoId: validatedData.eventoId,
                ...(validatedData.userId ? { userId: validatedData.userId } : {}),
                status: validatedData.status,
                // id and updatedAt are omitted so Prisma will auto-generate them
            },
            include: {
                Evento: {
                    select: {
                        nombre: true,
                    }
                },
                User: {
                    select: {
                        username: true,
                    }
                }
            }
        });

        revalidatePath('/admin/dashboard/agenda');

        return {
            success: true,
            data: nuevaAgenda,
            message: 'Agenda creada exitosamente'
        };
    } catch (error) {
        console.error('Error al crear agenda:', error);
        return {
            success: false,
            message: 'Error al crear la agenda',
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

// Actualizar agenda
export async function actualizarAgenda(data: AgendaUpdateForm) {
    try {
        const validatedData = AgendaUpdateSchema.parse(data);
        const { id, ...updateData } = validatedData;

        const agendaActualizada = await prisma.agenda.update({
            where: { id },
            data: {
                ...updateData,
                fecha: updateData.fecha ? new Date(updateData.fecha) : undefined,
            },
            include: {
                Evento: {
                    select: {
                        nombre: true,
                    }
                },
                User: {
                    select: {
                        username: true,
                    }
                }
            }
        });

        revalidatePath('/admin/dashboard/agenda');

        return {
            success: true,
            data: agendaActualizada,
            message: 'Agenda actualizada exitosamente'
        };
    } catch (error) {
        console.error('Error al actualizar agenda:', error);
        return {
            success: false,
            message: 'Error al actualizar la agenda',
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

// Cambiar status de agenda
export async function cambiarStatusAgenda(data: AgendaStatusForm) {
    try {
        const validatedData = AgendaStatusSchema.parse(data);

        const agendaActualizada = await prisma.agenda.update({
            where: { id: validatedData.id },
            data: {
                status: validatedData.status,
            },
            include: {
                Evento: {
                    select: {
                        nombre: true,
                    }
                }
            }
        });

        revalidatePath('/admin/dashboard/agenda');

        return {
            success: true,
            data: agendaActualizada,
            message: `Agenda marcada como ${validatedData.status}`
        };
    } catch (error) {
        console.error('Error al cambiar status de agenda:', error);
        return {
            success: false,
            message: 'Error al cambiar el status de la agenda',
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

// Eliminar agenda
export async function eliminarAgenda(id: string) {
    try {
        await prisma.agenda.delete({
            where: { id }
        });

        revalidatePath('/admin/dashboard/agenda');

        return {
            success: true,
            message: 'Agenda eliminada exitosamente'
        };
    } catch (error) {
        console.error('Error al eliminar agenda:', error);
        return {
            success: false,
            message: 'Error al eliminar la agenda',
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

// Obtener agendas pendientes (para el componente actual)
export async function obtenerAgendasPendientes() {
    try {
        const agendas = await prisma.agenda.findMany({
            where: {
                status: 'pendiente'
            },
            include: {
                Evento: {
                    select: {
                        nombre: true,
                        EventoTipo: {
                            select: {
                                nombre: true,
                            }
                        }
                    }
                },
                User: {
                    select: {
                        username: true,
                    }
                }
            },
            orderBy: [
                { fecha: 'asc' },
                { hora: 'asc' },
            ]
        });

        return {
            success: true,
            data: agendas
        };
    } catch (error) {
        console.error('Error al obtener agendas pendientes:', error);
        return {
            success: false,
            message: 'Error al obtener agendas pendientes',
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

// =====================================
// CREAR AGENDA PARA EVENTO (Compatibilidad)
// =====================================

export async function crearAgendaEvento(agenda: any) {
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

// ====== FUNCIONES MIGRADAS DESDE ROOT/agenda.actions.ts ======

export async function verificarDisponibilidadFechaRootLegacy(fecha: Date, eventoIdExcluir?: string) {
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
                    not: 'CANCELADO' // No contar eventos cancelados
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

export async function obtenerAgendaConEventosRootLegacy() {
    try {
        const agenda = await prisma.agenda.findMany({
            include: {
                Evento: {
                    include: {
                        EventoTipo: true,
                        Cotizacion: {
                            include: {
                                Pago: true
                            }
                        }
                    }
                },
                User: true
            }
        });
        return agenda;
    } catch (error) {
        console.error('Error al obtener la agenda con eventos:', error);
        throw error;
    }
}

export async function obtenerAgendaDeEventoRootLegacy(eventoId: string) {
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

export async function eliminarAgendaEventoRootLegacy(agendaId: string) {
    try {
        await prisma.agenda.delete({
            where: { id: agendaId }
        });
        return { success: true };
    } catch (error) {
        console.error('Error al eliminar la agenda del evento:', error);
        throw error;
    }
}

export async function actualizarStatusAgendaActividadRootLegacy(agendaId: string, status: string) {
    try {
        await prisma.agenda.update({
            where: { id: agendaId },
            data: { status }
        });
        return { success: true };
    } catch (error) {
        console.error('Error al actualizar el status de la agenda:', error);
        throw error;
    }
}

export async function actualizarAgendaEventoRootLegacy(agenda: any) {
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
                agendaTipo: agenda.agendaTipo,
            }
        });
        return { success: true };
    } catch (error) {
        console.error('Error al actualizar la agenda del evento:', error);
        throw error;
    }
}
