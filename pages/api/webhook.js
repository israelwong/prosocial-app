import { buffer } from 'micro';
import Stripe from 'stripe';
// import { PrismaClient } from '@prisma/client';
import { handlePaymentCompleted } from '../../services/paymentEvents';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-08-16' });
// const prisma = new PrismaClient();

export const config = {
    api: {
        bodyParser: false, // Necesario para recibir correctamente el raw body
    },
};

const webhookHandler = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    let event;
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];

    try {
        // Verifica la firma del webhook
        event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('⚠️ Error verificando el webhook:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('✔️ Evento recibido:', event.type);

    // Manejo de eventos específicos
    try {
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const session = event.data.object;
                console.log('✅ Sesión de pago completada:', session);
                await handlePaymentCompleted(event.data.object);
                break;
            }
            
            case 'payment_intent.payment_failed': {
                const failedIntent = event.data.object;
                console.error('❌ Pago fallido:', failedIntent.last_payment_error?.message);
                await handlePaymentCompleted(event.data.object);
                break;
            }

            case 'checkout.session.completed': {
                const session = event.data.object;
                console.log('✅ Sesión de pago completada:', session);
                await handlePaymentCompleted(event.data.object);
                break;
            }

            default:
                console.warn(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    } catch (err) {
        console.error(`Error handling event: ${err.message}`);
        res.status(500).send(`Server Error: ${err.message}`);
    }
};

export default webhookHandler;