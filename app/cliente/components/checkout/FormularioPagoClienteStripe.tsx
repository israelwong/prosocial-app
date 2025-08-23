'use client';
import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface Props {
    cotizacionId: string;
    paymentData: {
        montoFinal: number;
        tipoPago: 'spei' | 'card';
        cotizacion: {
            nombre: string;
            cliente: string;
        };
        metodo: {
            nombre: string;
            tipo: string;
        };
    };
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function FormularioPagoClienteStripe({
    cotizacionId,
    paymentData,
    onSuccess,
    onCancel
}: Props) {
    const stripe = useStripe();
    const elements = useElements();

    const [mensaje, setMensaje] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            setMensaje('Stripe no está disponible. Recarga la página.');
            return;
        }

        setIsLoading(true);
        setMensaje(null);

        console.log('🚀 Cliente - Iniciando confirmación de pago...', {
            cotizacionId,
            tipoPago: paymentData.tipoPago,
            monto: paymentData.montoFinal
        });

        const confirmParams: any = {
            return_url: `${window.location.origin}/cliente/pago/success?cotizacion=${cotizacionId}&payment_intent={PAYMENT_INTENT_ID}`,
        };

        try {
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams,
            });

            if (error) {
                console.error('❌ Error en confirmPayment:', error);

                if (error.type === "card_error" || error.type === "validation_error") {
                    setMensaje(error.message || 'Ocurrió un error con tu método de pago.');
                } else {
                    setMensaje("Un error inesperado ocurrió. Inténtalo de nuevo.");
                }
            } else {
                // El pago se procesó correctamente
                console.log('✅ Pago de cliente procesado correctamente');
                onSuccess?.();
            }
        } catch (err: any) {
            console.error('❌ Error inesperado en pago de cliente:', err);
            setMensaje('Error inesperado. Por favor inténtalo de nuevo.');
        }

        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            {/* 📋 Resumen del pago */}
            <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3 border border-zinc-700">
                <h3 className="text-white font-medium text-lg flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Resumen del pago
                </h3>
                <div className="text-zinc-300 text-sm space-y-2">
                    <div className="flex justify-between">
                        <span className="text-zinc-400">Cliente:</span>
                        <span className="text-zinc-100">{paymentData.cotizacion.cliente}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-400">Cotización:</span>
                        <span className="text-zinc-100">{paymentData.cotizacion.nombre}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-400">Método:</span>
                        <span className="text-zinc-100">{paymentData.metodo.nombre}</span>
                    </div>
                </div>
                <div className="border-t border-zinc-600 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-300 font-medium">Total a pagar:</span>
                        <span className="text-green-400 font-bold text-xl">
                            {formatMoney(paymentData.montoFinal)}
                        </span>
                    </div>
                </div>
            </div>

            {/* 💳 Formulario de pago */}
            <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                    <PaymentElement
                        id="payment-element"
                        options={{
                            layout: "tabs",
                            paymentMethodOrder: paymentData.tipoPago === 'spei'
                                ? ['customer_balance']
                                : ['card']
                        }}
                    />
                </div>

                {/* 🏦 Información SPEI */}
                {paymentData.tipoPago === 'spei' && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <h4 className="text-blue-300 font-medium mb-2 flex items-center">
                            🏦 Transferencia SPEI
                        </h4>
                        <div className="text-blue-200 text-sm space-y-1">
                            <p>• <strong>Sin comisiones adicionales</strong> - Paga solo el monto mostrado</p>
                            <p>• <strong>Confirmación automática</strong> - Tu pago se verificará al instante</p>
                            <p>• <strong>Instrucciones por email</strong> - Recibirás los datos bancarios completos</p>
                            <p>• <strong>Horario de procesamiento:</strong> Inmediato en días hábiles, hasta 24h los fines de semana</p>
                        </div>
                    </div>
                )}

                {/* 💳 Información Tarjetas */}
                {paymentData.tipoPago === 'card' && (
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                        <h4 className="text-purple-300 font-medium mb-2 flex items-center">
                            💳 Pago con Tarjeta
                        </h4>
                        <div className="text-purple-200 text-sm space-y-1">
                            <p>• <strong>Procesamiento seguro</strong> - Protegido por Stripe</p>
                            <p>• <strong>Confirmación inmediata</strong> - Conoce el resultado al instante</p>
                            <p>• <strong>Solo pago único</strong> - No disponible a meses sin intereses para clientes</p>
                        </div>
                    </div>
                )}

                {/* 🚨 Mensaje de error */}
                {mensaje && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <p className="text-red-300 text-sm flex items-center">
                            <span className="text-red-400 mr-2">⚠️</span>
                            {mensaje}
                        </p>
                    </div>
                )}

                {/* 🔄 Botones de acción */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-3 px-6 rounded-lg border border-zinc-600 font-medium text-sm transition-all duration-200 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={isLoading || !stripe || !elements}
                        className="flex-1 py-3 px-6 rounded-lg border font-medium text-sm transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white border-blue-500 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Procesando...
                            </div>
                        ) : (
                            `Pagar ${formatMoney(paymentData.montoFinal)}`
                        )}
                    </button>
                </div>

                {/* 🔒 Información de seguridad */}
                <div className="text-center">
                    <p className="text-zinc-400 text-xs flex items-center justify-center">
                        <span className="mr-1">🔒</span>
                        Transacción segura protegida por Stripe SSL
                    </p>
                </div>
            </form>
        </div>
    );
}
