import { buffer } from 'micro';
import Stripe from 'stripe';
import { handlePaymentCompleted } from '@/services/paymentEvents';


export const config = {
    api: {
        bodyParser: false, // Necesario para recibir correctamente el raw body
    },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-08-16' });

const webhookHandler = async (req, res) => {
    
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];
    let event;
    
    // Verifica la firma del webhook
    try {
        event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Manejo de eventos específicos
    try {
        switch (event.type) {
                        
            case 'payment_intent.succeeded': {
                await handlePaymentCompleted(event.data.object);
                break;
            }

            default:
                console.log(`ℹ️ Evento no manejado: ${event.type}`);
        }
    } catch (err) {
        // console.error('⚠️ Error procesando el evento:', err.message);
        return res.status(500).send(`Database Error: ${err.message}`);
    }

    // Responder con éxito a Stripe
    res.status(200).send();
};

export default webhookHandler;