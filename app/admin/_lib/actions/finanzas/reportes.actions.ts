'use server';

import prisma from '@/app/admin/_lib/prismaClient';
import {
    type BalanceGeneralFilter,
    type ResumenFinanciero,
    type NominaResumen,
    BalanceGeneralFilterSchema,
    GASTO_STATUS
} from './finanzas.schemas';

// =====================================
// BALANCE GENERAL
// =====================================
export async function obtenerBalanceGeneral(
    filtros: BalanceGeneralFilter
): Promise<ResumenFinanciero> {
    try {
        console.log('🔄 Obteniendo balance general:', filtros);

        // Validar filtros
        const validatedFilters = BalanceGeneralFilterSchema.parse(filtros);
        const { fechaInicio, fechaFin, eventoId, incluirNomina, incluirGastos } = validatedFilters;

        // Construir condiciones base
        const baseConditions: any = {
            createdAt: {
                gte: fechaInicio,
                lte: fechaFin
            }
        };

        if (eventoId) {
            // Si hay eventoId específico, filtrar por evento
            baseConditions.eventoId = eventoId;
        }

        // =====================================
        // CÁLCULO DE INGRESOS (Pagos)
        // =====================================

        // Pagos confirmados
        const pagosConfirmados = await prisma.pago.findMany({
            where: {
                ...baseConditions,
                status: { in: ['paid', 'confirmed'] }
            },
            select: {
                monto: true,
                status: true
            }
        });

        // Pagos pendientes
        const pagosPendientes = await prisma.pago.findMany({
            where: {
                ...baseConditions,
                status: { in: ['pending', 'processing'] }
            },
            select: {
                monto: true,
                status: true
            }
        });

        const ingresosPagados = pagosConfirmados.reduce((sum, pago) => sum + (pago.monto || 0), 0);
        const ingresosPendientes = pagosPendientes.reduce((sum, pago) => sum + (pago.monto || 0), 0);
        const totalIngresos = ingresosPagados + ingresosPendientes;

        // =====================================
        // CÁLCULO DE EGRESOS
        // =====================================

        let totalNomina = 0;
        let totalGastos = 0;

        // Nómina (si está incluida)
        if (incluirNomina) {
            const nominaPagada = await prisma.nomina.findMany({
                where: {
                    ...baseConditions,
                    status: { in: ['pagado', 'autorizado'] }
                },
                select: {
                    monto_neto: true
                }
            });
            totalNomina = nominaPagada.reduce((sum, nomina) => sum + nomina.monto_neto, 0);
        }

        // Gastos (si están incluidos)
        if (incluirGastos) {
            const gastos = await prisma.gasto.findMany({
                where: {
                    fecha: {
                        gte: fechaInicio,
                        lte: fechaFin
                    },
                    status: GASTO_STATUS.ACTIVO,
                    ...(eventoId && { eventoId })
                },
                select: {
                    monto: true
                }
            });
            totalGastos = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
        }

        const totalEgresos = totalNomina + totalGastos;
        const balanceNeto = totalIngresos - totalEgresos;
        const porcentajeUtilidad = totalIngresos > 0 ? (balanceNeto / totalIngresos) * 100 : 0;

        // =====================================
        // COMPARACIÓN CON PERIODO ANTERIOR
        // =====================================

        const diasPeriodo = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
        const fechaInicioAnterior = new Date(fechaInicio);
        fechaInicioAnterior.setDate(fechaInicioAnterior.getDate() - diasPeriodo);
        const fechaFinAnterior = new Date(fechaInicio);

        // Ingresos periodo anterior
        const ingresosAnteriores = await prisma.pago.findMany({
            where: {
                createdAt: {
                    gte: fechaInicioAnterior,
                    lte: fechaFinAnterior
                },
                status: { in: ['paid', 'confirmed'] },
                ...(eventoId && { eventoId })
            },
            select: { monto: true }
        });

        // Egresos periodo anterior
        let egresosAnteriores = 0;

        if (incluirNomina) {
            const nominaAnterior = await prisma.nomina.findMany({
                where: {
                    createdAt: {
                        gte: fechaInicioAnterior,
                        lte: fechaFinAnterior
                    },
                    status: { in: ['pagado', 'autorizado'] },
                    ...(eventoId && { eventoId })
                },
                select: { monto_neto: true }
            });
            egresosAnteriores += nominaAnterior.reduce((sum, nomina) => sum + nomina.monto_neto, 0);
        }

        if (incluirGastos) {
            const gastosAnteriores = await prisma.gasto.findMany({
                where: {
                    fecha: {
                        gte: fechaInicioAnterior,
                        lte: fechaFinAnterior
                    },
                    status: GASTO_STATUS.ACTIVO,
                    ...(eventoId && { eventoId })
                },
                select: { monto: true }
            });
            egresosAnteriores += gastosAnteriores.reduce((sum, gasto) => sum + gasto.monto, 0);
        }

        const totalIngresosAnteriores = ingresosAnteriores.reduce((sum, pago) => sum + (pago.monto || 0), 0);
        const balanceAnterior = totalIngresosAnteriores - egresosAnteriores;

        // Calcular variaciones
        const variacionIngresos = totalIngresosAnteriores > 0
            ? ((totalIngresos - totalIngresosAnteriores) / totalIngresosAnteriores) * 100
            : 0;

        const variacionEgresos = egresosAnteriores > 0
            ? ((totalEgresos - egresosAnteriores) / egresosAnteriores) * 100
            : 0;

        const variacionBalance = balanceAnterior !== 0
            ? ((balanceNeto - balanceAnterior) / Math.abs(balanceAnterior)) * 100
            : 0;

        console.log('✅ Balance general calculado exitosamente');

        return {
            periodo: {
                fechaInicio,
                fechaFin
            },
            ingresos: {
                total: totalIngresos,
                pagosConfirmados: ingresosPagados,
                pagosPendientes: ingresosPendientes,
                cantidad: pagosConfirmados.length + pagosPendientes.length
            },
            egresos: {
                total: totalEgresos,
                nomina: totalNomina,
                gastos: totalGastos,
                cantidad: 0 // Se podría calcular si es necesario
            },
            balance: {
                neto: balanceNeto,
                porcentajeUtilidad
            },
            comparacion: {
                periodoAnterior: {
                    ingresos: totalIngresosAnteriores,
                    egresos: egresosAnteriores,
                    balance: balanceAnterior
                },
                variacion: {
                    ingresos: variacionIngresos,
                    egresos: variacionEgresos,
                    balance: variacionBalance
                }
            }
        };

    } catch (error) {
        console.error('❌ Error al obtener balance general:', error);

        // Retornar estructura vacía en caso de error
        return {
            periodo: {
                fechaInicio: filtros.fechaInicio,
                fechaFin: filtros.fechaFin
            },
            ingresos: {
                total: 0,
                pagosConfirmados: 0,
                pagosPendientes: 0,
                cantidad: 0
            },
            egresos: {
                total: 0,
                nomina: 0,
                gastos: 0,
                cantidad: 0
            },
            balance: {
                neto: 0,
                porcentajeUtilidad: 0
            }
        };
    }
}

