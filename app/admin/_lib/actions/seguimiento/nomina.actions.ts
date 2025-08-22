'use server';

import prisma from '@/app/admin/_lib/prismaClient';
import { revalidatePath } from 'next/cache';

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

        // @ts-ignore - Usar operación directa en la base de datos
        await prisma.$queryRaw`
            UPDATE "Nomina" 
            SET status = 'autorizado', 
                autorizado_por = ${autorizadoPorUserId}, 
                fecha_autorizacion = NOW(),
                "updatedAt" = NOW()
            WHERE id = ${nominaId}
        `;

        console.log('✅ Pago autorizado exitosamente');

        // Revalidar para actualizar la UI
        revalidatePath(`/admin/dashboard/seguimiento/${eventoId}`);

        return { success: true };

    } catch (error) {
        console.error('❌ Error al autorizar pago:', error);
        throw new Error('Error al autorizar pago');
    }
}

export async function cancelarPago(nominaId: string, eventoId: string) {
    console.log('🔄 Iniciando cancelación de pago:', { nominaId, eventoId });

    try {
        // Verificar que la nómina existe y está en estado 'pendiente'
        // @ts-ignore - Usar operación directa en la base de datos
        const nomina = await prisma.$queryRaw`
            SELECT id, status FROM "Nomina" 
            WHERE id = ${nominaId}
        `;

        if (!nomina || (nomina as any).length === 0) {
            throw new Error('Nómina no encontrada');
        }

        const nominaData = (nomina as any)[0];
        if (nominaData.status !== 'pendiente') {
            throw new Error('Solo se pueden cancelar pagos en estado pendiente');
        }

        // @ts-ignore - Usar operación directa en la base de datos
        await prisma.$queryRaw`
            UPDATE "Nomina" 
            SET status = 'cancelado', 
                "updatedAt" = NOW()
            WHERE id = ${nominaId}
        `;

        console.log('✅ Pago cancelado exitosamente');

        // Revalidar para actualizar la UI
        revalidatePath(`/admin/dashboard/seguimiento/${eventoId}`);

        return { success: true };

    } catch (error) {
        console.error('❌ Error al cancelar pago:', error);
        throw new Error('Error al cancelar pago');
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
