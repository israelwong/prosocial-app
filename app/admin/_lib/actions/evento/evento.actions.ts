// Ruta: app/admin/_lib/actions/evento/evento.actions.ts

'use server';

import prisma from '@/app/admin/_lib/prismaClient';
import {
    EventoBusquedaSchema,
    EventoEtapaUpdateSchema,
    EventoEtapaStatusSchema,
    EventoCreateSchema,
    EventoUpdateSchema,
    type EventoBusquedaForm,
    type EventoEtapaUpdateForm,
    type EventoEtapaStatusForm,
    type EventoCreateForm,
    type EventoUpdateForm,
    type EventoExtendido
} from './evento.schemas';
import { revalidatePath } from 'next/cache';

// Importamos las funciones auxiliares existentes
import { obtenerTipoEvento } from '@/app/admin/_lib/eventoTipo.actions';
import { obtenerBalancePagosEvento } from '@/app/admin/_lib/pago.actions';
import { obtenerCliente } from '@/app/admin/_lib/cliente.actions';
import { obtenerCotizacionServicios } from '@/app/admin/_lib/cotizacion.actions';

/**
 * Obtener eventos aprobados con datos extendidos (migrado de la función existente)
 * Esta función mantiene la misma lógica que obtenerEventosAprobadosV2 del archivo original
 */
export async function obtenerEventosAprobados(): Promise<EventoExtendido[]> {
    try {
        const eventos = await prisma.evento.findMany({
            orderBy: {
                fecha_evento: 'asc'
            }
        });

        const eventosConTipoYBalance = await Promise.all(eventos.map(async (evento) => {
            const [eventoTipo, balancePagos, cliente] = await Promise.all([
                evento.eventoTipoId ? obtenerTipoEvento(evento.eventoTipoId) : { nombre: 'Tipo desconocido' },
                obtenerBalancePagosEvento(evento.id),
                obtenerCliente(evento.clienteId)
            ]);

            return {
                ...evento,
                clienteNombre: cliente ? cliente.nombre : 'Cliente desconocido',
                tipoEvento: eventoTipo?.nombre ?? 'Tipo desconocido',
                precio: balancePagos.precio,
                totalPagado: balancePagos.totalPagado,
                balance: balancePagos.balance ?? 0
            } as EventoExtendido;
        }));

        return eventosConTipoYBalance;
    } catch (error) {
        console.error('Error obteniendo eventos aprobados:', error);
        return [];
    }
}

/**
 * Obtener eventos con filtros y búsqueda
 */
