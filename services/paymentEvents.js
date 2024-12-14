// services/paymentEvents.js
import { PrismaClient } from '@prisma/client';
import sendMail from './sendmail';

const prisma = new PrismaClient();

export async function handlePaymentCompleted(paymentIntent) {

    const pago = await prisma.pago.findFirst({
        where: { stripe_payment_intent_id: paymentIntent.id },
    });

    if (!pago) return;

    const cliente = await prisma.cliente.findFirst({
        where: { id: pago.clienteId },
    });

    if (!cliente) return;

    if (pago.cotizacionId) {
        const cotizacion = await prisma.cotizacion.findFirst({
            where: { id: pago.cotizacionId },
        });

        if (cotizacion.status !== 'aprobada') {
            
            // Aprobar cotización y actualizar el pago
            await prisma.cotizacion.update({
                where: { id: cotizacion.id },
                data: { status: 'aprobada' },
            });

            // Enviar correo de bienvenida con contrato
            await sendMail({
                to: cliente.email,
                subject: '¡Bienvenido!',
                template: 'welcome',
                data: {
                    cliente,
                    contrato: cotizacion.contrato,
                },
            });
        }
    }

    // Acreditar el pago
    await prisma.pago.update({
        where: { id: pago.id },
        data: { status: 'completed' },
    });

    // Calcular balance total
    const pagos = await prisma.pago.findMany({
        where: { clienteId: cliente.id, status: 'completed' },
    });

    const balance = pagos.reduce((total, pago) => total + pago.monto, 0);

    // Enviar correo de notificación de pago
    await sendMail({
        to: cliente.email,
        subject: 'Pago recibido',
        template: 'paymentSuccess',
        data: {
            cliente,
            balance,
            pago,
        },
    });
}
