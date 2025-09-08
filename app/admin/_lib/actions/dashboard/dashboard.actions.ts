'use server'

import prisma from '@/app/admin/_lib/prismaClient'
import { revalidatePath } from 'next/cache'
import {
    DashboardData,
    EventoResumen,
    BalanceFinanciero,
    ProspectoNuevo,
    EtapaDistribucion,
    CitaProxima,
    MetricasRendimiento,
    DashboardStats
} from '@/types/dashboard'
import { COTIZACION_STATUS, PAGO_STATUS, EVENTO_STATUS } from '@/app/admin/_lib/constants/status'

/**
 * Revalida el cache del dashboard
 */
export async function revalidateDashboard() {
    revalidatePath('/admin/dashboard')
}

/**
 * Obtiene todos los datos del dashboard de forma optimizada
 */
export async function getDashboardData(): Promise<DashboardData> {
    try {
        // Ejecutar todas las consultas en paralelo para mejor performance
        const [
            eventosDelMes,
            balanceFinanciero,
            prospectosNuevos,
            distribucionEtapas,
            citasProximas,
            metricasRendimiento
        ] = await Promise.all([
            getEventosDelMes(),
            getBalanceFinanciero(),
            getProspectosNuevos(),
            getDistribucionEtapas(),
            getCitasProximas(),
            getMetricasRendimiento()
        ])

        return {
            eventosDelMes,
            balanceFinanciero,
            prospectosNuevos,
            distribucionEtapas,
            citasProximas,
            metricasRendimiento,
            ultimaActualizacion: new Date()
        }
    } catch (error) {
        console.error('Error al obtener datos del dashboard:', error)
        throw new Error('Error al cargar el dashboard')
    }
}

/**
 * Obtiene la agenda del mes actual desde la tabla Agenda
 */
export async function getEventosDelMes(): Promise<EventoResumen[]> {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)

    const agendaItems = await prisma.agenda.findMany({
        where: {
            fecha: {
                gte: startOfMonth,
                lte: endOfMonth
            },
            status: {
                not: 'cancelado'
            }
        },
        select: {
            id: true,
            concepto: true,
            descripcion: true,
            fecha: true,
            hora: true,
            direccion: true,
            status: true,
            agendaTipo: true,
            Evento: {
                select: {
                    id: true,
                    nombre: true,
                    sede: true,
                    direccion: true,
                    Cliente: {
                        select: {
                            nombre: true
                        }
                    },
                    EventoEtapa: {
                        select: {
                            nombre: true,
                            codigo: true
                        }
                    }
                }
            }
        },
        orderBy: {
            fecha: 'asc'
        },
        take: 10 // Limitar para el widget
    })

    return agendaItems.map(agendaItem => ({
        id: agendaItem.Evento.id,
        nombre: agendaItem.concepto || agendaItem.Evento.nombre,
        fecha_evento: agendaItem.fecha || new Date(),
        sede: agendaItem.Evento.sede,
        direccion: agendaItem.direccion || agendaItem.Evento.direccion,
        cliente_nombre: agendaItem.Evento.Cliente.nombre,
        etapa_nombre: agendaItem.Evento.EventoEtapa?.nombre || 'Sin etapa',
        etapa_color: null // Ya no hay campo color
    }))
}

/**
 * Obtiene balance financiero del mes basado en eventos que se celebran en el mes actual
 */
export async function getBalanceFinanciero(): Promise<BalanceFinanciero> {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)

    // 1. BALANCE DEL MES: Suma de todos los pagos del mes actual
    const pagosDelMes = await prisma.pago.findMany({
        where: {
            createdAt: {
                gte: startOfMonth,
                lte: endOfMonth
            },
            status: {
                in: [PAGO_STATUS.PAID, PAGO_STATUS.COMPLETADO]
            }
        },
        select: {
            monto: true
        }
    })

    const totalPagado = pagosDelMes.reduce((sum, pago) => sum + pago.monto, 0)

    // 2. PENDIENTE POR COBRAR: Saldos diferentes a 0 donde evento se celebra este mes o en meses anteriores
    const eventosConSaldos = await prisma.evento.findMany({
        where: {
            fecha_evento: {
                lte: endOfMonth // Este mes o meses anteriores
            }
        },
        include: {
            Cliente: {
                select: {
                    nombre: true
                }
            },
            Cotizacion: {
                where: {
                    status: {
                        in: [COTIZACION_STATUS.APROBADA, COTIZACION_STATUS.AUTORIZADO]
                    }
                },
                include: {
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
                }
            }
        }
    })

    // Calcular saldos pendientes
    let totalFacturado = 0
    let totalPendiente = 0
    const pagosPendientesData: any[] = []

    eventosConSaldos.forEach(evento => {
        evento.Cotizacion.forEach(cotizacion => {
            // Total facturado = precio - descuento
            const montoFacturado = (cotizacion.precio || 0) - (cotizacion.descuento || 0)
            totalFacturado += montoFacturado

            // Calcular pagos realizados por esta cotización
            const totalPagadoCotizacion = cotizacion.Pago.reduce((sum, pago) => sum + pago.monto, 0)

            // Calcular saldo pendiente
            const saldoPendiente = montoFacturado - totalPagadoCotizacion

            // Solo si el saldo es mayor a 1 peso (evitar errores de precisión flotante)
            if (saldoPendiente > 1) {
                totalPendiente += saldoPendiente

                pagosPendientesData.push({
                    id: `${evento.id}-${cotizacion.id}`,
                    monto: Math.round(saldoPendiente * 100) / 100, // Redondear a 2 decimales
                    eventoId: evento.id,
                    evento_nombre: evento.nombre,
                    cliente_nombre: evento.Cliente.nombre,
                    fecha_evento: evento.fecha_evento
                })
            }
        })
    })

    const porcentajePagado = totalFacturado > 0 ? (totalPagado / totalFacturado) * 100 : 0

    // Formatear datos para la respuesta
    const pagosPendientes = pagosPendientesData.map(pago => ({
        id: pago.id,
        monto: pago.monto,
        concepto: 'Saldo pendiente',
        eventoId: pago.eventoId,
        evento_nombre: pago.evento_nombre,
        cliente_nombre: pago.cliente_nombre,
        fecha_evento: pago.fecha_evento,
        fecha_vencimiento: null
    }))

    return {
        totalFacturado,
        totalPagado, // Balance del mes
        totalPendiente, // Pendiente por cobrar
        porcentajePagado,
        pagosPendientes,
        pagosVencidos: [] // Por ahora sin lógica de vencidos
    }
}

