'use server'

/**
 * Server Actions para manejo de eventos del cliente
 */

import prisma from '@/app/admin/_lib/prismaClient'
import { PAGO_STATUS } from '@/app/admin/_lib/constants/status'
import { ApiResponse, Evento, EventoDetalle } from '../types'

export async function obtenerEventosCliente(clienteId: string): Promise<ApiResponse<{ eventos: Evento[] }>> {
    try {
        // Buscar eventos del cliente con cotizaciones aprobadas
        const eventos = await prisma.evento.findMany({
            where: {
                clienteId: clienteId,
                Cotizacion: {
                    some: {
                        status: {
                            in: ['aprobada', 'enviada']
                        }
                    }
                }
            },
            include: {
                EventoTipo: {
                    select: {
                        id: true,
                        nombre: true
                    }
                },
                EventoEtapa: {
                    select: {
                        id: true,
                        nombre: true
                    }
                },
                Cotizacion: {
                    where: {
                        status: {
                            in: ['aprobada', 'enviada']
                        }
                    },
                    select: {
                        id: true,
                        status: true,
                        precio: true,
                        Pago: {
                            where: {
                                status: {
                                    in: [
                                        PAGO_STATUS.PAID, 
                                        PAGO_STATUS.COMPLETADO,
                                        PAGO_STATUS.PENDING,
                                        'pending_payment',
                                        'processing'
                                    ]
                                }
                            },
                            select: {
                                monto: true,
                                status: true,
                                metodo_pago: true,
                                createdAt: true,
                                updatedAt: true
                            },
                            orderBy: {
                                updatedAt: 'desc'
                            }
                        }
                    },
                    take: 1
                }
            },
            orderBy: {
                fecha_evento: 'asc'
            }
        })

        // Transformar datos para el formato esperado
        const eventosFormateados = eventos.map(evento => {
            const cotizacion = evento.Cotizacion[0]
            
            // Calcular totales y estado de pagos
            const pagos = cotizacion?.Pago || []
            const pagosPagados = pagos.filter(pago => ['paid', 'completado'].includes(pago.status))
            const pagosPendientes = pagos.filter(pago => ['pending', 'pending_payment', 'processing'].includes(pago.status))
            const totalPagado = pagosPagados.reduce((sum: number, pago: any) => sum + pago.monto, 0)
            
            // Detectar si hay pagos SPEI pendientes
            const pagoSpeiPendiente = pagosPendientes.find(pago => 
                pago.metodo_pago && (
                    pago.metodo_pago.toLowerCase().includes('spei') ||
                    pago.metodo_pago === 'customer_balance'
                )
            )

            return {
                id: evento.id,
                nombre: evento.nombre || 'Evento sin nombre',
                fecha_evento: evento.fecha_evento.toISOString(),
                hora_evento: '', // Campo legacy
                numero_invitados: 0, // Campo legacy
                lugar: evento.sede || evento.direccion || 'No definida',
                eventoTipo: evento.EventoTipo ? {
                    id: evento.EventoTipo.id,
                    nombre: evento.EventoTipo.nombre
                } : undefined,
                eventoEtapa: evento.EventoEtapa ? {
                    id: evento.EventoEtapa.id,
                    nombre: evento.EventoEtapa.nombre
                } : undefined,
                cotizacion: {
                    id: cotizacion?.id || '',
                    status: cotizacion?.status || '',
                    total: cotizacion?.precio || 0,
                    pagado: totalPagado,
                    // 🆕 Información de pagos SPEI pendientes
                    pagoSpeiPendiente: pagoSpeiPendiente ? {
                        status: pagoSpeiPendiente.status,
                        monto: pagoSpeiPendiente.monto,
                        fechaCreacion: pagoSpeiPendiente.createdAt,
                        fechaActualizacion: pagoSpeiPendiente.updatedAt
                    } : null
                }
            }
        })

        return {
            success: true,
            data: { eventos: eventosFormateados }
        }
    } catch (error) {
        console.error('Error al obtener eventos del cliente:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error desconocido'
        }
    }
}

