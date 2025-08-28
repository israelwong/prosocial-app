/**
 * Función auxiliar para crear notificaciones con metadata usando SQL raw
 * Útil cuando el cliente de Prisma no reconoce los nuevos campos
 */

import prisma from '@/app/admin/_lib/prismaClient'

interface NotificacionConMetadata {
    titulo: string
    mensaje: string
    tipo: string
    metadata: any
    status: string
    cotizacionId?: string
    userId?: string
}

export async function crearNotificacionConMetadata(data: NotificacionConMetadata) {
    try {
        // Usar SQL raw para insertar la notificación con los nuevos campos
        const result = await prisma.$queryRaw`
            INSERT INTO "Notificacion" (
                id, 
                "userId", 
                titulo, 
                mensaje, 
                tipo, 
                metadata, 
                status, 
                "cotizacionId", 
                "createdAt", 
                "updatedAt"
            ) VALUES (
                gen_random_uuid(),
                ${data.userId || null},
                ${data.titulo},
                ${data.mensaje},
                ${data.tipo},
                ${JSON.stringify(data.metadata)}::json,
                ${data.status},
                ${data.cotizacionId || null},
                NOW(),
                NOW()
            )
        `

        console.log('🔔 Notificación creada usando SQL raw')
        return { success: true, result }

    } catch (error) {
        console.error('❌ Error al crear notificación con SQL raw:', error)

        // Fallback a método tradicional sin metadata
        try {
            const notificacionFallback = await prisma.notificacion.create({
                data: {
                    titulo: data.titulo,
                    mensaje: data.mensaje,
                    status: data.status,
                    cotizacionId: data.cotizacionId,
                    userId: data.userId
                }
            })

            console.log('🔄 Notificación creada usando método fallback (sin metadata)')
            return { success: true, result: notificacionFallback, fallback: true }

        } catch (fallbackError) {
            console.error('❌ Error en método fallback:', fallbackError)
            throw new Error('No se pudo crear la notificación')
        }
    }
}
