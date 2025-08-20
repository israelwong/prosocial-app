import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/app/admin/_lib/prismaClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID de sesión requerido'
        },
        { status: 400 }
      );
    }

    // Obtener información de la sesión de Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        {
          success: false,
          message: 'El pago no fue completado'
        },
        { status: 400 }
      );
    }

    const cotizacionId = session.metadata?.cotizacionId;
    const monto = session.amount_total ? session.amount_total / 100 : 0; // Convertir de centavos

    if (!cotizacionId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Información de cotización no encontrada'
        },
        { status: 400 }
      );
    }

    // Verificar si el pago ya fue registrado
    const existingPayment = await prisma.pago.findUnique({
      where: {
        stripe_session_id: sessionId
      }
    });

    let pago = existingPayment;

    if (!existingPayment) {
      // Registrar el pago en la base de datos
      const cotizacion = await prisma.cotizacion.findUnique({
        where: { id: cotizacionId },
        include: {
          Evento: {
            include: {
              Cliente: true
            }
          }
        }
      });

      if (!cotizacion) {
        return NextResponse.json(
          {
            success: false,
            message: 'Cotización no encontrada'
          },
          { status: 404 }
        );
      }

      pago = await prisma.pago.create({
        data: {
          clienteId: cotizacion.Evento.clienteId,
          cotizacionId: cotizacionId,
          metodo_pago: 'stripe',
          monto: monto,
          concepto: 'Abono de cliente',
          descripcion: `Pago de ${session.metadata?.clienteNombre} para ${session.metadata?.eventoNombre}`,
          stripe_session_id: sessionId,
          stripe_payment_id: session.payment_intent as string,
          status: 'succeeded',
          tipo_transaccion: 'ingreso',
          categoria_transaccion: 'abono'
        }
      });
    }

    // Obtener información del evento
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      include: {
        Evento: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      payment: {
        success: true,
        monto: monto,
        eventoNombre: cotizacion?.Evento.nombre || 'Evento',
        cotizacionId: cotizacion?.Evento.id || '',
        paymentId: pago?.id || 'unknown'
      }
    });

  } catch (error) {
    console.error('Error al verificar pago:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al verificar el pago'
      },
      { status: 500 }
    );
  }
}
