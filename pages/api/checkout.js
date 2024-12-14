'use server'
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-08-16' });

export default async function handler(req, res) {
    try {
        const monto = req.body.monto;
        const concepto = req.body.concepto;
        const descripcion = req.body.descripcion;
        const metodoPago = req.body.paymentMethod;
        const num_msi = parseInt(req.body.num_msi, 10);
        const cotizacionId = req.body.cotizacionId;
        const condicionesComercialesId = req.body.condicionesComercialesId;
        const metodoPagoId = req.body.metodoPagoId;

        const clienteId = req.body.clienteId;
        const nombreCliente = req.body.nombreCliente;
        const emailCliente = req.body.emailCliente; 
        const telefonoCliente = req.body.telefonoCliente;

        //! Crear objeto sesión de pago
        let sessionParams = {
            payment_method_types: [],
            line_items: [
                {
                    price_data: {
                        currency: 'mxn',
                        product_data: {
                            name: concepto,
                            description: descripcion,
                        },
                        unit_amount: Math.round(monto * 100), // Monto en centavos
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            //endirección solo si paga con tarjeta
            success_url: `${req.headers.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/cotizacion/${cotizacionId}`,
        };

        //! Configurar el método de pago
        if (metodoPago === 'spei') {

            const customer = await stripe.customers.create(
                {
                    name: nombreCliente,
                    email: emailCliente,
                    phone: telefonoCliente,
                    metadata: {
                        clienteId,
                        cotizacionId,
                        concepto
                    },
                }
            );

            sessionParams.customer = customer.id;
            sessionParams.payment_method_types  = ['customer_balance'];
            sessionParams.payment_method_options ={    
                customer_balance: {      
                    funding_type: 'bank_transfer',
                    bank_transfer: {
                        type: 'mx_bank_transfer',      
                    }
                }
            };

        // } else if (metodoPago === 'oxxo') {
        //     sessionParams.payment_method_types = ['oxxo'];

        } 
        else if (metodoPago === 'card') {

            sessionParams.payment_method_types = ['card'];

            if (num_msi > 0) {
                if ([3, 6, 9, 12].includes(num_msi)) {
                    console.log('Pago con tarjeta a MSI');
                    sessionParams.payment_method_options = {
                        card: {
                            installments: {
                                enabled: true, // Habilita MSI automáticamente
                            },
                        },
                    };
                } else {
                    throw new Error('Número de MSI no soportado. Debe ser 3, 6, 9 o 12.');
                }
            }
        } else {
            throw new Error('Método de pago no soportado.');
        }

        const session = await stripe.checkout.sessions.create(sessionParams);
        
        //! Guardar el pago en la base de datos usando Prisma
        await prisma.pago.create({
            data: {
                cotizacionId,
                condicionesComercialesId,
                condicionesComercialesMetodoPagoId: metodoPagoId,
                metodo_pago: metodoPago,
                monto,
                concepto,
                descripcion,
                stripe_session_id: session.id,
                stripe_payment_id: session.payment_intent ? session.payment_intent : null,
                status: 'pending',
            },
        });        

        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error('Error processing request body:', error);
        return res.status(400).json({ error: 'Invalid request body', details: error.message });
    }
}