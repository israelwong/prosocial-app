import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import prisma from '@/app/admin/_lib/prismaClient'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            cotizacionId,
            clienteId,
            metodoPago,
            montoConComision,
            nombreCliente,
            emailCliente,
            telefonoCliente
        } = body

        console.log('🚀 Cliente Payment Intent - Datos recibidos:', {
            cotizacionId,
            clienteId,
            metodoPago,
            montoConComision,
            nombreCliente
        })

        // Validaciones básicas
        if (!cotizacionId || !clienteId || !metodoPago || !montoConComision) {
            return NextResponse.json(
                { error: 'Faltan parámetros requeridos' },
                { status: 400 }
            )
        }

        if (montoConComision <= 0) {
            return NextResponse.json(
                { error: 'El monto debe ser mayor a 0' },
                { status: 400 }
            )
        }

        // Verificar que la cotización pertenece al cliente
        const cotizacion = await prisma.cotizacion.findFirst({
            where: {
                id: cotizacionId,
                Evento: {
                    clienteId: clienteId
                }
            },
            include: {
                Evento: {
                    include: {
                        Cliente: true
                    }
                }
            }
        })

        if (!cotizacion) {
            return NextResponse.json(
                { error: 'Cotización no encontrada o no pertenece al cliente' },
                { status: 404 }
            )
        }

        // Configurar parámetros del Payment Intent
        const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
            amount: Math.round(montoConComision * 100), // Convertir a centavos
            currency: 'mxn',
            automatic_payment_methods: {
                enabled: false // Vamos a especificar manualmente
            },
            metadata: {
                cotizacionId,
                clienteId,
                metodoPago,
                isClientPortal: 'true',
                eventoId: cotizacion.Evento.id,
                clienteNombre: nombreCliente || cotizacion.Evento.Cliente.nombre
            },
            description: `Pago cliente - Cotización ${cotizacionId}`,
        }

        // Configurar método de pago específico
        if (metodoPago === 'spei') {
            // Para SPEI: crear customer y configurar customer_balance
            const customer = await stripe.customers.create({
                name: nombreCliente || cotizacion.Evento.Cliente.nombre,
                email: emailCliente || cotizacion.Evento.Cliente.email,
                phone: telefonoCliente || cotizacion.Evento.Cliente.telefono,
                metadata: {
                    clienteId,
                    cotizacionId,
                    metodoPago: 'spei'
                }
            })

            paymentIntentParams.customer = customer.id
            paymentIntentParams.payment_method_types = ['customer_balance']
            paymentIntentParams.payment_method_options = {
                customer_balance: {
                    funding_type: 'bank_transfer',
                    bank_transfer: {
                        type: 'mx_bank_transfer'
                    }
                }
            }

            console.log('🏦 SPEI Payment Intent configurado para cliente')
        } else if (metodoPago === 'card') {
            // Para tarjetas: configuración simple sin MSI
            paymentIntentParams.payment_method_types = ['card']
            paymentIntentParams.payment_method_options = {
                card: {
                    // No MSI para clientes - solo pago único
                    installments: {
                        enabled: false
                    }
                }
            }

            console.log('💳 Card Payment Intent configurado para cliente (sin MSI)')
        } else {
            return NextResponse.json(
                { error: `Método de pago '${metodoPago}' no soportado para clientes` },
                { status: 400 }
            )
        }

        // Crear el Payment Intent
        const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams)

        console.log('✅ Payment Intent creado exitosamente:', {
            paymentIntentId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret ? '***GENERADO***' : 'ERROR',
            amount: paymentIntent.amount,
            metodoPago,
            clienteId
        })

        // Opcional: Guardar el registro del pago en la base de datos
        try {
            await prisma.pago.create({
                data: {
                    clienteId,
                    cotizacionId,
                    monto: montoConComision,
                    metodo_pago: metodoPago,
                    concepto: `Pago cliente - Cotización ${cotizacionId}`,
                    descripcion: `Payment Intent: ${paymentIntent.id}`,
                    stripe_payment_id: paymentIntent.id,
                    status: 'pending'
                }
            })
            console.log('📝 Registro de pago creado en BD')
        } catch (dbError) {
            console.error('⚠️ Error al crear registro en BD (continuando):', dbError)
            // No fallar el pago por error de BD
        }

        return NextResponse.json({
            success: true,
            paymentIntentId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
            metodoPago,
            montoFinal: montoConComision,
            customerId: metodoPago === 'spei' ? paymentIntentParams.customer : null
        })

    } catch (error) {
        console.error('❌ Error en create-payment-intent-cliente:', error)

        return NextResponse.json(
            {
                error: 'Error interno del servidor',
                details: error instanceof Error ? error.message : 'Error desconocido'
            },
            { status: 500 }
        )
    }
}
