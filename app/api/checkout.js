import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-08-16' });

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { quoteId, conditionId, amount } = req.body;

        if (!quoteId || !conditionId || !amount) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Crear sesión de pago
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'mxn',
                        product_data: {
                            name: `Pago de cotización #${quoteId}`,
                            description: `Condición Comercial: ${conditionId}`,
                        },
                        unit_amount: Math.round(amount * 100), // Stripe maneja montos en centavos
                    },
                    quantity: 1,
                },
            ],
            success_url: `https://www.prosocial.mx/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `https://www.prosocial.mx/checkout/cancel`,
        });

        return res.status(200).json({ url: session.url });
    } catch (error) {
        console.error('Error al crear sesión:', error);
        return res.status(500).json({ error: 'Error creating Stripe session' });
    }
}