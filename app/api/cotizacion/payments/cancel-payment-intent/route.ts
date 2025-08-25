import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
})

export async function POST(request: NextRequest) {
    try {
        const { paymentIntentId } = await request.json()

        console.log('🗑️ CANCELAR PAYMENT INTENT COTIZACIONES (App Router)')
        console.log('📊 Payment Intent a cancelar:', paymentIntentId)

        if (!paymentIntentId) {
            return NextResponse.json({
                error: 'paymentIntentId es requerido.'
            }, { status: 400 })
        }

        try {
            // 1. 🚫 Cancelar Payment Intent en Stripe (si es posible)
            const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId)
            console.log(`✅ Payment Intent cancelado en Stripe: ${paymentIntent.id}`)
        } catch (stripeError: any) {
            // Si ya fue procesado o no se puede cancelar, continuar con la limpieza de BD
            console.log(`⚠️ No se pudo cancelar en Stripe (${stripeError.message}), procediendo con limpieza de BD`)
        }

        // 2. 🗑️ Eliminar registro de pago de la BD
        const pagoEliminado = await prisma.pago.deleteMany({
            where: {
                stripe_payment_id: paymentIntentId,
                status: 'pending' // Solo eliminar si aún está pendiente
            }
        })

        if (pagoEliminado.count > 0) {
            console.log(`🗑️ Registro de pago eliminado de BD: ${paymentIntentId}`)
        } else {
            console.log(`ℹ️ No se encontró registro pendiente para eliminar: ${paymentIntentId}`)
        }

        return NextResponse.json({
            success: true,
            message: 'Payment Intent cancelado y limpiado correctamente',
            paymentIntentId,
            registrosEliminados: pagoEliminado.count
        })

    } catch (error) {
        console.error('❌ Error al cancelar Payment Intent cotizaciones:', error)
        return NextResponse.json({
            error: 'Error interno del servidor',
            details: error instanceof Error ? error.message : 'Error desconocido',
        }, { status: 500 })
    }
}
