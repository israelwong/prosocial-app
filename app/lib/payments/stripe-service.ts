/**
 * Servicio para manejar pagos con Stripe
 * Reutilizable entre sección pública y portal del cliente
 */

import { CreatePaymentSessionParams, PaymentSession, PaymentResult } from './payment-types';

export class StripePaymentService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    }

    /**
     * Crea una sesión de pago con Stripe
     */
    async createPaymentSession(params: CreatePaymentSessionParams): Promise<PaymentSession> {
        const {
            cotizacionId,
            montoFinal,
            esMSI,
            numMSI,
            tipoPago,
            cotizacion,
            metodo,
            cliente,
            isClientPortal = false,
            clienteId,
            returnUrl,
            cancelUrl
        } = params;

        // Determinar URLs de retorno
        const successUrl = returnUrl || (isClientPortal
            ? `/cliente/pagos/success?cotizacionId=${cotizacionId}`
            : `/checkout/success?cotizacionId=${cotizacionId}`
        );

        const cancelUrlFinal = cancelUrl || (isClientPortal
            ? `/cliente/cotizaciones/${cotizacionId}`
            : `/checkout/cancel?cotizacionId=${cotizacionId}`
        );

        // Preparar datos para la API
        const paymentData = {
            cotizacionId,
            montoFinal,
            paymentMethod: tipoPago,
            num_msi: esMSI ? numMSI : 0,
            metodoPagoId: metodo.id,
            clienteId: clienteId || cliente?.id,
            nombreCliente: cliente?.nombre || cotizacion.cliente,
            emailCliente: cliente?.email,
            telefonoCliente: cliente?.telefono,
            concepto: `Cotización ${cotizacion.nombre}`,
            descripcion: `Pago para evento - Cotización ${cotizacion.nombre}`,
            isClientPortal,
            returnUrl: successUrl,
            cancelUrl: cancelUrlFinal
        };

        try {
            const response = await fetch('/api/checkout/create-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData),
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            return {
                sessionId: result.sessionId,
                clientSecret: result.clientSecret,
                paymentIntentId: result.paymentIntentId,
                redirectUrl: result.url
            };
        } catch (error) {
            console.error('Error creating payment session:', error);
            throw error;
        }
    }

    /**
     * Confirma un pago con Payment Intent
     */
    async confirmPayment(
        stripe: any,
        elements: any,
        clientSecret: string,
        returnUrl: string
    ): Promise<PaymentResult> {
        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: {
                    return_url: returnUrl,
                },
                redirect: 'if_required'
            });

            if (error) {
                return {
                    success: false,
                    error: error.message
                };
            }

            return {
                success: true,
                sessionId: paymentIntent.id
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido'
            };
        }
    }

    /**
     * Obtiene el estado de un pago
     */
    async getPaymentStatus(paymentIntentId: string) {
        try {
            const response = await fetch(`/api/payments/${paymentIntentId}/status`);
            if (!response.ok) {
                throw new Error('Error al obtener estado del pago');
            }
            return await response.json();
        } catch (error) {
            console.error('Error getting payment status:', error);
            throw error;
        }
    }

    /**
     * Formatea el monto para mostrar
     */
    formatAmount(amount: number): string {
        return amount.toLocaleString('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2
        });
    }

    /**
     * Construye metadata para el Payment Intent
     */
    buildMetadata(params: CreatePaymentSessionParams) {
        return {
            cotizacionId: params.cotizacionId,
            isClientPortal: params.isClientPortal?.toString() || 'false',
            clienteId: params.clienteId || '',
            metodoPagoId: params.metodo.id,
            tipoPago: params.tipoPago,
            msi: params.esMSI ? params.numMSI.toString() : '0'
        };
    }
}

// Singleton instance
export const stripePaymentService = new StripePaymentService();