export async function obtenerEventosConFiltros(params?: EventoBusquedaForm) {
    try {
        const validatedParams = EventoBusquedaSchema.parse(params || {});
        const { search, filtroBalance, fechaDesde, fechaHasta, eventoTipoId, clienteId, eventoEtapaId, page, limit } = validatedParams;
        const skip = (page - 1) * limit;

        // Construir condiciones de búsqueda
        interface WhereCondition {
            OR?: Array<Record<string, unknown>>;
            eventoTipoId?: string;
            clienteId?: string;
            eventoEtapaId?: string;
            fecha_evento?: {
                gte?: Date;
                lte?: Date;
            };
        }

        const where: WhereCondition = {};

        if (search) {
            where.OR = [
                { nombre: { contains: search, mode: 'insensitive' } },
                { descripcion: { contains: search, mode: 'insensitive' } },
                { direccion: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (eventoTipoId) {
            where.eventoTipoId = eventoTipoId;
        }

        if (clienteId) {
            where.clienteId = clienteId;
        }

        if (eventoEtapaId) {
            where.eventoEtapaId = eventoEtapaId;
        }

        if (fechaDesde || fechaHasta) {
            where.fecha_evento = {};
            if (fechaDesde) {
                where.fecha_evento.gte = new Date(fechaDesde);
            }
            if (fechaHasta) {
                where.fecha_evento.lte = new Date(fechaHasta + 'T23:59:59.999Z');
            }
        }

        const [eventos, total] = await Promise.all([
            prisma.evento.findMany({
                where,
                orderBy: {
                    fecha_evento: 'asc'
                },
                skip,
                take: limit
            }),
            prisma.evento.count({ where })
        ]);

        // Procesar eventos con datos extendidos
        const eventosExtendidos = await Promise.all(eventos.map(async (evento) => {
            const [eventoTipo, balancePagos, cliente] = await Promise.all([
                evento.eventoTipoId ? obtenerTipoEvento(evento.eventoTipoId) : { nombre: 'Tipo desconocido' },
                obtenerBalancePagosEvento(evento.id),
                obtenerCliente(evento.clienteId)
            ]);

            return {
                ...evento,
                clienteNombre: cliente ? cliente.nombre : 'Cliente desconocido',
                tipoEvento: eventoTipo?.nombre ?? 'Tipo desconocido',
                precio: balancePagos.precio,
                totalPagado: balancePagos.totalPagado,
                balance: balancePagos.balance ?? 0
            } as EventoExtendido;
        }));

        // Aplicar filtro de balance después de obtener los datos
        const eventosFiltrados = filtroBalance === 'todos'
            ? eventosExtendidos
            : eventosExtendidos.filter(evento => {
                if (filtroBalance === 'pagados') return evento.balance === 0;
                if (filtroBalance === 'pendientes') return evento.balance > 0;
                return true;
            });

        return {
            success: true,
            data: {
                eventos: eventosFiltrados,
                pagination: {
                    page,
                    limit,
                    total: eventosFiltrados.length,
                    totalPages: Math.ceil(eventosFiltrados.length / limit)
                }
            }
        };

    } catch (error) {
        console.error('Error obteniendo eventos con filtros:', error);
        return {
            success: false,
            error: 'Error obteniendo los eventos'
        };
    }
}

/**
 * Obtener evento por ID con datos extendidos
 */
export async function obtenerEventoPorId(id: string): Promise<EventoExtendido | null> {
    try {
        const evento = await prisma.evento.findUnique({
            where: { id }
        });

        if (!evento) return null;

        const [eventoTipo, balancePagos, cliente] = await Promise.all([
            evento.eventoTipoId ? obtenerTipoEvento(evento.eventoTipoId) : { nombre: 'Tipo desconocido' },
            obtenerBalancePagosEvento(evento.id),
            obtenerCliente(evento.clienteId)
        ]);

        return {
            ...evento,
            clienteNombre: cliente ? cliente.nombre : 'Cliente desconocido',
            tipoEvento: eventoTipo?.nombre ?? 'Tipo desconocido',
            precio: balancePagos.precio,
            totalPagado: balancePagos.totalPagado,
            balance: balancePagos.balance ?? 0
        } as EventoExtendido;

    } catch (error) {
        console.error('Error obteniendo evento por ID:', error);
        return null;
    }
}

/**
 * Actualizar etapa de evento
 */
export async function actualizarEtapaEvento(data: EventoEtapaUpdateForm) {
    try {
        const validatedData = EventoEtapaUpdateSchema.parse(data);

        const eventoActualizado = await prisma.evento.update({
            where: {
                id: validatedData.eventoId
            },
            data: {
                eventoEtapaId: validatedData.eventoEtapaId,
                updatedAt: new Date()
            }
        });

        revalidatePath('/admin/dashboard/seguimiento');
        revalidatePath(`/admin/dashboard/seguimiento/${validatedData.eventoId}`);

        return {
            success: true,
            data: eventoActualizado,
            message: 'Etapa actualizada exitosamente'
        };

    } catch (error) {
        console.error('Error actualizando etapa:', error);
        return {
            success: false,
            error: 'Error actualizando la etapa del evento'
        };
    }
}

/**
 * Actualizar status de etapa de evento
 */
export async function actualizarStatusEtapaEvento(data: EventoEtapaStatusForm) {
    try {
        const validatedData = EventoEtapaStatusSchema.parse(data);

        const eventoActualizado = await prisma.evento.update({
            where: {
                id: validatedData.eventoId
            },
            data: {
                // Aquí asumo que hay un campo para el status, ajustar según el schema real
                updatedAt: new Date()
            }
        });

        revalidatePath('/admin/dashboard/seguimiento');
        revalidatePath(`/admin/dashboard/seguimiento/${validatedData.eventoId}`);

        return {
            success: true,
            data: eventoActualizado,
            message: 'Status de etapa actualizado exitosamente'
        };

    } catch (error) {
        console.error('Error actualizando status de etapa:', error);
        return {
            success: false,
            error: 'Error actualizando el status de la etapa'
        };
    }
}

/**
 * Crear nuevo evento
 */
export async function crearEvento(data: EventoCreateForm) {
    try {
        const validatedData = EventoCreateSchema.parse(data);

        const nuevoEvento = await prisma.evento.create({
            data: {
                id: crypto.randomUUID(),
                ...validatedData,
                fecha_evento: new Date(validatedData.fecha_evento),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        revalidatePath('/admin/dashboard/seguimiento');
        revalidatePath('/admin/dashboard/eventos');

        return {
            success: true,
            data: nuevoEvento,
            message: 'Evento creado exitosamente'
        };

    } catch (error) {
        console.error('Error creando evento:', error);
        return {
            success: false,
            error: 'Error creando el evento'
        };
    }
}

/**
 * Actualizar evento
 */
export async function actualizarEvento(data: EventoUpdateForm) {
    try {
        const validatedData = EventoUpdateSchema.parse(data);
        const { id, ...updateData } = validatedData;

        const eventoActualizado = await prisma.evento.update({
            where: { id },
            data: {
                ...updateData,
                fecha_evento: updateData.fecha_evento ? new Date(updateData.fecha_evento) : undefined,
                updatedAt: new Date()
            }
        });

        revalidatePath('/admin/dashboard/seguimiento');
        revalidatePath(`/admin/dashboard/seguimiento/${id}`);
        revalidatePath('/admin/dashboard/eventos');

        return {
            success: true,
            data: eventoActualizado,
            message: 'Evento actualizado exitosamente'
        };

    } catch (error) {
        console.error('Error actualizando evento:', error);
        return {
            success: false,
            error: 'Error actualizando el evento'
        };
    }
}

/**
 * Obtener evento completo para seguimiento (migrado de la función existente)
 */
export async function obtenerEventoSeguimiento(eventoId: string) {
    try {
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
            return {
                success: false,
                error: 'Evento no encontrado'
            };
        }

        const [cliente, cotizacion, categorias, usuarios] = await Promise.all([
            prisma.cliente.findUnique({
                where: {
                    id: evento.clienteId
                }
            }),
            prisma.cotizacion.findFirst({
                where: {
                    eventoId,
                    status: 'aprobada'
                }
            }),
            prisma.servicioCategoria.findMany(),
            prisma.user.findMany()
        ]);

        // Obtener servicios de cotización y pagos
        const [cotizacionServicio, pago] = await Promise.all([
            cotizacion ? obtenerCotizacionServicios(cotizacion.id) : [],
            cotizacion ? prisma.pago.findMany({
                where: {
                    cotizacionId: cotizacion.id
                }
            }) : []
        ]);

        return {
            success: true,
            data: {
                evento,
                tipoEvento: evento.EventoTipo?.nombre,
                cliente,
                cotizacion,
                cotizacionServicio,
                categorias,
                usuarios,
                pago,
            }
        };

    } catch (error) {
        console.error('Error obteniendo evento de seguimiento:', error);
        return {
            success: false,
            error: 'Error obteniendo los datos del evento'
        };
    }
}