// =====================================
// RESUMEN DE NÓMINA
// =====================================
export async function obtenerResumenNomina(
    fechaInicio?: Date,
    fechaFin?: Date
): Promise<NominaResumen> {
    try {
        console.log('🔄 Obteniendo resumen de nómina');

        // Condiciones de fecha si se proporcionan
        const fechaConditions = fechaInicio && fechaFin ? {
            createdAt: {
                gte: fechaInicio,
                lte: fechaFin
            }
        } : {};

        // Nóminas por estado
        const nominasPendientes = await prisma.nomina.findMany({
            where: {
                ...fechaConditions,
                status: 'pendiente'
            },
            select: {
                monto_neto: true,
                concepto: true,
                fecha_asignacion: true
            }
        });

        const nominasAutorizadas = await prisma.nomina.findMany({
            where: {
                ...fechaConditions,
                status: 'autorizado'
            },
            select: {
                monto_neto: true
            }
        });

        const nominasPagadas = await prisma.nomina.findMany({
            where: {
                ...fechaConditions,
                status: 'pagado'
            },
            select: {
                monto_neto: true
            }
        });

        // Próximos pagos con todos los estados para mostrar en la interfaz
        const proximosPagos = await prisma.nomina.findMany({
            where: fechaConditions,
            include: {
                User: {
                    select: {
                        username: true,
                        email: true
                    }
                },
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
                }
            },
            orderBy: {
                fecha_asignacion: 'desc'
            },
            take: 100 // Limitar a los últimos 100 pagos
        }); const totalPendiente = nominasPendientes.reduce((sum, nomina) => sum + nomina.monto_neto, 0);
        const totalAutorizado = nominasAutorizadas.reduce((sum, nomina) => sum + nomina.monto_neto, 0);
        const totalPagado = nominasPagadas.reduce((sum, nomina) => sum + nomina.monto_neto, 0);

        console.log('✅ Resumen de nómina obtenido exitosamente');

        return {
            totalPendiente,
            totalAutorizado,
            totalPagado,
            cantidadPendiente: nominasPendientes.length,
            cantidadAutorizada: nominasAutorizadas.length,
            cantidadPagada: nominasPagadas.length,
            proximosPagos: proximosPagos.map(nomina => ({
                id: nomina.id,
                usuario: nomina.User.username || nomina.User.email || 'Usuario',
                monto: nomina.monto_neto,
                concepto: nomina.concepto,
                status: nomina.status,
                fechaAsignacion: nomina.fecha_asignacion,
                fechaPago: nomina.fecha_pago || undefined,
                cliente: nomina.Evento?.Cliente?.nombre || 'Cliente no especificado',
                evento: nomina.Evento?.nombre || 'Evento no especificado',
                fechaEvento: nomina.Evento?.fecha_evento || undefined,
                eventoId: nomina.Evento?.id || nomina.eventoId || undefined
            }))
        };

    } catch (error) {
        console.error('❌ Error al obtener resumen de nómina:', error);

        return {
            totalPendiente: 0,
            totalAutorizado: 0,
            totalPagado: 0,
            cantidadPendiente: 0,
            cantidadAutorizada: 0,
            cantidadPagada: 0,
            proximosPagos: []
        };
    }
}

