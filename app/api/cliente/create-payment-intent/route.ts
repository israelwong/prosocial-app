import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
})

export async function POST(request: NextRequest) {
    try {
        const { cotizacionId, metodoPago, montoConComision, eventoId } = await request.json()

        console.log('🚀 CREATE-PAYMENT-INTENT CLIENTE')
        console.log('📊 Datos recibidos:', {
            cotizacionId,
            metodoPago,
            montoConComision,
            eventoId
        })

        if (!cotizacionId || !eventoId) {
            return NextResponse.json({
                error: 'cotizacionId y eventoId son requeridos.'
            }, { status: 400 })
        }

        // 1. 🔍 Obtener cotización y evento
        const cotizacion = await prisma.cotizacion.findUnique({
            where: { id: cotizacionId },
            include: {
                Evento: {
                    include: {
                        Cliente: true,
                    },
                },
            },
        })

        if (!cotizacion) {
            console.error('❌ Cotización no encontrada:', { cotizacionId })
            return NextResponse.json({
                error: 'Cotización no encontrada.'
            }, { status: 404 })
        }

        // Verificar que la cotización pertenece al evento
        if (cotizacion.eventoId !== eventoId) {
            console.error('❌ Cotización no pertenece al evento:', { cotizacionId, eventoId })
            return NextResponse.json({
                error: 'Cotización no válida para este evento.'
            }, { status: 403 })
        }

        // 2. 🧮 Cálculo de montos
        const montoBase = Number(montoConComision)
        const montoFinalEnCentavos = Math.round(montoBase * 100)

        console.log('💰 Detalles del pago cliente:', {
            montoBase,
            centavos: montoFinalEnCentavos,
            metodoPago,
            cliente: cotizacion.Evento?.Cliente?.nombre,
        })

        // 3. 🎯 Configurar Payment Intent
        let paymentIntentData: any = {
            amount: montoFinalEnCentavos,
            currency: 'mxn',
            metadata: {
                cotizacionId: cotizacion.id,
                cliente_nombre: cotizacion.Evento?.Cliente?.nombre || '',
                evento_id: cotizacion.Evento?.id || '',
                evento_fecha: cotizacion.Evento?.fecha_evento ?
                    Math.floor(new Date(cotizacion.Evento.fecha_evento).getTime() / 1000).toString() : '',
                metodo_pago: metodoPago || 'card',
                source: 'cliente', // 🎯 Identificador para el webhook
            },
        }

        // 🔄 Configuración por método de pago
        if (metodoPago === 'spei') {
            const cliente = cotizacion.Evento?.Cliente
            if (!cliente) {
                return NextResponse.json({
                    error: 'Cliente no encontrado para SPEI'
                }, { status: 400 })
            }

            const customer = await stripe.customers.create({
                name: cliente.nombre,
                email: cliente.email || 'cliente@example.com',
                metadata: {
                    cotizacion_id: cotizacion.id,
                    evento_id: cotizacion.Evento?.id || '',
                },
            })

            paymentIntentData.customer = customer.id
            paymentIntentData.payment_method_types = ['customer_balance']
            paymentIntentData.payment_method_data = {
                type: 'customer_balance',
            }
            paymentIntentData.payment_method_options = {
                customer_balance: {
                    funding_type: 'bank_transfer',
                    bank_transfer: {
                        type: 'mx_bank_transfer',
                    },
                },
            }
        } else {
            // Para tarjetas
            paymentIntentData.payment_method_types = ['card']
            paymentIntentData.payment_method_options = {
                card: {
                    installments: {
                        enabled: true,
                    },
                },
            }
        }

        // 4. 💎 Crear Payment Intent
        const paymentIntent = await stripe.paymentIntents.create(paymentIntentData)

        console.log(
            `✅ Payment Intent cliente creado: ${paymentIntent.id} por $${montoBase.toFixed(2)} MXN (${metodoPago || 'card'})`
        )

        // 5. � Crear registro de pago en BD para que el webhook lo encuentre
        await prisma.pago.create({
            data: {
                clienteId: cotizacion.Evento?.Cliente?.id || '',
                cotizacionId: cotizacion.id,
                monto: montoBase,
                metodo_pago: metodoPago || 'card',
                concepto: `Pago cliente - ${cotizacion.nombre}`,
                descripcion: `Payment Intent: ${paymentIntent.id}`,
                stripe_payment_id: paymentIntent.id,
                status: 'pending', // El webhook lo cambiará a 'paid'
            }
        })

        console.log(`📝 Registro de pago creado en BD para Payment Intent: ${paymentIntent.id}`)

        // 6. 📤 Respuesta
        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            montoFinal: montoBase,
            metodoPago: metodoPago || 'card',
            cotizacion: {
                id: cotizacion.id,
                nombre: cotizacion.nombre,
                cliente: cotizacion.Evento?.Cliente?.nombre || '',
            },
            // 🎯 URLs de respuesta para cliente
            redirectUrls: {
                success: `/cliente/evento/${eventoId}/pago/${cotizacionId}/success?payment_intent=${paymentIntent.id}`,
                error: `/cliente/evento/${eventoId}/pago/${cotizacionId}/error`,
                pending: `/cliente/evento/${eventoId}/pago/${cotizacionId}/pending?payment_intent=${paymentIntent.id}`
            }
        })

    } catch (error) {
        console.error('❌ Error al crear Payment Intent cliente:', error)
        return NextResponse.json({
            error: 'Error interno del servidor',
            details: error instanceof Error ? error.message : 'Error desconocido',
        }, { status: 500 })
    }
}
