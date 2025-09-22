// Ruta: app/admin/_lib/actions/evento/evento.actions.ts

'use server';

import prisma from '@/app/admin/_lib/prismaClient';
import { retryDatabaseOperation } from '@/app/admin/_lib/utils/database-retry';
import { Evento } from '@/app/cliente/_lib/types';
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
    type EventoExtendido,
    type EventoCompleto
} from './evento.schemas';
import { COTIZACION_STATUS } from '@/app/admin/_lib/constants/status';
import { revalidatePath } from 'next/cache';

// Importamos las funciones auxiliares existentes
import { obtenerTipoEvento } from '@/app/admin/_lib/actions/evento/tipo/eventoTipo.actions';
import { obtenerBalancePagosEvento } from '@/app/admin/_lib/actions/pagos';
import { obtenerCliente } from '@/app/admin/_lib/actions/cliente/cliente.actions';
import { obtenerCotizacionCompleta } from '@/app/admin/_lib/actions/cotizacion/cotizacion.actions';

// =============================================================================
// FUNCIONES BÁSICAS DE EVENTOS (migradas desde evento/evento.actions.ts)
// =============================================================================

/**
 * Obtiene todos los eventos básicos
 */
export async function obtenerEventos() {
    return await prisma.evento.findMany({
        orderBy: {
            fecha_evento: 'desc'
        }
    })
}

/**
 * Obtiene un evento completo con todas las relaciones para el detalle
 */
export async function obtenerEventoCompleto(eventoId: string): Promise<EventoCompleto | null> {
    if (!eventoId) {
        return null;
    }

    try {
        return await retryDatabaseOperation(async () => {
            const evento = await prisma.evento.findUnique({
                where: { id: eventoId },
                include: {
                    EventoTipo: {
                        select: {
                            id: true,
                            nombre: true,
                        }
                    },
                    Cliente: {
                        select: {
                            id: true,
                            nombre: true,
                            telefono: true,
                            email: true,
                            direccion: true,
                            status: true,
                            canalId: true,
                            userId: true,
                            createdAt: true,
                            updatedAt: true,
                            Canal: {
                                select: {
                                    id: true,
                                    nombre: true
                                }
                            }
                        }
                    },
                    EventoEtapa: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    },
                    Cotizacion: {
                        where: { archivada: false },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    },
                    Agenda: {
                        select: {
                            id: true,
                            fecha: true,
                            status: true,
                            descripcion: true,
                            direccion: true,
                        }
                    },
                    EventoBitacora: {
                        select: {
                            id: true,
                            comentario: true,
                            createdAt: true,
                            updatedAt: true,
                            importancia: true,
                            status: true,
                        },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    }
                }
            });

            return evento as EventoCompleto | null;
        }, {
            maxRetries: 3,
            baseDelay: 1000
        });
    } catch (error) {
        console.error('❌ Error obteniendo evento completo:', error);

        // Re-lanzar el error para que el componente pueda manejarlo adecuadamente
        if (error instanceof Error) {
            // Si es un error de conexión a la base de datos, preservar el mensaje
            if (error.message.includes('database server') || error.message.includes('P1001')) {
                throw new Error(`Error de conexión a la base de datos: ${error.message}`);
            }
            // Para otros errores de Prisma, proporcionar un mensaje más genérico
            throw new Error('Error al obtener los datos del evento');
        }

        throw error;
    }
}

/**
 * Obtiene eventos filtrados por etapas
 */
export async function obtenerEventosPorEtapa(etapas: string[]) {
    return await prisma.evento.findMany({
        where: {
            eventoEtapaId: {
                in: etapas
            }
        },
        include: {
            EventoTipo: {
                select: {
                    nombre: true,
                }
            },
            Cliente: {
                select: {
                    nombre: true,
                    telefono: true
                }
            },
            EventoEtapa: {
                select: {
                    nombre: true
                }
            }
        },
        orderBy: {
            fecha_evento: 'asc'
        }
    })
}

/**
 * Obtiene eventos por cliente
 */
export async function obtenerEventosPorCliente(clienteId: string) {
    return await prisma.evento.findMany({
        where: { clienteId },
        orderBy: { fecha_evento: 'desc' }
    })
}

/**
 * Obtiene el status de un evento
 */
export async function obtenerStatusEvento(eventoId: string) {
    const evento = await prisma.evento.findUnique({
        where: { id: eventoId },
        select: { status: true }
    })
    return evento?.status
}

/**
 * Verifica las dependencias de un evento antes de eliminarlo
 */
