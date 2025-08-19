/**
 * Tipos TypeScript para el sistema de pagos
 * Compartidos entre sección pública y cliente
 */

export interface PaymentData {
    montoFinal: number;
    esMSI: boolean;
    numMSI: number;
    tipoPago: 'spei' | 'card';
    cotizacion: {
        id: string;
        nombre: string;
        cliente: string;
    };
    metodo: {
        id: string;
        nombre: string;
        tipo: string;
    };
    cliente?: {
        id: string;
        nombre: string;
        email: string;
        telefono: string;
    };
}

export interface PaymentSession {
    sessionId: string;
    clientSecret: string;
    paymentIntentId: string;
    redirectUrl?: string;
}

export interface PaymentResult {
    success: boolean;
    sessionId?: string;
    error?: string;
    redirectUrl?: string;
}

export interface PaymentConfig {
    cotizacionId: string;
    isClientPortal?: boolean; // Para diferenciar si viene del portal del cliente
    clienteId?: string;
    returnUrl?: string;
    cancelUrl?: string;
}

export interface CreatePaymentSessionParams extends PaymentData, PaymentConfig {
    // Combina ambas interfaces
}

export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';

export interface PaymentIntent {
    id: string;
    status: PaymentStatus;
    amount: number;
    currency: string;
    metadata: Record<string, string>;
}
