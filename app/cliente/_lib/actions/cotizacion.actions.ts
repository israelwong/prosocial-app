/**
 * Server Actions para cotizaciones del cliente
 */

'use server'

import { cookies } from 'next/headers'
import prisma from '@/app/admin/_lib/prismaClient'
import { ApiResponse } from '../types'

/**
 * Obtiene las cotizaciones del cliente autenticado
 */
export async function obtenerCotizacionesCliente(): Promise<ApiResponse> {
    try {
        const cookieStore = await cookies()
        const clienteId = cookieStore.get('clienteId')?.value

        if (!clienteId) {
            return {
                success: false,
                message: 'Cliente no autenticado'
            }
        }

        const cotizaciones = await prisma.cotizacion.findMany({
            where: {
                Evento: {
                    clienteId: clienteId
                },
                archivada: false,
                visible_cliente: true
            },
            include: {
                Evento: {
                    select: {
                        nombre: true,
                        fecha_evento: true,
                        direccion: true,
                        sede: true
                    }
                },
                EventoTipo: {
                    select: {
                        nombre: true
                    }
                },
                Servicio: {
                    include: {
                        Servicio: {
                            select: {
                                nombre: true,
                                precio_publico: true
                            }
                        }
                    }
                },
                Costos: true,
                _count: {
                    select: {
                        Pago: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return {
            success: true,
            data: cotizaciones
        }
    } catch (error) {
        console.error('Error al obtener cotizaciones:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error desconocido'
        }
    }
}

/**
 * Obtiene el detalle de una cotización específica
 */
export async function obtenerCotizacionDetalle(cotizacionId: string): Promise<ApiResponse> {
    try {
        const cookieStore = await cookies()
        const clienteId = cookieStore.get('clienteId')?.value

        if (!clienteId) {
            return {
                success: false,
                message: 'Cliente no autenticado'
            }
        }

        const cotizacion = await prisma.cotizacion.findFirst({
            where: {
                id: cotizacionId,
                Evento: {
                    clienteId: clienteId
                },
                archivada: false,
                visible_cliente: true
            },
            include: {
                Evento: {
                    include: {
                        Cliente: {
                            select: {
                                nombre: true,
                                telefono: true,
                                email: true
                            }
                        },
                        EventoTipo: true,
                        EventoEtapa: true
                    }
                },
                EventoTipo: true,
                CondicionesComerciales: {
                    include: {
                        CondicionesComercialesMetodoPago: {
                            include: {
                                MetodoPago: true
                            }
                        }
                    }
                },
                CondicionesComercialesMetodoPago: {
                    include: {
                        MetodoPago: true
                    }
                },
                Servicio: {
                    include: {
                        Servicio: {
                            include: {
                                ServicioCategoria: true
                            }
                        }
                    },
                    orderBy: {
                        Servicio: {
                            ServicioCategoria: {
                                posicion: 'asc'
                            }
                        }
                    }
                },
                Costos: true,
                Pago: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                CotizacionVisita: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        })

        if (!cotizacion) {
            return {
                success: false,
                message: 'Cotización no encontrada'
            }
        }

        return {
            success: true,
            data: cotizacion
        }
    } catch (error) {
        console.error('Error al obtener detalle de cotización:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error desconocido'
        }
    }
}
