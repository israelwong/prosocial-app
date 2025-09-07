'use server';

import prisma from '@/app/admin/_lib/prismaClient';
import { revalidatePath } from 'next/cache';

interface ConsultaDisponibilidadData {
    eventoId: string;
    cotizacionId: string;
    motivo: 'expirada' | 'fecha_limite' | 'fecha_ocupada';
    fechaEvento?: Date | null;
    diasMinimos?: number;
    fechaLimite?: Date | null;
    clienteInfo?: {
        nombre?: string;
        email?: string;
        telefono?: string;
    };
}

export async function crearConsultaDisponibilidad(data: ConsultaDisponibilidadData) {
    try {
        // Obtener información adicional del evento y cotización
        const cotizacion = await prisma.cotizacion.findUnique({
            where: { id: data.cotizacionId },
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
            throw new Error('Cotización no encontrada');
        }

        // Crear mensaje descriptivo según el motivo
        let mensaje = '';
        let titulo = '';

        const clienteNombre = cotizacion.Evento.Cliente.nombre;
        const eventoNombre = cotizacion.Evento.nombre;
        const fechaTexto = data.fechaEvento
            ? data.fechaEvento.toLocaleDateString('es-MX', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
            : 'fecha por definir';

        switch (data.motivo) {
            case 'expirada':
                titulo = '⏰ Consulta: Cotización Expirada';
                mensaje = `${clienteNombre} solicita renovación de cotización expirada para "${eventoNombre}" (${fechaTexto}).`;
                break;
            case 'fecha_limite':
                titulo = '🚨 Consulta: Tiempo Límite Agotado';
                mensaje = `${clienteNombre} solicita excepción para "${eventoNombre}" (${fechaTexto}) - Requiere ${data.diasMinimos} días de anticipación.`;
                break;
            case 'fecha_ocupada':
                titulo = '📅 Consulta: Fecha Ocupada';
                mensaje = `${clienteNombre} busca fechas alternativas para "${eventoNombre}" - Fecha original: ${fechaTexto}.`;
                break;
            default:
                titulo = '❓ Consulta de Disponibilidad';
                mensaje = `${clienteNombre} solicita asesoría para "${eventoNombre}" (${fechaTexto}).`;
        }

        // Preparar metadata completa
        const metadata = {
            eventoId: data.eventoId,
            cotizacionId: data.cotizacionId,
            motivo: data.motivo,
            fechaEvento: data.fechaEvento?.toISOString(),
            diasMinimos: data.diasMinimos,
            fechaLimite: data.fechaLimite?.toISOString(),
            eventoInfo: {
                nombre: cotizacion.Evento.nombre,
                tipo: cotizacion.Evento.EventoTipo?.nombre,
                sede: cotizacion.Evento.sede,
                direccion: cotizacion.Evento.direccion
            },
            clienteInfo: {
                nombre: cotizacion.Evento.Cliente.nombre,
                email: cotizacion.Evento.Cliente.email,
                telefono: cotizacion.Evento.Cliente.telefono,
                ...data.clienteInfo
            },
            cotizacionInfo: {
                precio: cotizacion.precio,
                descuento: cotizacion.descuento,
                status: cotizacion.status,
                expiresAt: cotizacion.expiresAt?.toISOString()
            },
            timestamp: new Date().toISOString(),
            urgencia: data.motivo === 'fecha_limite' ? 'alta' : 'media'
        };

        // Crear la notificación
        const notificacion = await prisma.notificacion.create({
            data: {
                titulo,
                mensaje,
                tipo: 'consulta_disponibilidad',
                metadata,
                cotizacionId: data.cotizacionId,
                status: 'active'
            }
        });

        // Revalidar páginas relacionadas
        revalidatePath('/admin/notificaciones');
        revalidatePath('/admin/dashboard');

        return {
            success: true,
            notificacionId: notificacion.id,
            mensaje: 'Consulta enviada exitosamente al equipo de atención.'
        };

    } catch (error) {
        console.error('Error al crear consulta de disponibilidad:', error);
        return {
            success: false,
            error: 'Error al enviar la consulta. Intenta nuevamente.'
        };
    }
}

export async function obtenerConsultasDisponibilidad() {
    try {
        const consultas = await prisma.notificacion.findMany({
            where: {
                tipo: 'consulta_disponibilidad',
                status: 'active'
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return consultas;
    } catch (error) {
        console.error('Error al obtener consultas:', error);
        return [];
    }
}

export async function marcarConsultaComoResuelta(notificacionId: string) {
    try {
        await prisma.notificacion.update({
            where: { id: notificacionId },
            data: { status: 'resolved' }
        });

        revalidatePath('/admin/notificaciones');
        return { success: true };
    } catch (error) {
        console.error('Error al marcar consulta como resuelta:', error);
        return { success: false };
    }
}
