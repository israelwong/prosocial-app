'use server';
import express from 'express';
import Stripe from 'stripe';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-08-16' });
const prisma = new PrismaClient();

// Configuración para procesar raw body
app.post('/api/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        // Verificar la firma del webhook
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`⚠️  Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Manejar diferentes eventos
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log(`✅ Pago exitoso: ${paymentIntent.id}`);
            // Actualiza la base de datos o envía una notificación
            await prisma.cotizacion.update({
                where: { id: paymentIntent.metadata.cotizacionId },
                data: {
                    estatus: 'PAGADA',
                    metodoPagoId: paymentIntent.metadata.metodoPagoId,
                    condicionesComercialesId: paymentIntent.metadata.condicionesComercialesId,
                    num_msi: paymentIntent.metadata.num_msi,
                    paymentIntentId: paymentIntent.id,
                },
            });
            break;

        case 'payment_intent.payment_failed':
            const failedIntent = event.data.object;
            console.error(`❌ Fallo de pago: ${failedIntent.last_payment_error?.message}`);
            // Registra el error o notifica al cliente
            break;

        case 'checkout.session.completed':
            const session = event.data.object;
            console.log(`✅ Sesión completada: ${session.id}`);
            // Procesa la orden correspondiente
            break;

        default:
            console.log(`ℹ️  Evento no manejado: ${event.type}`);
    }

    // Responder 200 para indicar que el webhook fue recibido correctamente
    res.status(200).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Webhook listening on port ${PORT}`));
