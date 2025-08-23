import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
    try {
        const { amount, cotizacionId, clienteId } = await request.json()

        console.log('🚀 CREATE-PAYMENT-INTENT CLIENTE:', {
            amount,
            cotizacionId,
            clienteId,
        })

        if (!amount || !cotizacionId || !clienteId) {
            return NextResponse.json(
                { error: 'Faltan parámetros requeridos' },
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
                { error: 'Cotización no encontrada o no autorizada' },
                { status: 404 }
            )
        }

        const cliente = cotizacion.Evento.Cliente
        const montoEnPesos = amount / 100 // Convertir de centavos a pesos

        // Crear el Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Ya viene en centavos
            currency: 'mxn',
            payment_method_types: ['card'],
            payment_method_options: {
                card: {
                    installments: {
                        enabled: true,
                    },
                },
            },
            metadata: {
                cotizacionId: cotizacion.id,
                clienteId: cliente.id,
                cliente_nombre: cliente.nombre,
                evento_id: cotizacion.Evento.id,
                monto_pesos: montoEnPesos.toString(),
            },
        })

        // Crear registro de pago en la base de datos
        const nuevoPago = await prisma.pago.create({
            data: {
                cotizacionId: cotizacion.id,
                monto: montoEnPesos,
                status: 'pendiente',
                metodo_pago: 'tarjeta',
                descripcion: `Pago parcial para ${cotizacion.nombre}`,
                concepto: `Pago para cotización ${cotizacion.nombre}`,
                stripe_payment_id: paymentIntent.id,
            },
        })

        console.log('✅ Payment Intent creado:', paymentIntent.id)
        console.log('✅ Registro de pago creado:', nuevoPago.id)

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            pagoId: nuevoPago.id,
        })

    } catch (error) {
        console.error('❌ Error al crear Payment Intent:', error)
        return NextResponse.json(
            {
                error: 'Error interno del servidor',
                message: error instanceof Error ? error.message : 'Error desconocido'
            },
            { status: 500 }
        )
    }
}