/**
 * Obtiene prospectos nuevos del mes
 */
export async function getProspectosNuevos(): Promise<ProspectoNuevo[]> {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

    const prospectos = await prisma.cliente.findMany({
        where: {
            createdAt: {
                gte: startOfMonth
            },
            status: {
                in: ['prospecto', 'nuevo']
            }
        },
        include: {
            Canal: {
                select: {
                    nombre: true
                }
            },
            Evento: {
                include: {
                    EventoTipo: {
                        select: {
                            nombre: true
                        }
                    },
                    EventoEtapa: {
                        select: {
                            nombre: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 1 // Solo el evento más reciente
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 8 // Limitar para el widget
    })

    return prospectos.map(cliente => {
        const evento = cliente.Evento[0] // Evento más reciente
        return {
            id: cliente.id,
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            email: cliente.email,
            createdAt: cliente.createdAt,
            evento_nombre: evento?.nombre || null,
            evento_fecha: evento?.fecha_evento || null,
            tipo_evento: evento?.EventoTipo?.nombre || null,
            etapa_nombre: evento?.EventoEtapa?.nombre || null,
            canalId: cliente.canalId,
            canal_nombre: cliente.Canal?.nombre || null
        }
    })
}

/**
 * Obtiene distribución por etapas
 */
export async function getDistribucionEtapas(): Promise<EtapaDistribucion[]> {
    // Obtener distribución por etapas excluyendo eventos archivados
    const distribucion = await prisma.eventoEtapa.findMany({
        include: {
            _count: {
                select: {
                    Evento: {
                        where: {
                            status: {
                                notIn: [EVENTO_STATUS.ARCHIVADO, EVENTO_STATUS.ARCHIVED] // Excluir archivados (nuevo y legacy)
                            }
                        }
                    }
                }
            }
        },
        orderBy: {
            posicion: 'asc'
        }
    })

    // Filtrar solo etapas que tienen eventos (mayor a 0)
    const etapasConEventos = distribucion.filter(etapa => etapa._count.Evento > 0)

    // Calcular total de eventos solo de las etapas con eventos
    const totalEventos = etapasConEventos.reduce((sum, etapa) => sum + etapa._count.Evento, 0)

    return etapasConEventos.map(etapa => ({
        etapa_id: etapa.id,
        etapa_nombre: etapa.nombre,
        etapa_color: null, // No hay campo color en el schema
        total_eventos: etapa._count.Evento,
        porcentaje: totalEventos > 0
            ? Math.round((etapa._count.Evento / totalEventos) * 100 * 10) / 10
            : 0
    }))
}

/**
 * Obtiene citas próximas (próximos 7 días)
 */
export async function getCitasProximas(): Promise<CitaProxima[]> {
    const now = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(now.getDate() + 7)

    const citas = await prisma.cita.findMany({
        where: {
            fecha: {
                gte: now,
                lte: nextWeek
            },
            status: {
                in: ['PROGRAMADA', 'CONFIRMADA']
            }
        },
        include: {
            Evento: {
                include: {
                    Cliente: {
                        select: {
                            nombre: true
                        }
                    }
                }
            }
        },
        orderBy: [
            { fecha: 'asc' },
            { hora: 'asc' }
        ],
        take: 6 // Limitar para el widget
    })

    return citas.map(cita => ({
        id: cita.id,
        fecha: cita.fecha,
        hora: cita.hora,
        tipo: cita.tipo,
        modalidad: cita.modalidad,
        status: cita.status,
        asunto: cita.asunto,
        ubicacion: cita.ubicacion,
        urlVirtual: cita.urlVirtual,
        eventoId: cita.eventoId,
        evento_nombre: cita.Evento.nombre,
        cliente_nombre: cita.Evento.Cliente.nombre,
        requiere_confirmacion: cita.status === 'PROGRAMADA'
    }))
}

/**
 * Obtiene métricas de rendimiento
 */
export async function getMetricasRendimiento(): Promise<MetricasRendimiento> {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const startOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
    const endOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 0)

    // Conversión de cotizaciones a ventas
    const totalCotizaciones = await prisma.cotizacion.count({
        where: {
            createdAt: { gte: startOfMonth }
        }
    })

    const cotizacionesAprobadas = await prisma.cotizacion.count({
        where: {
            createdAt: { gte: startOfMonth },
            status: 'aprobada'
        }
    })

    const conversionRate = totalCotizaciones > 0
        ? (cotizacionesAprobadas / totalCotizaciones) * 100
        : 0

    // Tiempo promedio de cierre (simplificado)
    const tiempoPromedioCierre = 15 // TODO: Calcular basado en datos reales

    // Evento más popular
    const eventosPorTipo = await prisma.eventoTipo.findMany({
        include: {
            _count: {
                select: {
                    Evento: {
                        where: {
                            createdAt: { gte: startOfMonth },
                            status: 'active'
                        }
                    }
                }
            }
        },
        orderBy: {
            Evento: {
                _count: 'desc'
            }
        },
        take: 1
    })

    const eventoMasPopular = eventosPorTipo[0]
        ? {
            tipo: eventosPorTipo[0].nombre,
            cantidad: eventosPorTipo[0]._count.Evento,
            porcentaje: totalCotizaciones > 0
                ? (eventosPorTipo[0]._count.Evento / totalCotizaciones) * 100
                : 0
        }
        : { tipo: 'N/A', cantidad: 0, porcentaje: 0 }

    // Efectividad de citas
    const totalCitas = await prisma.cita.count({
        where: {
            createdAt: { gte: startOfMonth }
        }
    })

    const citasCompletadas = await prisma.cita.count({
        where: {
            createdAt: { gte: startOfMonth },
            status: 'COMPLETADA'
        }
    })

    const efectividadCitas = totalCitas > 0
        ? (citasCompletadas / totalCitas) * 100
        : 0

    // Tendencia mensual (eventos este mes vs mes anterior)
    const eventosEsteMes = await prisma.evento.count({
        where: {
            createdAt: { gte: startOfMonth },
            status: 'active'
        }
    })

    const eventosMesAnterior = await prisma.evento.count({
        where: {
            createdAt: {
                gte: startOfLastMonth,
                lte: endOfLastMonth
            },
            status: 'active'
        }
    })

    const cambioMensual = eventosMesAnterior > 0
        ? ((eventosEsteMes - eventosMesAnterior) / eventosMesAnterior) * 100
        : 0

    const direccion = cambioMensual > 5 ? 'up' : cambioMensual < -5 ? 'down' : 'stable'

    // Fuente de lead más efectiva
    const canales = await prisma.canal.findMany({
        include: {
            _count: {
                select: {
                    Cliente: {
                        where: {
                            createdAt: { gte: startOfMonth }
                        }
                    }
                }
            }
        },
        orderBy: {
            Cliente: {
                _count: 'desc'
            }
        },
        take: 1
    })

    const fuenteLeadMasEfectiva = canales[0]
        ? {
            canal: canales[0].nombre,
            conversion: canales[0]._count.Cliente
        }
        : { canal: 'N/A', conversion: 0 }

    return {
        conversionRate,
        tiempoPromedioCierre,
        eventoMasPopular,
        efectividadCitas,
        tendenciaMensual: {
            cambio: Math.round(cambioMensual * 10) / 10,
            direccion
        },
        fuenteLeadMasEfectiva
    }
}

/**
 * Obtiene estadísticas rápidas para el header
 */
export async function getDashboardStats(): Promise<DashboardStats> {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const now = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(now.getDate() + 7)

    const [
        totalEventosActivos,
        totalEventosMes,
        totalProspectosMes,
        totalCitasSemana,
        pagosVencidos
    ] = await Promise.all([
        prisma.evento.count({
            where: { status: 'active' }
        }),
        prisma.agenda.count({
            where: {
                fecha: { gte: startOfMonth },
                status: { not: 'cancelado' }
            }
        }),
        prisma.cliente.count({
            where: {
                createdAt: { gte: startOfMonth },
                status: { in: ['prospecto', 'nuevo'] }
            }
        }),
        prisma.cita.count({
            where: {
                fecha: { gte: now, lte: nextWeek },
                status: { in: ['PROGRAMADA', 'CONFIRMADA'] }
            }
        }),
        prisma.pago.count({
            where: {
                status: 'pending',
                createdAt: {
                    lte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 días atrás
                }
            }
        })
    ])

    return {
        totalEventosActivos,
        totalEventosMes,
        totalProspectosMes,
        totalCitasSemana,
        alertasPendientes: pagosVencidos
    }
}
