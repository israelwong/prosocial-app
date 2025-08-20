import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/app/admin/_lib/prismaClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
    try {
        const {
            cotizacionId,
            monto,
            clienteEmail,
            clienteNombre,
            eventoNombre
        } = await request.json();

        if (!cotizacionId || !monto || monto <= 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Datos de pago inválidos'
                },
                { status: 400 }
            );
        }

        // Verificar que la cotización existe y está aprobada
        const cotizacion = await prisma.cotizacion.findUnique({
            where: {
                id: cotizacionId,
                status: 'aprobada'
            },
            include: {
                Pago: {
                    where: {
                        status: 'succeeded'
                    },
                    select: {
                        monto: true
                    }
                }
            }
        });

        if (!cotizacion) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Cotización no encontrada o no está aprobada'
                },
                { status: 404 }
            );
        }

        // Verificar que el monto no exceda el saldo pendiente
        const totalPagado = cotizacion.Pago?.reduce((sum: number, pago: any) => sum + pago.monto, 0) || 0;
        const saldoPendiente = cotizacion.precio - totalPagado;

        if (monto > saldoPendiente) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'El monto excede el saldo pendiente'
                },
                { status: 400 }
            );
        }

        // Crear sesión de Stripe Checkout
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'mxn',
                        product_data: {
                            name: `Pago para ${eventoNombre}`,
                            description: `Abono de ${new Intl.NumberFormat('es-MX', {
                                style: 'currency',
                                currency: 'MXN'
                            }).format(monto)} para el evento ${eventoNombre}`,
                        },
                        unit_amount: Math.round(monto * 100), // Stripe requiere centavos
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            customer_email: clienteEmail,
            metadata: {
                cotizacionId,
                clienteNombre,
                eventoNombre,
                tipo: 'abono_cliente'
            },
            success_url: `${request.nextUrl.origin}/cliente-portal/pago/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${request.nextUrl.origin}/cliente-portal/pago/${cotizacionId}`,
        });

        return NextResponse.json({
            success: true,
            sessionId: session.id,
            sessionUrl: session.url
        });

    } catch (error) {
        console.error('Error al crear sesión de pago:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error al procesar el pago'
            },
            { status: 500 }
        );
    }
}
