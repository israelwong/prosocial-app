/**
 * @deprecated Este archivo está obsoleto. Utiliza '/app/admin/_lib/actions/cotizacion/cotizacion.actions.ts' en su lugar.
 * 
 * Las funciones han sido migradas a la nueva estructura organizacional:
 * - autorizarCotizacion → /app/admin/_lib/actions/cotizacion/cotizacion.actions.ts
 * - verificarEstadoAutorizacion → /app/admin/_lib/actions/cotizacion/cotizacion.actions.ts
 * 
 * Este archivo será eliminado en una versión futura.
 * Actualiza tus imports para usar la nueva ubicación:
 * import { autorizarCotizacion, verificarEstadoAutorizacion } from '@/app/admin/_lib/actions/cotizacion/cotizacion.actions';
 */

'use server'
import { COTIZACION_STATUS, AGENDA_STATUS } from './constants/status';
import prisma from './prismaClient';
import { revalidatePath } from 'next/cache';

interface AutorizarCotizacionResult {
    success?: boolean;
    error?: string;
    message?: string;
    cotizacionesArchivadas?: number;
}

/**
 * @deprecated Esta función ha sido migrada a /app/admin/_lib/actions/cotizacion/cotizacion.actions.ts
 * Utiliza la nueva ubicación: 
 * import { autorizarCotizacion } from '@/app/admin/_lib/actions/cotizacion/cotizacion.actions';
 */
