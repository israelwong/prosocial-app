import { buffer } from 'micro';
import Stripe from 'stripe';
import { handlePaymentCompleted } from '../../services/paymentEvents';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-08-16' });

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

    // Verifica la firma del webhook
    try {
        event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('⚠️ Error verificando el webhook:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Manejo de eventos específicos de Stripe
    try {
        switch (event.type) {
            case 'payment_intent.succeeded': {
                console.log('✅ Sesión de pago completada:', session.data.object);
                res.status(200).send('Sesión de pago completada');
                await handlePaymentCompleted(event.data.object, res);
                break;
            }
            
            case 'payment_intent.payment_failed': {
                const failedIntent = event;
                console.error('❌ Pago fallido:', failedIntent.last_payment_error?.message);
                res.status(200).send('Pago fallido');
                await handlePaymentCompleted(event.data.object, res);
                break;
            }

            case 'checkout.session.completed': {
                const session = event;
                console.log('✅ Sesión de pago completada:', session);
                // res.status(200).send('Sesión de pago enviada a handlePaymentCompleted');
                await handlePaymentCompleted(event.data.object, res);
                break;
            }

            default:
                res.status(400).send(`Event type ${event.type} not yet handled`);
                console.warn(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });

    } catch (err) {
        // console.error(`Error handling event: ${err.message}`);
        res.status(500).send(`Server Error: ${err.message}`);
    }
};

export default webhookHandler;