'use server'
import prisma from './prismaClient';
import { revalidatePath } from 'next/cache';

interface AutorizarCotizacionResult {
    success?: boolean;
    error?: string;
    message?: string;
}

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

        if (cotizacion.status === 'aprobada') {
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
            // Actualizar status de la cotización
            await tx.cotizacion.update({
                where: { id: cotizacionId },
                data: {
                    status: 'aprobada',
                    updatedAt: new Date()
                }
            });

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
                        status: 'pendiente',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                });
                console.log('📅 Evento agregado a la agenda');
            } else {
                console.log('📅 Evento ya existe en la agenda');
            }

            // Crear entrada en bitácora del evento
            await tx.eventoBitacora.create({
                data: {
                    eventoId: evento.id,
                    comentario: `Cotización "${cotizacion.nombre}" aprobada. Evento movido a etapa: ${etapaAutorizado.nombre}`,
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
                etapaNombre: etapaAutorizado.nombre
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
            etapa: result.etapaNombre
        });

        return {
            success: true,
            message: `Cotización autorizada exitosamente. El evento fue movido a la etapa: ${result.etapaNombre}`
        };

    } catch (error: unknown) {
        console.error('❌ Error al autorizar cotización:', error);

        if (error instanceof Error) {
            return { error: `Error al autorizar cotización: ${error.message}` };
        }

        return { error: 'Error desconocido al autorizar cotización' };
    }
}

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
            estaAutorizado: cotizacion?.status === 'autorizado'
        };

    } catch (error) {
        console.error('Error verificando estado de autorización:', error);
        return { error: 'Error verificando estado' };
    }
}
