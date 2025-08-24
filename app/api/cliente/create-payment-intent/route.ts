import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
})

export async function POST(request: NextRequest) {
    try {
        const { cotizacionId, metodoPago, montoBase, montoConComision, eventoId } = await request.json()

        console.log('🚀 CREATE-PAYMENT-INTENT CLIENTE')
        console.log('📊 Datos recibidos:', {
            cotizacionId,
            metodoPago,
            montoBase, // 🆕 Monto que se abona al cliente
            montoConComision, // 🆕 Monto que se cobra en Stripe
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
        const montoAbonoCliente = Number(montoBase) // 🆕 Monto que se abona al cliente
        const montoCobroStripe = Number(montoConComision) // 🆕 Monto que se cobra en Stripe
        const comisionCalculada = metodoPago === 'spei' ? 0 : (montoCobroStripe - montoAbonoCliente) // 🧮 Calcular comisión
        const montoFinalEnCentavos = Math.round(montoCobroStripe * 100)

        console.log('💰 Detalles del pago cliente:', {
            montoAbonoCliente, // 🆕 Lo que se abona al cliente
            montoCobroStripe, // 🆕 Lo que cobra Stripe
            comisionCalculada, // 🆕 Comisión calculada
            centavos: montoFinalEnCentavos,
            metodoPago,
            cliente: cotizacion.Evento?.Cliente?.nombre,
        })

        // 🚨 VALIDACIÓN: Verificar que los cálculos sean coherentes
        if (metodoPago !== 'spei' && (montoAbonoCliente + comisionCalculada) !== montoCobroStripe) {
            console.error('❌ ERROR: Inconsistencia en cálculos de comisión', {
                montoAbonoCliente,
                comisionCalculada,
                suma: montoAbonoCliente + comisionCalculada,
                montoCobroStripe
            })
            return NextResponse.json({
                error: 'Error en cálculo de comisiones'
            }, { status: 400 })
        }

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
                monto_abono_cliente: montoAbonoCliente.toString(), // 🆕 Monto que se abona al cliente
                monto_cobro_stripe: montoCobroStripe.toString(), // 🆕 Monto que se cobra en Stripe
                comision_stripe: comisionCalculada.toString(), // 🆕 Comisión calculada para webhook
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
            `✅ Payment Intent cliente creado: ${paymentIntent.id} por $${montoCobroStripe.toFixed(2)} MXN (Stripe) / $${montoAbonoCliente.toFixed(2)} MXN (Abono) - ${metodoPago || 'card'}`
        )

        // 5. 📝 Crear registro de pago en BD para que el webhook lo encuentre
        // 🚨 IMPORTANTE: Registramos el monto de ABONO, no el de Stripe

        const pagoData: any = {
            clienteId: cotizacion.Evento?.Cliente?.id || '',
            cotizacionId: cotizacion.id,
            monto: parseFloat(montoAbonoCliente.toFixed(2)), // 🎯 Monto que se abona al cliente (2 decimales)
            comisionStripe: parseFloat(comisionCalculada.toFixed(2)), // 🆕 Comisión de Stripe (2 decimales)
            metodo_pago: metodoPago || 'card',
            concepto: `Pago cliente - ${cotizacion.nombre}`,
            descripcion: `Abono: $${montoAbonoCliente.toFixed(2)} | Comisión: $${comisionCalculada.toFixed(2)}`, // 🎯 Descripción limpia para cliente
            stripe_payment_id: paymentIntent.id,
            status: 'pending', // El webhook lo cambiará a 'paid'
        }

        await prisma.pago.create({
            data: pagoData
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
