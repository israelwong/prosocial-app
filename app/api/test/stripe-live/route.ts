import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

/**
 * 🔍 Test simple de configuración Stripe LIVE
 * Solo verifica la conexión sin crear PaymentIntents
 */
export async function GET(request: NextRequest) {
    try {
        const secretKey = process.env.STRIPE_SECRET_KEY
        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

        if (!secretKey || !publishableKey) {
            return NextResponse.json({
                success: false,
                error: 'Claves de Stripe no configuradas'
            }, { status: 500 })
        }

        // Inicializar Stripe
        const stripe = new Stripe(secretKey, {
            apiVersion: '2025-02-24.acacia'
        })

        // Solo verificar la cuenta, sin crear PaymentIntent
        const account = await stripe.accounts.retrieve()

        return NextResponse.json({
            success: true,
            environment: secretKey.includes('test') ? 'TEST' : 'LIVE',
            accountId: account.id,
            businessProfile: account.business_profile?.name || 'Sin nombre',
            country: account.country,
            currency: account.default_currency,
            keysMatch: secretKey.includes('live') && publishableKey.includes('live'),
            message: '✅ Configuración LIVE funcionando correctamente'
        })

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            type: error.type
        }, { status: 500 })
    }
}