// =====================================
// PAGOS ENTRANTES DEL MES
// =====================================
export async function obtenerPagosEntrantes(
    año: number,
    mes: number
): Promise<Array<{
    id: string;
    concepto: string;
    monto: number;
    status: string;
    fecha: Date;
    cliente?: string;
    metodoPago?: string;
    eventoNombre?: string;
    eventoId?: string;
}>> {
    try {
        console.log('🔄 Obteniendo pagos entrantes del mes:', { año, mes });

        const fechaInicio = new Date(año, mes - 1, 1);
        const fechaFin = new Date(año, mes, 0, 23, 59, 59);

        const pagos = await prisma.pago.findMany({
            where: {
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
                        Evento: {
                            select: {
                                id: true,
                                nombre: true,
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
                createdAt: 'desc'
            }
        });

        console.log('✅ Pagos entrantes obtenidos exitosamente:', pagos.length);

        return pagos.map(pago => ({
            id: pago.id,
            concepto: pago.concepto,
            monto: pago.monto,
            status: pago.status,
            fecha: pago.createdAt,
            cliente: pago.Cliente?.nombre || pago.Cotizacion?.Evento?.Cliente?.nombre || 'Cliente no especificado',
            metodoPago: pago.metodo_pago,
            eventoNombre: pago.Cotizacion?.Evento?.nombre || 'Evento no especificado',
            eventoId: pago.Cotizacion?.Evento?.id || undefined
        }));

    } catch (error) {
        console.error('❌ Error al obtener pagos entrantes:', error);
        return [];
    }
}