export async function autorizarCotizacion(cotizacionId: string): Promise<AutorizarCotizacionResult> {
    try {
        console.log('🔥 Iniciando autorización de cotización:', cotizacionId);

        // 1. Obtener la cotización completa
        const cotizacion = await prisma.cotizacion.findUnique({
            where: { id: cotizacionId },
            include: {
                Evento: {
                    include: {
                        Cliente: true,
                        EventoTipo: true
                    }
                }
            }
        });

        if (!cotizacion) {
            return { error: 'Cotización no encontrada' };
        }

        if (cotizacion.status === COTIZACION_STATUS.AUTORIZADO) {
            return { error: 'La cotización ya está autorizada' };
        }

        const evento = cotizacion.Evento;

        // 2. Buscar la etapa "Autorizado" (posición 2 típicamente)
        const etapaAutorizado = await prisma.eventoEtapa.findFirst({
            where: {
                OR: [
                    { nombre: { contains: 'autorizado', mode: 'insensitive' } },
                    { nombre: { contains: 'aprobado', mode: 'insensitive' } },
                    { posicion: 2 }
                ]
            },
            orderBy: { posicion: 'asc' }
        });

        if (!etapaAutorizado) {
            return { error: 'No se encontró la etapa de autorización en el sistema' };
        }

        console.log('📋 Etapa de autorización encontrada:', etapaAutorizado.nombre);

        // 3. Realizar las actualizaciones en una transacción
        const result = await prisma.$transaction(async (tx) => {
            // Actualizar status de la cotización autorizada
            await tx.cotizacion.update({
                where: { id: cotizacionId },
                data: {
                    status: COTIZACION_STATUS.AUTORIZADO,
                    updatedAt: new Date()
                }
            });

            // Contar y archivar todas las demás cotizaciones del mismo evento que no estén autorizadas
            const cotizacionesParaArchivar = await tx.cotizacion.count({
                where: {
                    eventoId: evento.id,
                    id: { not: cotizacionId }, // Excluir la cotización que se está autorizando
                    status: { not: COTIZACION_STATUS.AUTORIZADO }, // Solo contar las no autorizadas
                    archivada: false // Solo las que no estén ya archivadas
                }
            });

            const archivadas = await tx.cotizacion.updateMany({
                where: {
                    eventoId: evento.id,
                    id: { not: cotizacionId }, // Excluir la cotización que se está autorizando
                    status: { not: COTIZACION_STATUS.AUTORIZADO }, // Solo archivar las no autorizadas
                    archivada: false // Solo las que no estén ya archivadas
                },
                data: {
                    archivada: true,
                    updatedAt: new Date()
                }
            });

            console.log(`🗃️ ${archivadas.count} cotizaciones del evento archivadas automáticamente`);

            // Actualizar etapa del evento
            await tx.evento.update({
                where: { id: evento.id },
                data: {
                    eventoEtapaId: etapaAutorizado.id,
                    updatedAt: new Date()
                }
            });

            // Crear entrada en la agenda si no existe
            const agendaExistente = await tx.agenda.findFirst({
                where: {
                    eventoId: evento.id,
                    fecha: evento.fecha_evento
                }
            });

            if (!agendaExistente) {
                await tx.agenda.create({
                    data: {
                        eventoId: evento.id,
                        fecha: evento.fecha_evento,
                        concepto: `${evento.EventoTipo?.nombre || 'Evento'} - ${evento.Cliente.nombre}`,
                        status: AGENDA_STATUS.PENDIENTE,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                });
                console.log('📅 Evento agregado a la agenda');
            } else {
                console.log('📅 Evento ya existe en la agenda');
            }

            // Crear entrada en bitácora del evento
            const comentarioBitacora = `Cotización "${cotizacion.nombre}" autorizada. Evento movido a etapa: ${etapaAutorizado.nombre}` +
                (archivadas.count > 0 ? `. ${archivadas.count} cotización(es) adicional(es) archivadas automáticamente.` : '');

            await tx.eventoBitacora.create({
                data: {
                    eventoId: evento.id,
                    comentario: comentarioBitacora,
                    importancia: '2',
                    status: 'active',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });

            return {
                cotizacionId,
                eventoId: evento.id,
                etapaId: etapaAutorizado.id,
                etapaNombre: etapaAutorizado.nombre,
                cotizacionesArchivadas: archivadas.count
            };
        });

        // 4. Revalidar caches
        revalidatePath('/admin/dashboard/eventos');
        revalidatePath('/admin/dashboard/seguimiento');
        revalidatePath(`/admin/dashboard/eventos/${evento.id}`);
        revalidatePath(`/admin/dashboard/eventos/${evento.id}/cotizacion`);

        console.log('✅ Cotización autorizada exitosamente:', {
            cotizacion: cotizacionId,
            evento: evento.id,
            etapa: result.etapaNombre,
            archivadas: result.cotizacionesArchivadas
        });

        const mensaje = `Cotización autorizada exitosamente. El evento fue movido a la etapa: ${result.etapaNombre}` +
            (result.cotizacionesArchivadas > 0 ? `. ${result.cotizacionesArchivadas} cotización(es) adicional(es) fueron archivadas automáticamente.` : '');

        return {
            success: true,
            message: mensaje,
            cotizacionesArchivadas: result.cotizacionesArchivadas
        };

    } catch (error: unknown) {
        console.error('❌ Error al autorizar cotización:', error);

        if (error instanceof Error) {
            return { error: `Error al autorizar cotización: ${error.message}` };
        }

        return { error: 'Error desconocido al autorizar cotización' };
    }
}

/**
 * @deprecated Esta función ha sido migrada a /app/admin/_lib/actions/cotizacion/cotizacion.actions.ts
 * Utiliza la nueva ubicación: 
 * import { verificarEstadoAutorizacion } from '@/app/admin/_lib/actions/cotizacion/cotizacion.actions';
 */
export async function verificarEstadoAutorizacion(cotizacionId: string) {
    try {
        const cotizacion = await prisma.cotizacion.findUnique({
            where: { id: cotizacionId },
            select: {
                status: true,
                Evento: {
                    select: {
                        eventoEtapaId: true,
                        EventoEtapa: {
                            select: {
                                nombre: true,
                                posicion: true
                            }
                        }
                    }
                }
            }
        });

        return {
            cotizacionStatus: cotizacion?.status,
            eventoEtapa: cotizacion?.Evento.EventoEtapa?.nombre,
            estaAutorizado: cotizacion?.status === COTIZACION_STATUS.AUTORIZADO
        };

    } catch (error) {
        console.error('Error verificando estado de autorización:', error);
        return { error: 'Error verificando estado' };
    }
}