export async function obtenerEventoDetalle(eventoId: string): Promise<ApiResponse<EventoDetalle>> {
    try {
        // Copiar exactamente la query que funciona en el API route
        const evento = await prisma.evento.findUnique({
            where: {
                id: eventoId
            },
            include: {
                EventoTipo: {
                    select: {
                        id: true,
                        nombre: true
                    }
                },
                EventoEtapa: {
                    select: {
                        id: true,
                        nombre: true
                    }
                },
                Cotizacion: {
                    where: {
                        status: {
                            in: ['aprobada', 'enviada']
                        }
                    },
                    include: {
                        Servicio: {
                            include: {
                                Servicio: {
                                    include: {
                                        ServicioCategoria: {
                                            include: {
                                                seccionCategoria: {
                                                    include: {
                                                        Seccion: true
                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                                ServicioCategoria: {
                                    include: {
                                        seccionCategoria: {
                                            include: {
                                                Seccion: true
                                            }
                                        }
                                    }
                                }
                            },
                            orderBy: [
                                { Servicio: { posicion: 'asc' } },
                                { posicion: 'asc' }
                            ]
                        },
                        Pago: {
                            where: {
                                status: {
                                    in: [PAGO_STATUS.PAID, PAGO_STATUS.COMPLETADO]
                                }
                            },
                            select: {
                                monto: true
                            }
                        }
                    },
                    take: 1
                }
            }
        })

        if (!evento || !evento.Cotizacion[0]) {
            return {
                success: false,
                message: 'Evento no encontrado'
            }
        }

        const cotizacion = evento.Cotizacion[0]
        const totalPagado = cotizacion.Pago?.reduce((sum: number, pago: any) => sum + pago.monto, 0) || 0

        // Debug para verificar los pagos encontrados
        console.log('🔍 obtenerEventoDetalle - Pagos encontrados:', {
            eventoId,
            pagosCount: cotizacion.Pago?.length || 0,
            pagos: cotizacion.Pago?.map((p: any) => ({ monto: p.monto })) || [],
            totalPagado
        })

        // Copiar exactamente la lógica de servicios del API route
        const servicios = cotizacion.Servicio.map((cotizacionServicio: any) => {
            const nombreServicio = cotizacionServicio.nombre_snapshot && cotizacionServicio.nombre_snapshot !== 'Servicio migrado'
                ? cotizacionServicio.nombre_snapshot
                : cotizacionServicio.Servicio?.nombre || 'Servicio sin nombre'

            const seccionNombre = cotizacionServicio.seccion_snapshot && cotizacionServicio.seccion_snapshot !== 'Sección migrada'
                ? cotizacionServicio.seccion_snapshot
                : cotizacionServicio.Servicio?.ServicioCategoria?.seccionCategoria?.Seccion?.nombre ||
                cotizacionServicio.ServicioCategoria?.seccionCategoria?.Seccion?.nombre ||
                'Sin sección'

            const categoriaNombre = cotizacionServicio.categoria_snapshot && cotizacionServicio.categoria_snapshot !== 'Categoría migrada'
                ? cotizacionServicio.categoria_snapshot
                : cotizacionServicio.Servicio?.ServicioCategoria?.nombre ||
                cotizacionServicio.ServicioCategoria?.nombre ||
                'Sin categoría'

            return {
                id: cotizacionServicio.id,
                nombre: nombreServicio,
                cantidad: cotizacionServicio.cantidad,
                precio_unitario: cotizacionServicio.precioUnitario || 0,
                subtotal: cotizacionServicio.subtotal || 0,
                seccion: seccionNombre,
                categoria: categoriaNombre,
                seccionPosicion: cotizacionServicio.Servicio?.ServicioCategoria?.seccionCategoria?.Seccion?.posicion ||
                    cotizacionServicio.ServicioCategoria?.seccionCategoria?.Seccion?.posicion || 0,
                categoriaPosicion: cotizacionServicio.Servicio?.ServicioCategoria?.posicion ||
                    cotizacionServicio.ServicioCategoria?.posicion || 0,
                posicion: cotizacionServicio.Servicio?.posicion || cotizacionServicio.posicion || 0
            }
        })

        // Construir exactamente igual que en el API route
        const eventoDetalle: EventoDetalle = {
            id: evento.id,
            nombre: evento.nombre || 'Evento sin nombre',
            fecha_evento: evento.fecha_evento.toISOString(),
            hora_evento: '', // Campo legacy
            numero_invitados: 0, // Campo legacy
            lugar: evento.sede || evento.direccion || 'No especificado',
            direccion: evento.direccion || undefined,
            sede: evento.sede || undefined,
            eventoTipo: evento.EventoTipo || undefined,
            eventoEtapa: evento.EventoEtapa || undefined,
            cotizacion: {
                id: cotizacion.id,
                status: cotizacion.status,
                total: cotizacion.precio,
                pagado: totalPagado,
                descripcion: cotizacion.descripcion || undefined,
                servicios
            }
        }

        return {
            success: true,
            data: eventoDetalle
        }
    } catch (error) {
        console.error('Error en obtenerEventoDetalle:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error desconocido'
        }
    }
}

export async function editarEvento(
    eventoId: string,
    datos: { nombre: string; direccion: string; sede: string }
): Promise<ApiResponse<{ mensaje: string }>> {
    try {
        // Validaciones básicas
        if (!datos.nombre?.trim()) {
            return {
                success: false,
                message: 'El nombre del evento es requerido'
            }
        }

        // Verificar que el evento existe
        const eventoExiste = await prisma.evento.findUnique({
            where: { id: eventoId }
        })

        if (!eventoExiste) {
            return {
                success: false,
                message: 'Evento no encontrado'
            }
        }

        // Actualizar el evento
        await prisma.evento.update({
            where: { id: eventoId },
            data: {
                nombre: datos.nombre.trim(),
                direccion: datos.direccion?.trim() || null,
                sede: datos.sede?.trim() || null,
                updatedAt: new Date()
            }
        })

        return {
            success: true,
            data: { mensaje: 'Evento actualizado correctamente' }
        }
    } catch (error) {
        console.error('Error en editarEvento:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error desconocido'
        }
    }
}
