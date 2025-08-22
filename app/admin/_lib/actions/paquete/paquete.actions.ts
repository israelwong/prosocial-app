// Ruta: app/admin/_lib/actions/paquete/paquete.actions.ts

'use server'

import prisma from '@/app/admin/_lib/prismaClient'

// =============================================================================
// FUNCIONES MIGRADAS DESDE ARCHIVOS LEGACY
// =============================================================================

/**
 * Obtener paquetes por tipo de evento - MIGRADA desde @/app/admin/_lib/paquete.actions
 * Función para obtener paquetes ordenados por posición
 * Utilizada por: FichaCotizacionesUnificada
 */
export async function obtenerPaquetesPorTipoEventoLegacy(eventoTipoId: string) {
    return await prisma.paquete.findMany({
        where: { eventoTipoId },
        orderBy: {
            posicion: 'asc'
        }
    });
}
