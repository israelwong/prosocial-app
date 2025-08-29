import prisma from '@/app/admin/_lib/prismaClient'

interface CotizacionPublicaData {
    id: string
    status: string
    eventoId: string
    tieneAprobada: boolean
}

/**
 * Obtiene información básica de una cotización para redirección pública
 */
export async function obtenerCotizacionParaRedireccion(cotizacionId: string): Promise<CotizacionPublicaData | null> {
    try {
        console.log('🔍 Consultando cotización para redirección:', cotizacionId)

        // Obtener la cotización específica
        const cotizacion = await prisma.cotizacion.findUnique({
            where: {
                id: cotizacionId
            },
            select: {
                id: true,
                status: true,
                eventoId: true,
                Evento: {
                    select: {
                        id: true,
                        Cliente: {
                            select: {
                                id: true
                            }
                        },
                        // Obtener todas las cotizaciones del evento para verificar si hay aprobadas
                        Cotizacion: {
                            select: {
                                id: true,
                                status: true
                            },
                            where: {
                                status: 'aprobada'
                            }
                        }
                    }
                }
            }
        })

        if (!cotizacion) {
            console.log('❌ Cotización no encontrada:', cotizacionId)
            return null
        }

        console.log('✅ Cotización encontrada:', {
            id: cotizacion.id,
            status: cotizacion.status,
            eventoId: cotizacion.eventoId,
            cotizacionesAprobadas: cotizacion.Evento?.Cotizacion?.length || 0
        })

        return {
            id: cotizacion.id,
            status: cotizacion.status,
            eventoId: cotizacion.eventoId,
            tieneAprobada: (cotizacion.Evento?.Cotizacion?.length || 0) > 0
        }

    } catch (error) {
        console.error('❌ Error al obtener cotización para redirección:', error)
        return null
    }
}
