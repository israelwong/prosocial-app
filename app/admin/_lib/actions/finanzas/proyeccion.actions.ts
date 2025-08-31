'use server';

import prisma from '@/app/admin/_lib/prismaClient';
import { COTIZACION_STATUS } from '@/app/admin/_lib/constants/status';

// =====================================
// PROYECCIÓN FINANCIERA DEL MES
// =====================================

interface ProyeccionFinanciera {
    mesActual: {
        año: number;
        mes: number;
        nombre: string;
    };
    ingresosCobrados: {
        total: number;
        cantidad: number;
        pagos: Array<{
            id: string;
            monto: number;
            fecha: Date;
            concepto: string;
            cliente: string;
        }>;
    };
    pendientesPorCobrar: {
        total: number;
        cantidad: number;
        eventos: Array<{
            eventoId: string;
            eventoNombre: string;
            clienteNombre: string;
            fechaEvento: Date;
            totalCotizacion: number;
            totalPagado: number;
            pendiente: number;
        }>;
    };
    pagosProgramados: {
        total: number;
        cantidad: number;
        pagos: Array<{
            id: string;
            eventoId: string;
            eventoNombre: string;
            clienteNombre: string;
            fechaVencimiento: Date;
            monto: number;
            status: string;
        }>;
    };
    resumen: {
        ingresosPotenciales: number;
        flujoPositivo: number;
        porcentajeCobranza: number;
    };
}

