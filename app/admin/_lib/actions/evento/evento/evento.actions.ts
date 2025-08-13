'use server'

import prisma from '../../../prismaClient'
import { CrearEventoSchema, ActualizarEventoSchema, EventoCompletoSchema } from './evento.schemas'
import type { CrearEvento, ActualizarEvento, EventoCompleto } from './evento.schemas'

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
 * Obtiene un evento por ID con información básica
 */
export async function obtenerEventoPorId(id: string) {
    return await prisma.evento.findUnique({
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
                    nombre: true
                }
            }
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

    const evento = await prisma.evento.findUnique({
        where: { id: eventoId },
        include: {
            EventoTipo: {
                select: {
                    nombre: true
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
                    createdAt: true,
                    Canal: {
                        select: {
                            nombre: true
                        }
                    }
                }
            },
            EventoEtapa: {
                select: {
                    nombre: true,
                    posicion: true
                }
            },
            User: {
                select: {
                    username: true
                }
            },
            Cotizacion: {
                orderBy: {
                    createdAt: 'desc'
                },
                select: {
                    id: true,
                    status: true,
                    precio: true,
                    Pago: {
                        select: {
                            id: true,
                            monto: true,
                            createdAt: true
                        }
                    }
                }
            },
            EventoBitacora: {
                orderBy: {
                    createdAt: 'asc'
                },
                select: {
                    id: true,
                    comentario: true,
                    createdAt: true,
                    updatedAt: true
                }
            }
        }
    })

    if (!evento) return null

    // Validar y transformar los datos
    return EventoCompletoSchema.parse(evento)
}

/**
 * Obtiene eventos por etapas específicas
 */
export async function obtenerEventosPorEtapa(etapas: number[]) {
    const eventos = await prisma.evento.findMany({
        where: {
            EventoEtapa: {
                posicion: {
                    in: etapas
                }
            },
            // Para etapa 2 (seguimiento), solo mostrar eventos pendientes (no archivados)
            status: etapas.includes(2) ? 'active' : undefined
        },
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
            },
            EventoEtapa: {
                select: {
                    nombre: true,
                    posicion: true
                }
            },
            Cotizacion: {
                where: {
                    status: 'aprobada',
                },
                select: {
                    id: true,
                    precio: true,
                    status: true,
                    Pago: {
                        select: {
                            id: true,
                            monto: true,
                            createdAt: true
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
            fecha_evento: 'asc'
        }
    })

    // Calcular total pagado
    const eventosConTotalPagado = eventos.map(evento => {
        const totalPagado = evento.Cotizacion.reduce((acc, cotizacion) => {
            const totalPagos = cotizacion.Pago.reduce((sum, pago) => sum + pago.monto, 0)
            return acc + totalPagos
        }, 0)

        return {
            ...evento,
            total_pagado: totalPagado
        }
    })

    return eventosConTotalPagado
}

/**
 * Obtiene eventos por cliente
 */
export async function obtenerEventosPorCliente(clienteId: string) {
    return await prisma.evento.findMany({
        where: {
            clienteId
        },
        orderBy: {
            fecha_evento: 'desc'
        }
    })
}

/**
 * Crea un nuevo evento
 */
export async function crearEvento(data: CrearEvento) {
    const validatedData = CrearEventoSchema.parse(data)

    return await prisma.evento.create({
        data: validatedData
    })
}

/**
 * Actualiza un evento
 */
export async function actualizarEvento(data: ActualizarEvento) {
    const validatedData = ActualizarEventoSchema.parse(data)
    const { id, ...updateData } = validatedData

    return await prisma.evento.update({
        where: { id },
        data: updateData
    })
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
 * Obtiene el status de un evento
 */
export async function obtenerStatusEvento(eventoId: string) {
    const evento = await prisma.evento.findUnique({
        where: { id: eventoId },
        select: { status: true }
    })

    return evento?.status
}
