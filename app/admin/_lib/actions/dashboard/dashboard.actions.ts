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
 * Obtiene eventos del mes actual con paginación y optimización
 */
export async function getEventosDelMes(): Promise<EventoResumen[]> {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)

    const eventos = await prisma.evento.findMany({
        where: {
            fecha_evento: {
                gte: startOfMonth,
                lte: endOfMonth
            },
            status: 'active'
        },
        select: {
            id: true,
            nombre: true,
            fecha_evento: true,
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
        },
        orderBy: {
            fecha_evento: 'asc'
        },
        take: 10 // Limitar para el widget
    })

    return eventos.map(evento => ({
        id: evento.id,
        nombre: evento.nombre,
        fecha_evento: evento.fecha_evento,
        sede: evento.sede,
        direccion: evento.direccion,
        cliente_nombre: evento.Cliente.nombre,
        etapa_nombre: evento.EventoEtapa?.nombre || 'Sin etapa',
        etapa_color: null // Ya no hay campo color
    }))
}

/**
 * Obtiene balance financiero del mes
 */
export async function getBalanceFinanciero(): Promise<BalanceFinanciero> {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

    // Total facturado (cotizaciones aprobadas)
    const totalFacturadoResult = await prisma.cotizacion.aggregate({
        where: {
            status: 'aprobada',
            createdAt: {
                gte: startOfMonth
            }
        },
        _sum: {
            precio: true
        }
    })

    // Total pagado
    const totalPagadoResult = await prisma.pago.aggregate({
        where: {
            status: 'paid',
            createdAt: {
                gte: startOfMonth
            },
            tipo_transaccion: 'ingreso'
        },
        _sum: {
            monto: true
        }
    })

    // Pagos pendientes del mes
    const pagosPendientesData = await prisma.pago.findMany({
        where: {
            status: {
                in: ['pending', 'processing']
            },
            createdAt: {
                gte: startOfMonth
            },
            tipo_transaccion: 'ingreso'
        },
        include: {
            Cotizacion: {
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
                }
            }
        },
        orderBy: {
            createdAt: 'asc'
        }
    })

    const totalFacturado = totalFacturadoResult._sum.precio || 0
    const totalPagado = totalPagadoResult._sum.monto || 0
    const totalPendiente = pagosPendientesData.reduce((sum, pago) => sum + pago.monto, 0)

    const porcentajePagado = totalFacturado > 0 ? (totalPagado / totalFacturado) * 100 : 0

    // Para simplificar, consideramos pagos vencidos los que tienen más de 30 días de creados y están pendientes
    const now = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(now.getDate() - 30)

    const pagosPendientes = pagosPendientesData
        .filter(pago => pago.createdAt > thirtyDaysAgo)
        .map(pago => ({
            id: pago.id,
            monto: pago.monto,
            concepto: pago.concepto,
            eventoId: pago.Cotizacion?.Evento?.id || '',
            evento_nombre: pago.Cotizacion?.Evento?.nombre || 'Sin evento',
            cliente_nombre: pago.Cotizacion?.Evento?.Cliente?.nombre || 'Sin cliente',
            fecha_vencimiento: null
        }))

    const pagosVencidos = pagosPendientesData
        .filter(pago => pago.createdAt <= thirtyDaysAgo)
        .map(pago => ({
            id: pago.id,
            monto: pago.monto,
            concepto: pago.concepto,
            eventoId: pago.Cotizacion?.Evento?.id || '',
            evento_nombre: pago.Cotizacion?.Evento?.nombre || 'Sin evento',
            cliente_nombre: pago.Cotizacion?.Evento?.Cliente?.nombre || 'Sin cliente',
            fecha_vencimiento: null,
            diasVencido: Math.floor((now.getTime() - pago.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        }))

    return {
        totalFacturado,
        totalPagado,
        totalPendiente,
        porcentajePagado,
        pagosPendientes,
        pagosVencidos
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
    // Obtener total de eventos activos
    const totalEventos = await prisma.evento.count({
        where: {
            status: 'active'
        }
    })

    // Obtener distribución por etapas
    const distribucion = await prisma.eventoEtapa.findMany({
        include: {
            _count: {
                select: {
                    Evento: {
                        where: {
                            status: 'active'
                        }
                    }
                }
            }
        },
        orderBy: {
            posicion: 'asc'
        }
    })

    return distribucion.map(etapa => ({
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
        prisma.evento.count({
            where: {
                fecha_evento: { gte: startOfMonth },
                status: 'active'
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