export async function obtenerProyeccionFinanciera(
    año: number,
    mes: number
): Promise<ProyeccionFinanciera> {
    try {
        console.log('🔄 Obteniendo proyección financiera:', {
            año,
            mes,
            tipoAño: typeof año,
            tipoMes: typeof mes,
            añoValido: !isNaN(año),
            mesValido: !isNaN(mes)
        });

        // Validar que sean números
        if (typeof año !== 'number' || typeof mes !== 'number' || isNaN(año) || isNaN(mes)) {
            console.error('❌ Parámetros inválidos:', { año, mes });
            throw new Error('Los parámetros año y mes deben ser números válidos');
        }

        // Fechas del mes
        const fechaInicio = new Date(año, mes - 1, 1);
        const fechaFin = new Date(año, mes, 0, 23, 59, 59);

        console.log('📅 Fechas calculadas:', { fechaInicio, fechaFin });

        // =====================================
        // 1. INGRESOS COBRADOS (PAGOS PAID)
        // =====================================
        const pagosCobrados = await prisma.pago.findMany({
            where: {
                status: 'paid',
                createdAt: {
                    gte: fechaInicio,
                    lte: fechaFin
                }
            },
            include: {
                Cliente: {
                    select: {
                        nombre: true
                    }
                },
                Cotizacion: {
                    select: {
                        nombre: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const ingresosCobrados = {
            total: pagosCobrados.reduce((sum, pago) => sum + pago.monto, 0),
            cantidad: pagosCobrados.length,
            pagos: pagosCobrados.map(pago => ({
                id: pago.id,
                monto: pago.monto,
                fecha: pago.createdAt,
                concepto: pago.concepto,
                cliente: pago.Cliente?.nombre || 'Cliente no especificado'
            }))
        };

        // =====================================
        // 2. PENDIENTES POR COBRAR (EVENTOS DEL MES)
        // =====================================
        const eventosDelMes = await prisma.evento.findMany({
            where: {
                fecha_evento: {
                    gte: fechaInicio,
                    lte: fechaFin
                },
                status: 'active'
            },
            include: {
                Cliente: {
                    select: {
                        nombre: true
                    }
                },
                Cotizacion: {
                    where: {
                        status: { in: [COTIZACION_STATUS.AUTORIZADO] }
                    },
                    include: {
                        Pago: {
                            select: {
                                monto: true,
                                status: true
                            }
                        }
                    }
                }
            }
        });

        const pendientesPorCobrar = {
            total: 0,
            cantidad: 0,
            eventos: [] as Array<{
                eventoId: string;
                eventoNombre: string;
                clienteNombre: string;
                fechaEvento: Date;
                totalCotizacion: number;
                totalPagado: number;
                pendiente: number;
            }>
        };

        eventosDelMes.forEach(evento => {
            evento.Cotizacion.forEach(cotizacion => {
                const totalPagado = cotizacion.Pago
                    .filter(pago => ['paid', 'confirmed'].includes(pago.status))
                    .reduce((sum, pago) => sum + pago.monto, 0);

                const pendiente = cotizacion.precio - totalPagado;

                if (pendiente > 0) {
                    pendientesPorCobrar.eventos.push({
                        eventoId: evento.id,
                        eventoNombre: evento.nombre || 'Evento sin nombre',
                        clienteNombre: evento.Cliente.nombre,
                        fechaEvento: evento.fecha_evento,
                        totalCotizacion: cotizacion.precio,
                        totalPagado,
                        pendiente
                    });

                    pendientesPorCobrar.total += pendiente;
                    pendientesPorCobrar.cantidad += 1;
                }
            });
        });

        // =====================================
        // 3. PAGOS PROGRAMADOS (PENDIENTES)
        // =====================================
        const pagosProgramados = await prisma.pago.findMany({
            where: {
                status: { in: ['pending', 'processing'] },
                // Filtrar por eventos que ocurren en el mes
                Cotizacion: {
                    Evento: {
                        fecha_evento: {
                            gte: fechaInicio,
                            lte: fechaFin
                        }
                    }
                }
            },
            include: {
                Cliente: {
                    select: {
                        nombre: true
                    }
                },
                Cotizacion: {
                    include: {
                        Evento: {
                            select: {
                                id: true,
                                nombre: true,
                                fecha_evento: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        const pagosProgramadosData = {
            total: pagosProgramados.reduce((sum, pago) => sum + pago.monto, 0),
            cantidad: pagosProgramados.length,
            pagos: pagosProgramados.map(pago => ({
                id: pago.id,
                eventoId: pago.Cotizacion?.Evento?.id || '',
                eventoNombre: pago.Cotizacion?.Evento?.nombre || 'Evento sin nombre',
                clienteNombre: pago.Cliente?.nombre || 'Cliente no especificado',
                fechaVencimiento: pago.Cotizacion?.Evento?.fecha_evento || new Date(),
                monto: pago.monto,
                status: pago.status
            }))
        };

        // =====================================
        // 4. RESUMEN Y MÉTRICAS
        // =====================================
        const ingresosPotenciales = ingresosCobrados.total + pendientesPorCobrar.total + pagosProgramadosData.total;
        const flujoPositivo = ingresosCobrados.total + pagosProgramadosData.total;
        const porcentajeCobranza = ingresosPotenciales > 0
            ? (ingresosCobrados.total / ingresosPotenciales) * 100
            : 0;

        console.log('✅ Proyección financiera calculada exitosamente');

        return {
            mesActual: {
                año,
                mes,
                nombre: new Date(año, mes - 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
            },
            ingresosCobrados,
            pendientesPorCobrar,
            pagosProgramados: pagosProgramadosData,
            resumen: {
                ingresosPotenciales,
                flujoPositivo,
                porcentajeCobranza
            }
        };

    } catch (error) {
        console.error('❌ Error al obtener proyección financiera:', error);
        throw new Error('Error al calcular proyección financiera');
    }
}

// =====================================
// MÉTRICAS RÁPIDAS DEL MES
// =====================================
export async function obtenerMetricasDelMes(año: number, mes: number) {
    try {
        const fechaInicio = new Date(año, mes - 1, 1);
        const fechaFin = new Date(año, mes, 0, 23, 59, 59);

        // Consultas en paralelo para optimizar
        const [
            pagosPaid,
            pagosPendientes,
            eventosDelMes,
            nominaPendiente,
            nominaAutorizada,
            nominaPagada
        ] = await Promise.all([
            // Pagos confirmados del mes
            prisma.pago.aggregate({
                where: {
                    status: 'paid',
                    createdAt: { gte: fechaInicio, lte: fechaFin }
                },
                _sum: { monto: true },
                _count: true
            }),

            // Pagos pendientes
            prisma.pago.aggregate({
                where: {
                    status: { in: ['pending', 'processing'] },
                    createdAt: { gte: fechaInicio, lte: fechaFin }
                },
                _sum: { monto: true },
                _count: true
            }),

            // Eventos del mes
            prisma.evento.count({
                where: {
                    fecha_evento: { gte: fechaInicio, lte: fechaFin },
                    status: 'active'
                }
            }),

            // Nómina pendiente
            prisma.nomina.aggregate({
                where: {
                    status: 'pendiente',
                    createdAt: { gte: fechaInicio, lte: fechaFin }
                },
                _sum: { monto_neto: true },
                _count: true
            }),

            // Nómina autorizada
            prisma.nomina.aggregate({
                where: {
                    status: 'autorizado',
                    createdAt: { gte: fechaInicio, lte: fechaFin }
                },
                _sum: { monto_neto: true },
                _count: true
            }),

            // Nómina pagada
            prisma.nomina.aggregate({
                where: {
                    status: 'pagado',
                    createdAt: { gte: fechaInicio, lte: fechaFin }
                },
                _sum: { monto_neto: true },
                _count: true
            })
        ]);

        // Calcular totales de nómina
        const totalNominaPendiente = nominaPendiente._sum.monto_neto || 0;
        const totalNominaAutorizada = nominaAutorizada._sum.monto_neto || 0;
        const totalNominaPagada = nominaPagada._sum.monto_neto || 0;
        const totalNomina = totalNominaPendiente + totalNominaAutorizada + totalNominaPagada;
        const cantidadTotalNomina = nominaPendiente._count + nominaAutorizada._count + nominaPagada._count;

        return {
            ingresosCobrados: pagosPaid._sum.monto || 0,
            cantidadPagosCobrados: pagosPaid._count,
            ingresosPendientes: pagosPendientes._sum.monto || 0,
            cantidadPagosPendientes: pagosPendientes._count,
            eventosDelMes,
            // Datos detallados de nómina
            nominaPendiente: totalNominaPendiente,
            cantidadNominaPendiente: nominaPendiente._count,
            nominaAutorizada: totalNominaAutorizada,
            cantidadNominaAutorizada: nominaAutorizada._count,
            nominaPagada: totalNominaPagada,
            cantidadNominaPagada: nominaPagada._count,
            // Totales de nómina
            nominaTotal: totalNomina,
            cantidadNominaTotal: cantidadTotalNomina
        };

    } catch (error) {
        console.error('❌ Error al obtener métricas del mes:', error);
        return {
            ingresosCobrados: 0,
            cantidadPagosCobrados: 0,
            ingresosPendientes: 0,
            cantidadPagosPendientes: 0,
            eventosDelMes: 0,
            nominaPendiente: 0,
            cantidadNominaPendiente: 0,
            nominaAutorizada: 0,
            cantidadNominaAutorizada: 0,
            nominaPagada: 0,
            cantidadNominaPagada: 0,
            nominaTotal: 0,
            cantidadNominaTotal: 0
        };
    }
}

// =====================================
// HISTORIAL DE COBRANZA POR MES
// =====================================
export async function obtenerHistorialCobranza(mesesAtras: number = 6) {
    try {
        const historial = [];
        const fechaActual = new Date();

        for (let i = 0; i < mesesAtras; i++) {
            const fecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - i, 1);
            const año = fecha.getFullYear();
            const mes = fecha.getMonth() + 1;

            const metricas = await obtenerMetricasDelMes(año, mes);

            historial.push({
                año,
                mes,
                nombre: fecha.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }),
                ingresosCobrados: metricas.ingresosCobrados,
                ingresosPendientes: metricas.ingresosPendientes,
                eventos: metricas.eventosDelMes
            });
        }

        return historial.reverse(); // Ordenar cronológicamente

    } catch (error) {
        console.error('❌ Error al obtener historial de cobranza:', error);
        return [];
    }
}
