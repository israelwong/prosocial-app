'use server'

import prisma from '@/app/admin/_lib/prismaClient'

/**
 * Obtiene métodos de pago disponibles para clientes (Server Action)
 * Restricción: Solo tarjetas de crédito/débito y SPEI (no MSI para clientes)
 */
export async function obtenerMetodosPagoCliente() {
    try {
        const metodos = await prisma.metodoPago.findMany({
            where: {
                // Filtrar solo métodos permitidos para clientes
                payment_method: {
                    in: ['card', 'spei'] // Solo tarjetas y SPEI para clientes
                },
                // Excluir MSI para clientes
                OR: [
                    { num_msi: null },
                    { num_msi: 0 },
                    { num_msi: { lte: 1 } },
                    { payment_method: 'spei' } // SPEI siempre permitido
                ]
            },
            orderBy: {
                orden: 'asc'
            },
            select: {
                id: true,
                metodo_pago: true,
                num_msi: true,
                orden: true,
                comision_porcentaje_base: true,
                comision_fija_monto: true,
                comision_msi_porcentaje: true,
                payment_method: true
            }
        })

        // Filtrar adicional para asegurar que no hay MSI para clientes
        const metodosCliente = metodos.filter(metodo => {
            // SPEI siempre permitido
            if (metodo.payment_method === 'spei') {
                return true
            }
            // Para tarjetas: solo sin MSI o MSI <= 1
            return metodo.num_msi === null || metodo.num_msi === 0 || metodo.num_msi <= 1
        })

        console.log('✅ Métodos de pago para cliente obtenidos (sin MSI):', {
            cantidad: metodosCliente.length,
            metodos: metodosCliente.map(m => ({
                nombre: m.metodo_pago,
                payment_method: m.payment_method,
                msi: m.num_msi,
                tipo: m.payment_method === 'spei' ? 'SPEI' : 'TARJETA'
            }))
        })

        return {
            success: true,
            metodos: metodosCliente
        }
    } catch (error) {
        console.error('❌ Error al obtener métodos de pago:', error)
        return {
            success: false,
            message: 'Error al cargar métodos de pago',
            metodos: []
        }
    }
}
