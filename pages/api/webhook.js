import { buffer } from 'micro';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY);
console.log('STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-08-16' });
const prisma = new PrismaClient();

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
                const paymentIntent = event.data.object;
                console.log('✅ PaymentIntent exitoso:', paymentIntent.id);

                // Actualizar base de datos
                await prisma.pago.updateMany({
                    where: { stripe_session_id: paymentIntent.id },
                    data: { stripe_payment_id: paymentIntent.id, status: 'succeeded' },
                });
                break;
            }

            case 'payment_intent.payment_failed': {
                const failedIntent = event.data.object;
                console.error('❌ Pago fallido:', failedIntent.last_payment_error?.message);

                // Actualizar estado en la base de datos
                await prisma.cotizacion.update({
                    where: { stripe_payment_id: failedIntent.metadata.cotizacionId },
                    data: { status: 'failed' },
                });
                break;
            }

            case 'checkout.session.completed': {
                const session = event.data.object;
                console.log('✅ Checkout session completada:', session.id);

                const status = session.payment_status === 'paid'
                    ? 'completed'
                    : session.payment_status === 'unpaid'
                    ? 'unpaid'
                    : 'failed';

                // Actualizar la cotización correspondiente
                await prisma.cotizacion.update({
                    where: { stripe_session_id: session.id },
                    data: { status },
                });
                break;
            }

            default:
                console.log(`ℹ️ Evento no manejado: ${event.type}`);
        }
    } catch (err) {
        console.error('⚠️ Error procesando el evento:', err.message);
        return res.status(500).send(`Database Error: ${err.message}`);
    }

    // Responder con éxito a Stripe
    res.status(200).send();
};

export default webhookHandler;