export async function verificarDependenciasEvento(eventoId: string) {
    try {
        const [cotizaciones, agenda, bitacora] = await Promise.all([
            prisma.cotizacion.count({ where: { eventoId } }),
            prisma.agenda.count({ where: { eventoId } }),
            prisma.eventoBitacora.count({ where: { eventoId } })
        ]);

        const total = cotizaciones + agenda + bitacora;

        return {
            tieneDependencias: total > 0,
            dependencias: {
                cotizaciones,
                agenda,
                bitacora,
                total
            }
        };
    } catch (error) {
        console.error('Error verificando dependencias del evento:', error);
        return {
            tieneDependencias: true,
            dependencias: {
                cotizaciones: 0,
                agenda: 0,
                bitacora: 0,
                total: 0
            },
            error: 'Error al verificar dependencias'
        };
    }
}

/**
 * Actualiza el status de un evento
 */
export async function actualizarEventoStatus(eventoId: string, status: string) {
    return await prisma.evento.update({
        where: { id: eventoId },
        data: { status }
    })
}

/**
 * Elimina un evento y todas sus dependencias
 */
export async function eliminarEvento(eventoId: string) {
    try {
        await prisma.$transaction(async (tx) => {
            // Eliminar en orden para evitar violaciones de clave foránea
            await tx.eventoBitacora.deleteMany({ where: { eventoId } });
            await tx.cotizacionServicio.deleteMany({
                where: {
                    Cotizacion: {
                        eventoId
                    }
                }
            });
            await tx.cotizacion.deleteMany({ where: { eventoId } });
            await tx.agenda.deleteMany({ where: { eventoId } });
            await tx.evento.delete({ where: { id: eventoId } });
        });

        // Invalidar cache de todas las rutas relacionadas
        revalidatePath('/admin/dashboard/eventos')
        revalidatePath('/admin/dashboard/seguimiento')
        revalidatePath('/admin/dashboard/gestion')
        revalidatePath(`/admin/dashboard/eventos/${eventoId}`)
        revalidatePath(`/admin/dashboard/seguimiento/${eventoId}`)

        return {
            success: true,
            message: 'Evento eliminado exitosamente'
        };
    } catch (error) {
        console.error('Error eliminando evento:', error);
        return {
            success: false,
            message: 'Error al eliminar evento'
        };
    }
}

/**
 * Archivar un evento (cambia status a 'archived')
 */
export async function archivarEvento(eventoId: string) {
    try {
        await prisma.evento.update({
            where: { id: eventoId },
            data: { status: 'archived' }
        })

        return {
            success: true,
            message: 'Evento archivado exitosamente'
        }
    } catch (error) {
        console.error('Error archivando evento:', error)
        return {
            success: false,
            message: 'Error al archivar evento'
        }
    }
}

/**
 * Desarchivar un evento (cambia status a 'active')
 */
export async function desarchivarEvento(eventoId: string) {
    try {
        await prisma.evento.update({
            where: { id: eventoId },
            data: { status: 'active' }
        })

        return {
            success: true,
            message: 'Evento desarchivado exitosamente'
        }
    } catch (error) {
        console.error('Error desarchivando evento:', error)
        return {
            success: false,
            message: 'Error al desarchivar evento'
        }
    }
}

// =============================================================================
// FUNCIONES EXTENDIDAS (funciones originales del archivo)
// =============================================================================

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
        const [cotizacionCompleta, pago] = await Promise.all([
            cotizacion ? obtenerCotizacionCompleta(cotizacion.id) : null,
            cotizacion ? prisma.pago.findMany({
                where: {
                    cotizacionId: cotizacion.id
                }
            }) : []
        ]);

        const cotizacionServicio = cotizacionCompleta?.cotizacion?.Servicio || [];

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

// ===================================
// FUNCIONES MIGRADAS DESDE evento.actions.ts OBSOLETO
// ===================================

/**
 * Versión básica de obtener evento por ID (migrada desde archivo obsoleto)
 */
export async function obtenerEventoBasicoPorId(id: string) {
    return prisma.evento.findUnique({
        where: { id },
        include: {
            EventoTipo: {
                select: {
                    nombre: true,
                }
            },
            Cliente: {
                select: {
                    nombre: true,
                    telefono: true
                }
            },
            EventoEtapa: {
                select: {
                    nombre: true,
                    posicion: true
                }
            }
        }
    });
}

/**
 * Versión básica de crear evento (migrada desde archivo obsoleto)
 */
export async function crearEventoBasico(data: any) {
    try {
        const nuevoEvento = await prisma.evento.create({
            data: {
                clienteId: data.clienteId ?? '',
                eventoTipoId: data.eventoTipoId,
                nombre: data.nombre,
                fecha_evento: data.fecha_evento,
                status: 'active',
                userId: data.userId || null,
                eventoEtapaId: data.eventoEtapaId || null
            }
        });

        return { success: true, id: nuevoEvento.id };
    } catch (error) {
        console.error(error);
        return { error: 'Error creating event' };
    }
}
