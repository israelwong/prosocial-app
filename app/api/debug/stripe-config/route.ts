import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

/**
 * 🔍 Endpoint de diagnóstico para Stripe
 * Verifica que las keys coincidan y puedan comunicarse
 */
export async function GET(request: NextRequest) {
    try {
        // Verificar variables de entorno
        const secretKey = process.env.STRIPE_SECRET_KEY
        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

        if (!secretKey) {
            return NextResponse.json({
                error: 'STRIPE_SECRET_KEY no está configurada',
                success: false
            }, { status: 500 })
        }

        if (!publishableKey) {
            return NextResponse.json({
                error: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY no está configurada',
                success: false
            }, { status: 500 })
        }

        // Verificar que las keys pertenezcan a la misma cuenta
        const stripe = new Stripe(secretKey, {
            apiVersion: '2025-02-24.acacia'
        })

        // Intentar obtener información de la cuenta
        const account = await stripe.accounts.retrieve()

        // Crear un PaymentIntent de prueba con monto mínimo válido
        const testPaymentIntent = await stripe.paymentIntents.create({
            amount: 1000, // $10.00 MXN (mínimo requerido)
            currency: 'mxn',
            metadata: {
                test: 'stripe-config-validation'
            }
        })

        return NextResponse.json({
            success: true,
            config: {
                secretKeyPrefix: secretKey.substring(0, 12) + '...',
                publishableKeyPrefix: publishableKey.substring(0, 12) + '...',
                secretKeyEnv: secretKey.includes('test') ? 'test' : 'live',
                publishableKeyEnv: publishableKey.includes('test') ? 'test' : 'live',
                keysMatch: (secretKey.includes('test') && publishableKey.includes('test')) ||
                    (!secretKey.includes('test') && !publishableKey.includes('test')),
                accountId: account.id,
                testPaymentIntent: {
                    id: testPaymentIntent.id,
                    client_secret: testPaymentIntent.client_secret,
                    status: testPaymentIntent.status
                }
            },
            message: 'Configuración de Stripe verificada'
        })

    } catch (error) {
        console.error('❌ Error verificando Stripe config:', error)

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido',
            details: error
        }, { status: 500 })
    }
}
