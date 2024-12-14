import { buffer } from 'micro';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

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

    // Manejo de eventos específicos
    try {
        switch (event.type) {
            

            // case 'payment_intent.payment_failed': {
            //     const failedIntent = event.data.object;
            //     console.error('❌ Pago fallido:', failedIntent.last_payment_error?.message);

            //     // Actualizar estado en la base de datos
            //     await prisma.cotizacion.update({
            //         where: { stripe_session_id: failedIntent.metadata.cotizacionId },
            //         data: { status: 'failed' },
            //     });
            //     break;
            // }

            case 'checkout.session.completed': {
                
                break;
            }

            case 'payment_intent.succeeded': {


                const session = event.data.object;

                const status = session.payment_status === 'paid'
                    ? 'completed'
                    : session.payment_status === 'unpaid'
                    ? 'unpaid'
                    : 'failed';

                // Obtener el pago correspondiente
                const pago = await prisma.pago.findFirst({
                    where: { stripe_session_id: session.id },
                });

                if (pago) {

                    // Actualizar el pago
                    await prisma.pago.update({
                        where: { id: pago.id },
                        data: { status },
                    });

                    // Actualizar la cotización
                    if (status === 'completed') {
                        await prisma.cotizacion.update({
                            where: { id: pago.cotizacionId },
                            data: { status: 'aprobada' },
                        });
                    }
                }
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