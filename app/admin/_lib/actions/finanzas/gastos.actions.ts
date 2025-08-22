'use server';

import prisma from '@/app/admin/_lib/prismaClient';
import { revalidatePath } from 'next/cache';
import {
    GastoCreateSchema,
    GastoUpdateSchema,
    GastoFilterSchema,
    type GastoCreate,
    type GastoUpdate,
    type GastoFilter,
    type Gasto,
    type ActionResponse,
    type EstadisticasGastos,
    GASTO_STATUS
} from './finanzas.schemas';

// =====================================
// CREAR GASTO
// =====================================
export async function crearGasto(data: GastoCreate): Promise<ActionResponse<string>> {
    try {
        console.log('🔄 Creando gasto:', data);

        // Validar datos
        const validatedData = GastoCreateSchema.parse(data);

        // Crear el gasto
        const nuevoGasto = await prisma.gasto.create({
            data: {
                concepto: validatedData.concepto,
                descripcion: validatedData.descripcion,
                monto: validatedData.monto,
                categoria: validatedData.categoria,
                subcategoria: validatedData.subcategoria,
                fecha: validatedData.fecha,
                fechaFactura: validatedData.fechaFactura,
                metodoPago: validatedData.metodoPago,
                numeroFactura: validatedData.numeroFactura,
                proveedor: validatedData.proveedor,
                eventoId: validatedData.eventoId,
                usuarioId: validatedData.usuarioId,
                comprobanteUrl: validatedData.comprobanteUrl,
                status: GASTO_STATUS.ACTIVO
            }
        });

        console.log('✅ Gasto creado exitosamente:', nuevoGasto.id);

        // Revalidar páginas
        revalidatePath('/admin/dashboard/finanzas');
        revalidatePath('/admin/dashboard/finanzas/gastos');

        return {
            success: true,
            message: 'Gasto creado exitosamente',
            data: nuevoGasto.id
        };

    } catch (error) {
        console.error('❌ Error al crear gasto:', error);
        return {
            success: false,
            message: 'Error al crear gasto',
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

// =====================================
// ACTUALIZAR GASTO
// =====================================
export async function actualizarGasto(data: GastoUpdate): Promise<ActionResponse<boolean>> {
    try {
        console.log('🔄 Actualizando gasto:', data.id);

        // Validar datos
        const validatedData = GastoUpdateSchema.parse(data);

        // Verificar que el gasto existe
        const gastoExistente = await prisma.gasto.findUnique({
            where: { id: validatedData.id }
        });

        if (!gastoExistente) {
            return {
                success: false,
                message: 'Gasto no encontrado'
            };
        }

        // Actualizar el gasto
        const gastoActualizado = await prisma.gasto.update({
            where: { id: validatedData.id },
            data: {
                ...(validatedData.concepto !== undefined && { concepto: validatedData.concepto }),
                ...(validatedData.descripcion !== undefined && { descripcion: validatedData.descripcion }),
                ...(validatedData.monto !== undefined && { monto: validatedData.monto }),
                ...(validatedData.categoria !== undefined && { categoria: validatedData.categoria }),
                ...(validatedData.subcategoria !== undefined && { subcategoria: validatedData.subcategoria }),
                ...(validatedData.fecha !== undefined && { fecha: validatedData.fecha }),
                ...(validatedData.fechaFactura !== undefined && { fechaFactura: validatedData.fechaFactura }),
                ...(validatedData.metodoPago !== undefined && { metodoPago: validatedData.metodoPago }),
                ...(validatedData.numeroFactura !== undefined && { numeroFactura: validatedData.numeroFactura }),
                ...(validatedData.proveedor !== undefined && { proveedor: validatedData.proveedor }),
                ...(validatedData.eventoId !== undefined && { eventoId: validatedData.eventoId }),
                ...(validatedData.comprobanteUrl !== undefined && { comprobanteUrl: validatedData.comprobanteUrl }),
                ...(validatedData.status !== undefined && { status: validatedData.status })
            }
        });

        console.log('✅ Gasto actualizado exitosamente:', gastoActualizado.id);

        // Revalidar páginas
        revalidatePath('/admin/dashboard/finanzas');
        revalidatePath('/admin/dashboard/finanzas/gastos');
        revalidatePath(`/admin/dashboard/finanzas/gastos/${validatedData.id}`);

        return {
            success: true,
            message: 'Gasto actualizado exitosamente',
            data: true
        };

    } catch (error) {
        console.error('❌ Error al actualizar gasto:', error);
        return {
            success: false,
            message: 'Error al actualizar gasto',
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

// =====================================
// OBTENER GASTO POR ID
// =====================================
export async function obtenerGastoPorId(id: string): Promise<Gasto | null> {
    try {
        console.log('🔄 Obteniendo gasto por ID:', id);

        const gasto = await prisma.gasto.findUnique({
            where: { id },
            include: {
                Evento: {
                    select: {
                        id: true,
                        nombre: true,
                        fecha_evento: true
                    }
                },
                Usuario: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                }
            }
        });

        if (!gasto) {
            console.log('❌ Gasto no encontrado:', id);
            return null;
        }

        console.log('✅ Gasto obtenido exitosamente:', gasto.id);
        return gasto as Gasto;

    } catch (error) {
        console.error('❌ Error al obtener gasto:', error);
        return null;
    }
}

// =====================================
// LISTAR GASTOS CON FILTROS
// =====================================
export async function listarGastos(
    filtros: GastoFilter = {},
    page: number = 1,
    pageSize: number = 20
): Promise<{
    gastos: Gasto[];
    total: number;
    totalPages: number;
}> {
    try {
        console.log('🔄 Listando gastos con filtros:', filtros);

        // Validar filtros
        const validatedFilters = GastoFilterSchema.parse(filtros);

        // Construir condiciones WHERE
        const whereConditions: any = {
            ...(validatedFilters.status && { status: validatedFilters.status }),
            ...(validatedFilters.categoria && { categoria: validatedFilters.categoria }),
            ...(validatedFilters.subcategoria && { subcategoria: validatedFilters.subcategoria }),
            ...(validatedFilters.eventoId && { eventoId: validatedFilters.eventoId }),
            ...(validatedFilters.usuarioId && { usuarioId: validatedFilters.usuarioId }),
            ...(validatedFilters.proveedor && {
                proveedor: { contains: validatedFilters.proveedor, mode: 'insensitive' }
            })
        };

        // Filtros de fecha
        if (validatedFilters.fechaInicio || validatedFilters.fechaFin) {
            whereConditions.fecha = {};
            if (validatedFilters.fechaInicio) {
                whereConditions.fecha.gte = validatedFilters.fechaInicio;
            }
            if (validatedFilters.fechaFin) {
                whereConditions.fecha.lte = validatedFilters.fechaFin;
            }
        }

        // Filtros de monto
        if (validatedFilters.montoMin || validatedFilters.montoMax) {
            whereConditions.monto = {};
            if (validatedFilters.montoMin) {
                whereConditions.monto.gte = validatedFilters.montoMin;
            }
            if (validatedFilters.montoMax) {
                whereConditions.monto.lte = validatedFilters.montoMax;
            }
        }

        // Contar total de registros
        const total = await prisma.gasto.count({
            where: whereConditions
        });

        // Obtener gastos paginados
        const gastos = await prisma.gasto.findMany({
            where: whereConditions,
            include: {
                Evento: {
                    select: {
                        id: true,
                        nombre: true,
                        fecha_evento: true
                    }
                },
                Usuario: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                }
            },
            orderBy: { fecha: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize
        });

        const totalPages = Math.ceil(total / pageSize);

        console.log('✅ Gastos listados exitosamente:', {
            total,
            page,
            pageSize,
            totalPages
        });

        return {
            gastos: gastos as Gasto[],
            total,
            totalPages
        };

    } catch (error) {
        console.error('❌ Error al listar gastos:', error);
        return {
            gastos: [],
            total: 0,
            totalPages: 0
        };
    }
}

// =====================================
// CANCELAR GASTO
// =====================================
export async function cancelarGasto(id: string): Promise<ActionResponse<boolean>> {
    try {
        console.log('🔄 Cancelando gasto:', id);

        // Verificar que el gasto existe
        const gastoExistente = await prisma.gasto.findUnique({
            where: { id }
        });

        if (!gastoExistente) {
            return {
                success: false,
                message: 'Gasto no encontrado'
            };
        }

        if (gastoExistente.status === GASTO_STATUS.CANCELADO) {
            return {
                success: false,
                message: 'El gasto ya está cancelado'
            };
        }

        // Cancelar el gasto
        await prisma.gasto.update({
            where: { id },
            data: {
                status: GASTO_STATUS.CANCELADO
            }
        });

        console.log('✅ Gasto cancelado exitosamente:', id);

        // Revalidar páginas
        revalidatePath('/admin/dashboard/finanzas');
        revalidatePath('/admin/dashboard/finanzas/gastos');

        return {
            success: true,
            message: 'Gasto cancelado exitosamente',
            data: true
        };

    } catch (error) {
        console.error('❌ Error al cancelar gasto:', error);
        return {
            success: false,
            message: 'Error al cancelar gasto',
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

// =====================================
// ESTADÍSTICAS DE GASTOS
// =====================================
export async function obtenerEstadisticasGastos(
    fechaInicio: Date,
    fechaFin: Date,
    eventoId?: string
): Promise<EstadisticasGastos> {
    try {
        console.log('🔄 Obteniendo estadísticas de gastos:', {
            fechaInicio,
            fechaFin,
            eventoId
        });

        const whereConditions: any = {
            status: GASTO_STATUS.ACTIVO,
            fecha: {
                gte: fechaInicio,
                lte: fechaFin
            }
        };

        if (eventoId) {
            whereConditions.eventoId = eventoId;
        }

        // Obtener todos los gastos del periodo
        const gastos = await prisma.gasto.findMany({
            where: whereConditions,
            orderBy: { fecha: 'desc' }
        });

        const totalMonto = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
        const cantidadGastos = gastos.length;
        const promedioMonto = cantidadGastos > 0 ? totalMonto / cantidadGastos : 0;

        // Gastos por categoría
        const gastoPorCategoria = Object.entries(
            gastos.reduce((acc, gasto) => {
                acc[gasto.categoria] = (acc[gasto.categoria] || 0) + gasto.monto;
                return acc;
            }, {} as Record<string, number>)
        ).map(([categoria, total]) => ({
            categoria,
            total,
            cantidad: gastos.filter(g => g.categoria === categoria).length,
            porcentaje: totalMonto > 0 ? (total / totalMonto) * 100 : 0
        }));

        // Gastos por mes
        const gastoPorMes = Object.entries(
            gastos.reduce((acc, gasto) => {
                const mes = gasto.fecha.toISOString().substring(0, 7); // YYYY-MM
                acc[mes] = (acc[mes] || 0) + gasto.monto;
                return acc;
            }, {} as Record<string, number>)
        ).map(([mes, total]) => ({
            mes,
            total,
            cantidad: gastos.filter(g => g.fecha.toISOString().substring(0, 7) === mes).length
        }));

        // Top proveedores
        const proveedoresData = gastos
            .filter(g => g.proveedor)
            .reduce((acc, gasto) => {
                const proveedor = gasto.proveedor!;
                if (!acc[proveedor]) {
                    acc[proveedor] = { total: 0, cantidad: 0 };
                }
                acc[proveedor].total += gasto.monto;
                acc[proveedor].cantidad += 1;
                return acc;
            }, {} as Record<string, { total: number; cantidad: number }>);

        const topProveedores = Object.entries(proveedoresData)
            .map(([proveedor, data]) => ({
                proveedor,
                total: data.total,
                cantidad: data.cantidad
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        console.log('✅ Estadísticas obtenidas exitosamente');

        return {
            totalMonto,
            promedioMonto,
            cantidadGastos,
            gastoPorCategoria,
            gastoPorMes,
            topProveedores
        };

    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error);
        return {
            totalMonto: 0,
            promedioMonto: 0,
            cantidadGastos: 0,
            gastoPorCategoria: [],
            gastoPorMes: [],
            topProveedores: []
        };
    }
}
