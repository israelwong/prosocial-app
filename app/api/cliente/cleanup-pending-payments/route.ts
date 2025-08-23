import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        const { horasAtras = 1 } = await request.json()

        console.log('🧹 LIMPIEZA AUTOMÁTICA DE PAGOS PENDIENTES')
        console.log(`⏰ Eliminando pagos pendientes de más de ${horasAtras} hora(s)`)

        // Calcular fecha límite
        const fechaLimite = new Date()
        fechaLimite.setHours(fechaLimite.getHours() - horasAtras)

        // Buscar pagos pendientes antiguos
        const pagosAEliminar = await prisma.pago.findMany({
            where: {
                status: 'pending',
                createdAt: {
                    lt: fechaLimite
                }
            },
            select: {
                id: true,
                stripe_payment_id: true,
                monto: true,
                createdAt: true,
                Cotizacion: {
                    select: {
                        nombre: true
                    }
                }
            }
        })

        console.log(`📊 Pagos pendientes antiguos encontrados: ${pagosAEliminar.length}`)

        if (pagosAEliminar.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No hay pagos pendientes antiguos para limpiar',
                eliminados: 0
            })
        }

        // Eliminar pagos pendientes antiguos
        const resultado = await prisma.pago.deleteMany({
            where: {
                status: 'pending',
                createdAt: {
                    lt: fechaLimite
                }
            }
        })

        console.log(`✅ Pagos pendientes antiguos eliminados: ${resultado.count}`)

        // Log de pagos eliminados
        pagosAEliminar.forEach(pago => {
            console.log(`🗑️ Eliminado: ${pago.stripe_payment_id} - $${pago.monto} - ${pago.Cotizacion?.nombre}`)
        })

        return NextResponse.json({
            success: true,
            message: `${resultado.count} pagos pendientes antiguos eliminados correctamente`,
            eliminados: resultado.count,
            horasAtras,
            fechaLimite: fechaLimite.toISOString()
        })

    } catch (error) {
        console.error('❌ Error en limpieza automática:', error)
        return NextResponse.json({
            error: 'Error interno del servidor',
            details: error instanceof Error ? error.message : 'Error desconocido',
        }, { status: 500 })
    }
}
