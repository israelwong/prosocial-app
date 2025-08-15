// Ruta: app/admin/_lib/actions/agenda/agenda.actions-v2.ts

'use server'

import prisma from '@/app/admin/_lib/prismaClient';
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
export async function obtenerAgendasConFiltrosV2(params?: AgendaBusquedaForm) {
    try {
        const validatedParams = AgendaBusquedaSchema.parse(params || {});
        const { search, status, agendaTipo, eventoId, fechaDesde, fechaHasta, page, limit } = validatedParams;
        const skip = (page - 1) * limit;

        // Construir condiciones de búsqueda
        interface WhereCondition {
            OR?: Array<Record<string, unknown>>;
            status?: string;
            agendaTipo?: string;
            eventoId?: string;
            fecha?: {
                gte?: Date;
                lte?: Date;
            };
        }

        const where: WhereCondition = {};

        if (search) {
            where.OR = [
                { concepto: { contains: search, mode: 'insensitive' } },
                { descripcion: { contains: search, mode: 'insensitive' } },
                { Evento: { nombre: { contains: search, mode: 'insensitive' } } },
                { User: { username: { contains: search, mode: 'insensitive' } } }
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
            if (fechaDesde) {
                where.fecha.gte = new Date(fechaDesde);
            }
            if (fechaHasta) {
                where.fecha.lte = new Date(fechaHasta + 'T23:59:59.999Z');
            }
        }

        const [agendas, total] = await Promise.all([
            prisma.agenda.findMany({
                where,
                include: {
                    Evento: {
                        select: {
                            id: true,
                            nombre: true,
                            fecha_evento: true,
                            Cliente: {
                                select: {
                                    nombre: true
                                }
                            }
                        }
                    },
                    User: {
                        select: {
                            id: true,
                            username: true
                        }
                    }
                },
                orderBy: [
                    { fecha: 'desc' },
                    { hora: 'desc' }
                ],
                skip,
                take: limit
            }),
            prisma.agenda.count({ where })
        ]);

        return {
            success: true,
            data: {
                agendas,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        };

    } catch (error) {
        console.error('Error obteniendo agendas:', error);
        return {
            success: false,
            error: 'Error obteniendo las agendas'
        };
    }
}

// Crear nueva agenda
export async function crearAgendaV2(data: AgendaCreateForm) {
    try {
        const validatedData = AgendaCreateSchema.parse(data);

        const nuevaAgenda = await prisma.agenda.create({
            data: {
                id: crypto.randomUUID(),
                updatedAt: new Date(),
                fecha: new Date(validatedData.fecha),
                hora: validatedData.hora,
                concepto: validatedData.concepto || null,
                agendaTipo: validatedData.agendaTipo,
                eventoId: validatedData.eventoId,
                userId: validatedData.userId,
                status: validatedData.status,
            },
            include: {
                Evento: {
                    select: {
                        nombre: true,
                    }
                },
                User: {
                    select: {
                        username: true
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
        console.error('Error creando agenda:', error);
        return {
            success: false,
            error: 'Error creando la agenda'
        };
    }
}

// Obtener agenda de un evento específico
export async function obtenerAgendaDeEventoV2(eventoId: string) {
    try {
        const agendas = await prisma.agenda.findMany({
            where: {
                eventoId
            },
            include: {
                User: {
                    select: {
                        username: true
                    }
                }
            },
            orderBy: [
                { fecha: 'desc' },
                { hora: 'desc' }
            ]
        });

        return {
            success: true,
            data: agendas
        };

    } catch (error) {
        console.error('Error obteniendo agenda del evento:', error);
        return {
            success: false,
            error: 'Error obteniendo la agenda del evento'
        };
    }
}

// Actualizar agenda
export async function actualizarAgendaV2(data: AgendaUpdateForm) {
    try {
        const validatedData = AgendaUpdateSchema.parse(data);
        const { id, ...updateData } = validatedData;

        const agendaActualizada = await prisma.agenda.update({
            where: { id },
            data: {
                ...updateData,
                fecha: updateData.fecha ? new Date(updateData.fecha) : undefined,
                updatedAt: new Date()
            },
            include: {
                Evento: {
                    select: {
                        nombre: true,
                    }
                },
                User: {
                    select: {
                        username: true
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
        console.error('Error actualizando agenda:', error);
        return {
            success: false,
            error: 'Error actualizando la agenda'
        };
    }
}

// Actualizar status de agenda
export async function actualizarStatusAgendaV2(data: AgendaStatusForm) {
    try {
        const validatedData = AgendaStatusSchema.parse(data);

        const agendaActualizada = await prisma.agenda.update({
            where: { id: validatedData.id },
            data: {
                status: validatedData.status,
                updatedAt: new Date()
            }
        });

        revalidatePath('/admin/dashboard/agenda');

        return {
            success: true,
            data: agendaActualizada,
            message: 'Status actualizado exitosamente'
        };

    } catch (error) {
        console.error('Error actualizando status:', error);
        return {
            success: false,
            error: 'Error actualizando el status'
        };
    }
}
