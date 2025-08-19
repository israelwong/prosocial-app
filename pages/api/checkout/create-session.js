'use server'
// import prisma from './prismaClient';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-08-16' });

export default async function handler(req, res) {
    try {
        // Obtener parámetros de la query string (GET) o del body (POST)
        const isGET = req.method === 'GET';
        const data = isGET ? req.query : req.body;

        const monto = parseFloat(data.montoFinal || data.monto);
        const concepto = data.concepto;
        const descripcion = data.descripcion;
        const metodoPago = data.paymentMethod;
        const num_msi = parseInt(data.num_msi, 10) || 0;
        const cotizacionId = data.cotizacionId;
        
        const condicionesComercialesId = data.condicionesComercialesId;
        const metodoPagoId = data.metodoPagoId;

        const clienteId = data.clienteId;
        const nombreCliente = data.nombreCliente;
        const emailCliente = data.emailCliente; 
        const telefonoCliente = data.telefonoCliente;

        const precioFinal = parseFloat(data.precioFinal || data.montoFinal);

        // Debug: Información del pago
        console.log('💳 CREATE-SESSION API - Datos recibidos:', {
            metodo: req.method,
            metodoPago,
            num_msi,
            monto,
            precioFinal,
            cotizacionId,
            metodoPagoId
        });

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
            //redirección solo si paga con tarjeta
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
                    console.log(`🔧 Configurando pago con tarjeta a ${num_msi} MSI específicos`);
                    sessionParams.payment_method_options = {
                        card: {
                            installments: {
                                enabled: true,
                                plan: {
                                    count: num_msi, // Forzar exactamente este número de MSI
                                    interval: 'month',
                                    type: 'fixed_count'
                                }
                            },
                        },
                    };
                } else {
                    throw new Error('Número de MSI no soportado. Debe ser 3, 6, 9 o 12.');
                }
            } else {
                // Tarjeta sin MSI - solo pago único
                console.log('🔧 Configurando pago con tarjeta sin MSI');
                sessionParams.payment_method_options = {
                    card: {
                        installments: {
                            enabled: false, // Deshabilitar MSI para pago único
                        },
                    },
                };
            }
        } else {
            throw new Error('Método de pago no soportado.');
        }

        // Debug: Mostrar configuración final antes de enviar a Stripe
        console.log('🔧 STRIPE CONFIG - Configuración final de sessionParams:', {
            payment_method_types: sessionParams.payment_method_types,
            payment_method_options: sessionParams.payment_method_options,
            monto: Math.round(monto * 100), // Monto en centavos
            mode: sessionParams.mode
        });

        const session = await stripe.checkout.sessions.create(sessionParams);
        
        console.log('✅ STRIPE SESSION - Sesión creada exitosamente:', {
            sessionId: session.id,
            url: session.url,
            payment_intent: session.payment_intent
        });
        
        //! Guardar el pago en la base de datos usando Prisma
        await prisma.pago.create({
            data: {
                clienteId,
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

        //! Actualizar la cotización con las nuevas condiciones comerciales
        await prisma.cotizacion.update({
            where: { id: cotizacionId },
            data: {
                precio: precioFinal,
                condicionesComercialesId,
                condicionesComercialesMetodoPagoId: metodoPagoId,
            },
        });

        // Redirigir si es GET, o retornar JSON si es POST
        if (isGET) {
            res.redirect(303, session.url);
        } else {
            res.status(200).json({ url: session.url });
        }
    } catch (error) {
        console.error('Error processing request:', error);
        return res.status(400).json({ error: 'Invalid request', details: error.message });
    }
}
