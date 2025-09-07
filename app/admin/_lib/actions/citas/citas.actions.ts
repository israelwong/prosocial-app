'use server'

import prisma from '@/app/admin/_lib/prismaClient'
import { revalidatePath } from 'next/cache'
import { CitaFormData, CitaConDetalle } from '@/types/citas'

export async function getCitasByEventoId(eventoId: string): Promise<CitaConDetalle[]> {
    try {
        const citas = await prisma.cita.findMany({
            where: {
                eventoId: eventoId
            },
            include: {
                CitaComentario: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                CitaRecordatorio: {
                    where: {
                        enviado: false
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            },
            orderBy: {
                fecha: 'desc'
            }
        })

        return citas as CitaConDetalle[]
    } catch (error) {
        console.error('Error al obtener citas:', error)
        throw new Error('Error al cargar las citas del evento')
    }
}

export async function createCita(data: CitaFormData): Promise<{ success: boolean; message: string; citaId?: string }> {
    try {
        // Extraer fecha y hora
        const fecha = new Date(data.fechaHora)
        const hora = data.fechaHora.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        })

        const nuevaCita = await prisma.cita.create({
            data: {
                eventoId: data.eventoId,
                asunto: data.titulo,
                descripcion: data.descripcion,
                fecha: fecha,
                hora: hora,
                tipo: data.tipo as any, // Temporal fix for enum
                modalidad: data.modalidad as any, // Temporal fix for enum
                ubicacion: data.ubicacion,
                urlVirtual: data.urlVirtual,
                status: 'PROGRAMADA' as any // Temporal fix for enum
            }
        })

        revalidatePath(`/admin/dashboard/eventos/${data.eventoId}`)

        return {
            success: true,
            message: 'Cita creada exitosamente',
            citaId: nuevaCita.id
        }
    } catch (error) {
        console.error('Error al crear cita:', error)
        return {
            success: false,
            message: 'Error al crear la cita'
        }
    }
}

export async function updateCitaStatus(
    citaId: string,
    status: 'PROGRAMADA' | 'CONFIRMADA' | 'EN_CURSO' | 'COMPLETADA' | 'CANCELADA' | 'NO_ASISTIO',
    eventoId: string
): Promise<{ success: boolean; message: string }> {
    try {
        await prisma.cita.update({
            where: { id: citaId },
            data: { status: status as any } // Temporal fix for enum
        })

        revalidatePath(`/admin/dashboard/eventos/${eventoId}`)

        return {
            success: true,
            message: 'Status de cita actualizado'
        }
    } catch (error) {
        console.error('Error al actualizar status de cita:', error)
        return {
            success: false,
            message: 'Error al actualizar el status'
        }
    }
}

export async function addComentarioCita(
    citaId: string,
    contenido: string,
    eventoId: string
): Promise<{ success: boolean; message: string }> {
    try {
        await prisma.citaComentario.create({
            data: {
                citaId: citaId,
                comentario: contenido
            }
        })

        revalidatePath(`/admin/dashboard/eventos/${eventoId}`)

        return {
            success: true,
            message: 'Comentario agregado'
        }
    } catch (error) {
        console.error('Error al agregar comentario:', error)
        return {
            success: false,
            message: 'Error al agregar comentario'
        }
    }
}

export async function createRecordatorio(
    citaId: string,
    tiempoAnticipacion: number, // minutos antes de la cita
    eventoId: string
): Promise<{ success: boolean; message: string }> {
    try {
        await prisma.citaRecordatorio.create({
            data: {
                citaId: citaId,
                tiempoAnticipacion: tiempoAnticipacion
            }
        })

        revalidatePath(`/admin/dashboard/eventos/${eventoId}`)

        return {
            success: true,
            message: 'Recordatorio programado'
        }
    } catch (error) {
        console.error('Error al crear recordatorio:', error)
        return {
            success: false,
            message: 'Error al programar recordatorio'
        }
    }
}

export async function deleteCita(citaId: string, eventoId: string): Promise<{ success: boolean; message: string }> {
    try {
        // Eliminar recordatorios y comentarios asociados
        await prisma.citaRecordatorio.deleteMany({
            where: { citaId: citaId }
        })

        await prisma.citaComentario.deleteMany({
            where: { citaId: citaId }
        })

        // Eliminar la cita
        await prisma.cita.delete({
            where: { id: citaId }
        })

        revalidatePath(`/admin/dashboard/eventos/${eventoId}`)

        return {
            success: true,
            message: 'Cita eliminada exitosamente'
        }
    } catch (error) {
        console.error('Error al eliminar cita:', error)
        return {
            success: false,
            message: 'Error al eliminar la cita'
        }
    }
}
