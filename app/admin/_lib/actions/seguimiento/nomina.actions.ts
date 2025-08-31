'use server';

import prisma from '@/app/admin/_lib/prismaClient';
import { revalidatePath } from 'next/cache';
import { NOMINA_STATUS } from '@/app/admin/_lib/constants/status';

// =====================================
// CREAR NÓMINA INDIVIDUAL
// =====================================
export async function crearNominaIndividual(
    cotizacionServicioId: string,
    eventoId: string,
    datosNomina: {
        concepto: string;
        descripcion?: string;
        monto_bruto: number;
        deducciones?: number;
        monto_neto: number;
        metodo_pago?: string;
    }
) {
    try {
        console.log('🔄 Creando nómina individual:', {
            cotizacionServicioId,
            eventoId,
            datosNomina
        });

        // Verificar que el servicio existe y tiene usuario asignado
        const servicio = await prisma.cotizacionServicio.findUnique({
            where: { id: cotizacionServicioId }
        });

        if (!servicio) {
            throw new Error('Servicio no encontrado');
        }

        if (!servicio.userId) {
            throw new Error('El servicio no tiene usuario asignado');
        }

        // @ts-ignore - Usar transacción para crear nómina y relación
        const resultado = await prisma.$transaction(async (tx) => {
            // Crear la nómina
            const nomina = await tx.$queryRaw`
                INSERT INTO "Nomina" (
                    id, "userId", "eventoId", concepto, descripcion, 
                    monto_bruto, deducciones, monto_neto, tipo_pago, 
                    servicios_incluidos, costo_total_snapshot, 
                    metodo_pago, "createdAt", "updatedAt"
                ) VALUES (
                    gen_random_uuid(), 
                    ${servicio.userId}, 
                    ${eventoId}, 
                    ${datosNomina.concepto}, 
                    ${datosNomina.descripcion || null}, 
                    ${datosNomina.monto_bruto}, 
                    ${datosNomina.deducciones || 0}, 
                    ${datosNomina.monto_neto}, 
                    'individual', 
                    1, 
                    ${servicio.costo_snapshot || 0}, 
                    ${datosNomina.metodo_pago || 'transferencia'}, 
                    NOW(), 
                    NOW()
                )
                RETURNING id
            `;

            // Obtener el ID de la nómina creada
            const nominaId = (nomina as any)[0]?.id;

            if (nominaId) {
                // Crear la relación en NominaServicio
                await tx.$queryRaw`
                    INSERT INTO "NominaServicio" (
                        id, "nominaId", "cotizacionServicioId", 
                        servicio_nombre, seccion_nombre, categoria_nombre,
                        costo_asignado, cantidad_asignada, "createdAt"
                    ) VALUES (
                        gen_random_uuid(),
                        ${nominaId},
                        ${cotizacionServicioId},
                        ${servicio.nombre_snapshot || 'Servicio sin nombre'},
                        ${servicio.seccion_nombre_snapshot},
                        ${servicio.categoria_nombre_snapshot},
                        ${servicio.costo_snapshot || 0},
                        ${servicio.cantidad},
                        NOW()
                    )
                `;
            }

            return nominaId;
        });

        console.log('✅ Nómina creada exitosamente:', resultado);

        // Revalidar para actualizar la UI
        revalidatePath(`/admin/dashboard/seguimiento/${eventoId}`);

        return { success: true, message: 'Nómina creada exitosamente', nominaId: resultado };

    } catch (error) {
        console.error('❌ Error al crear nómina:', error);
        throw new Error(error instanceof Error ? error.message : 'Error desconocido al crear nómina');
    }
}

