/**
 * Hook personalizado para manejar pagos con Stripe
 * Reutilizable entre sección pública y portal del cliente
 */

'use client';
import { useState } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePaymentService } from '@/app/lib/payments/stripe-service';
import { CreatePaymentSessionParams, PaymentResult } from '@/app/lib/payments/payment-types';

export function useStripePayment() {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const processPayment = async (
        params: CreatePaymentSessionParams,
        returnUrl?: string
    ): Promise<PaymentResult> => {
        if (!stripe || !elements) {
            return {
                success: false,
                error: 'Stripe no está disponible'
            };
        }

        setIsProcessing(true);
        setError(null);

        try {
            // 1. Crear sesión de pago
            const session = await stripePaymentService.createPaymentSession(params);

            // 2. Determinar URL de retorno
            const finalReturnUrl = returnUrl ||
                (params.isClientPortal
                    ? `/cliente/pagos/success?cotizacionId=${params.cotizacionId}&session_id=${session.sessionId}`
                    : `/checkout/success?cotizacionId=${params.cotizacionId}&session_id=${session.sessionId}`
                );

            // 3. Para SPEI, redirigir directamente
            if (params.tipoPago === 'spei' && session.redirectUrl) {
                window.location.href = session.redirectUrl;
                return {
                    success: true,
                    redirectUrl: session.redirectUrl
                };
            }

            // 4. Para tarjeta, confirmar con Payment Element
            if (params.tipoPago === 'card' && session.clientSecret) {
                const result = await stripePaymentService.confirmPayment(
                    stripe,
                    elements,
                    session.clientSecret,
                    finalReturnUrl
                );

                if (result.success) {
                    // Redirigir manualmente para pagos exitosos
                    window.location.href = finalReturnUrl;
                }

                return result;
            }

            return {
                success: false,
                error: 'Configuración de pago no válida'
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al procesar el pago';
            setError(errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setIsProcessing(false);
        }
    };

    const cancelPayment = (params: CreatePaymentSessionParams) => {
        const cancelUrl = params.isClientPortal
            ? `/cliente/cotizaciones/${params.cotizacionId}`
            : `/checkout/cancel?cotizacionId=${params.cotizacionId}`;

        window.location.href = cancelUrl;
    };

    return {
        processPayment,
        cancelPayment,
        isProcessing,
        error,
        isReady: !!stripe && !!elements
    };
}
