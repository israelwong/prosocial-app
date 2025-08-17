'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../../prismaClient';

/**
 * Asigna un usuario a un servicio específico de una cotización.
 * @param servicioId - El ID del CotizacionServicio.
 * @param userId - El ID del User a asignar.
 * @param eventoId - El ID del Evento para revalidar la ruta correcta.
 */
export async function asignarUsuarioAServicio(servicioId: string, userId: string, eventoId: string) {
    try {
        await prisma.cotizacionServicio.update({
            where: { id: servicioId },
            data: { userId: userId },
        });
        // Revalida la página de detalle del evento para reflejar el cambio.
        revalidatePath(`/admin/dashboard/seguimiento/${eventoId}`);
    } catch (error) {
        console.error('Error al asignar usuario al servicio:', error);
        throw new Error('No se pudo asignar el usuario.');
    }
}

/**
 * Remueve la asignación de un usuario de un servicio.
 * @param servicioId - El ID del CotizacionServicio.
 * @param eventoId - El ID del Evento para revalidar la ruta correcta.
 */
export async function removerUsuarioDeServicio(servicioId: string, eventoId: string) {
    try {
        await prisma.cotizacionServicio.update({
            where: { id: servicioId },
            // Establece el userId a null para remover la asignación.
            data: { userId: null },
        });
        // Revalida la página de detalle del evento para reflejar el cambio.
        revalidatePath(`/admin/dashboard/seguimiento/${eventoId}`);
    } catch (error) {
        console.error('Error al remover asignación de usuario:', error);
        throw new Error('No se pudo remover la asignación.');
    }
}