// =====================================
// AUTORIZAR PAGO DE NÓMINA
// =====================================
export async function autorizarPago(
    nominaId: string,
    autorizadoPorUserId: string,
    eventoId: string
) {
    try {
        console.log('🔄 Autorizando pago:', {
            nominaId,
            autorizadoPorUserId,
            eventoId
        });

        // Verificar que el usuario autorizador existe
        const usuarioAutorizador = await prisma.user.findUnique({
            where: { id: autorizadoPorUserId },
            select: { id: true, username: true, email: true }
        });

        if (!usuarioAutorizador) {
            throw new Error(`Usuario autorizador no encontrado: ${autorizadoPorUserId}`);
        }

        // Verificar que la nómina existe y está pendiente
        const nominaExistente = await prisma.nomina.findUnique({
            where: { id: nominaId },
            select: { id: true, status: true, concepto: true }
        });

        if (!nominaExistente) {
            throw new Error('Nómina no encontrada');
        }

        if (nominaExistente.status !== NOMINA_STATUS.PENDIENTE) {
            throw new Error(`No se puede autorizar una nómina con status: ${nominaExistente.status}`);
        }

        // Actualizar usando Prisma ORM
        await prisma.nomina.update({
            where: { id: nominaId },
            data: {
                status: NOMINA_STATUS.AUTORIZADO,
                autorizado_por: autorizadoPorUserId,
                fecha_autorizacion: new Date(),
            }
        });

        console.log('✅ Pago autorizado exitosamente por:', usuarioAutorizador.username || usuarioAutorizador.email);

        // Revalidar para actualizar la UI
        revalidatePath(`/admin/dashboard/seguimiento/${eventoId}`);

        const nombreUsuario = usuarioAutorizador.username || usuarioAutorizador.email || 'Usuario';
        return {
            success: true,
            message: `Pago autorizado exitosamente por ${nombreUsuario}`
        };

    } catch (error) {
        console.error('❌ Error al autorizar pago:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al autorizar pago';
        throw new Error(errorMessage);
    }
}

export async function cancelarPago(nominaId: string, eventoId: string) {
    console.log('🔄 Iniciando cancelación de pago:', { nominaId, eventoId });

    try {
        // Verificar que la nómina existe y está en estado 'pendiente'
        const nominaExistente = await prisma.nomina.findUnique({
            where: { id: nominaId },
            select: { id: true, status: true }
        });

        if (!nominaExistente) {
            throw new Error('Nómina no encontrada');
        }

        if (nominaExistente.status !== NOMINA_STATUS.PENDIENTE) {
            throw new Error(`Solo se pueden cancelar pagos en estado pendiente. Estado actual: ${nominaExistente.status}`);
        }

        // Actualizar usando Prisma ORM
        await prisma.nomina.update({
            where: { id: nominaId },
            data: {
                status: NOMINA_STATUS.CANCELADO
            }
        });

        console.log('✅ Pago cancelado exitosamente');

        // Revalidar para actualizar la UI
        revalidatePath(`/admin/dashboard/seguimiento/${eventoId}`);

        return { success: true, message: 'Pago cancelado exitosamente' };

    } catch (error) {
        console.error('❌ Error al cancelar pago:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cancelar pago';
        throw new Error(errorMessage);
    }
}

// =====================================
// ELIMINAR NÓMINA
// =====================================
export async function eliminarNomina(nominaId: string) {
    try {
        console.log('🔄 Eliminando nómina:', nominaId);

        // Verificar que la nómina existe
        const nomina = await prisma.nomina.findUnique({
            where: { id: nominaId }
        });

        if (!nomina) {
            throw new Error('Nómina no encontrada');
        }

        // Solo permitir eliminar nóminas pendientes
        if (nomina.status !== 'pendiente') {
            throw new Error('Solo se pueden eliminar nóminas en estado pendiente');
        }

        // Eliminar la nómina
        await prisma.nomina.delete({
            where: { id: nominaId }
        });

        console.log('✅ Nómina eliminada exitosamente');

        // Revalidar rutas relacionadas
        revalidatePath('/admin/dashboard/finanzas/nomina');
        revalidatePath('/admin/dashboard/seguimiento');

        return { success: true };

    } catch (error) {
        console.error('❌ Error al eliminar nómina:', error);
        throw new Error('Error al eliminar nómina');
    }
}

// =====================================
// MARCAR COMO PAGADO
// =====================================
export async function marcarComoPagado(
    nominaId: string,
    pagadoPorUserId: string,
    eventoId: string,
    metodoPago?: string
) {
    try {
        console.log('🔄 Marcando como pagado:', {
            nominaId,
            pagadoPorUserId,
            eventoId,
            metodoPago
        });

        // Verificar que el usuario que marca el pago existe
        const usuarioPagador = await prisma.user.findUnique({
            where: { id: pagadoPorUserId },
            select: { id: true, username: true, email: true }
        });

        if (!usuarioPagador) {
            throw new Error(`Usuario pagador no encontrado: ${pagadoPorUserId}`);
        }

        // Verificar que la nómina existe y está autorizada
        const nominaExistente = await prisma.nomina.findUnique({
            where: { id: nominaId },
            select: { id: true, status: true, concepto: true, monto_neto: true }
        });

        if (!nominaExistente) {
            throw new Error('Nómina no encontrada');
        }

        if (nominaExistente.status !== NOMINA_STATUS.AUTORIZADO) {
            throw new Error(`Solo se pueden marcar como pagadas las nóminas autorizadas. Estado actual: ${nominaExistente.status}`);
        }

        // Actualizar usando Prisma ORM
        await prisma.nomina.update({
            where: { id: nominaId },
            data: {
                status: NOMINA_STATUS.PAGADO,
                pagado_por: pagadoPorUserId,
                fecha_pago: new Date(),
                metodo_pago: metodoPago || 'transferencia'
            }
        });

        console.log('✅ Pago marcado como pagado exitosamente por:', usuarioPagador.username || usuarioPagador.email);

        // Revalidar para actualizar la UI
        revalidatePath(`/admin/dashboard/seguimiento/${eventoId}`);
        revalidatePath('/admin/dashboard/finanzas/nomina');

        const nombreUsuario = usuarioPagador.username || usuarioPagador.email || 'Usuario';
        return {
            success: true,
            message: `Pago marcado como completado por ${nombreUsuario}`
        };

    } catch (error) {
        console.error('❌ Error al marcar como pagado:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al marcar como pagado';
        throw new Error(errorMessage);
    }
}

// =====================================
// AUTORIZAR Y PAGAR (ACCIÓN COMBINADA)
// =====================================
export async function autorizarYPagar(
    nominaId: string,
    usuarioId: string,
    eventoId: string,
    metodoPago?: string
) {
    try {
        console.log('🔄 Autorizando y pagando:', {
            nominaId,
            usuarioId,
            eventoId
        });

        // Primero autorizar
        await autorizarPago(nominaId, usuarioId, eventoId);

        // Luego marcar como pagado
        await marcarComoPagado(nominaId, usuarioId, eventoId, metodoPago);

        return {
            success: true,
            message: 'Pago autorizado y marcado como completado exitosamente'
        };

    } catch (error) {
        console.error('❌ Error al autorizar y pagar:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al autorizar y pagar';
        throw new Error(errorMessage);
    }
}
