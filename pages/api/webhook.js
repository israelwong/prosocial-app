import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-08-16' });
const prisma = new PrismaClient();

export const config = {
    api: {
        bodyParser: false,
    },
};

const webhookHandler = async (req, res) => {
    if (req.method === 'POST') {
        const buf = await buffer(req);
        const sig = req.headers['stripe-signature'];

        let event;

        try {
            event = stripe.webhooks.constructEvent(buf.toString(), sig, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        console.log('Received event:', event);

        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log('PaymentIntent was successful!');

                // Actualiza la base de datos con el payment_intent
                try {
                    await prisma.pago.updateMany({
                        where: { stripe_session_id: paymentIntent.id },
                        data: { stripe_payment_id: paymentIntent.id, status: 'succeeded' },
                    });
                } catch (err) {
                    console.error('Error updating database:', err.message);
                    return res.status(500).send(`Database Error: ${err.message}`);
                }
                break;

            case 'payment_intent.payment_failed':
                const failedIntent = event.data.object;
                console.error(`❌ Fallo de pago: ${failedIntent.last_payment_error?.message}`);
                // Registra el error o notifica al cliente
                try {
                    await prisma.cotizacion.update({
                        where: { stripe_payment_id: failedIntent.metadata.cotizacionId },
                        data: {
                            status: 'failed'
                        },
                    });
                } catch (err) {
                    console.error('Error updating database:', err.message);
                    return res.status(500).send(`Database Error: ${err.message}`);
                }
                break;

            case 'checkout.session.completed':
                const session = event.data.object;
                let status = '';
                if (session.payment_status === 'paid') {
                    status = 'completed';
                } else if (session.payment_status === 'unpaid') {
                    status = 'unpaid';
                } else {
                    status = 'failed';
                }

                // Procesa la orden correspondiente
                try {
                    await prisma.cotizacion.update({
                        where: { stripe_session_id: session.id },
                        data: {
                            status
                        },
                    });
                } catch (err) {
                    console.error('Error updating database:', err.message);
                    return res.status(500).send(`Database Error: ${err.message}`);
                }
                break;

            default:
                console.log(`ℹ️  Evento no manejado: ${event.type}`);
        }

        // Responder 200 para indicar que el webhook fue recibido correctamente
        res.status(200).send();
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
};

export default webhookHandler;