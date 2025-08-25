import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Verifica si una cotización tiene pagos en estado 'paid' o 'pending'
 * @param cotizacionId - ID de la cotización
 * @returns objeto con información del estado de pagos
 */
export async function verificarEstadoPagosCotizacion(cotizacionId: string) {
    try {
        // Buscar pagos de la cotización con estados relevantes
        const pagos = await prisma.pago.findMany({
            where: {
                cotizacionId: cotizacionId,
                status: {
                    in: ["paid", "completado", "pending", "pending_payment", "processing"]
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        const tienePagos = pagos.length > 0;
        
        if (!tienePagos) {
            return {
                tienePagos: false,
                estadoPago: null,
                requiereLogin: false,
                pagoMasReciente: null
            };
        }

        const pagoMasReciente = pagos[0];
        const esPendiente = ["pending", "pending_payment", "processing"].includes(pagoMasReciente.status);
        const esPagado = ["paid", "completado"].includes(pagoMasReciente.status);

        return {
            tienePagos: true,
            estadoPago: pagoMasReciente.status,
            requiereLogin: esPendiente || esPagado, // Ambos requieren login
            pagoMasReciente: {
                id: pagoMasReciente.id,
                status: pagoMasReciente.status,
                monto: pagoMasReciente.monto,
                metodo_pago: pagoMasReciente.metodo_pago,
                createdAt: pagoMasReciente.createdAt,
                updatedAt: pagoMasReciente.updatedAt
            },
            esPendiente,
            esPagado
        };

    } catch (error) {
        console.error('Error al verificar estado de pagos:', error);
        return {
            tienePagos: false,
            estadoPago: null,
            requiereLogin: false,
            pagoMasReciente: null,
            error: true
        };
    }
}
