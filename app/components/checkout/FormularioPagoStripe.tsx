'use client';
import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface Props {
    cotizacionId: string;
    paymentData: {
        montoFinal: number;
        esMSI: boolean;
        numMSI: number;
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

export default function FormularioPagoStripe({
    cotizacionId,
    paymentData,
    onSuccess,
    onCancel
}: Props) {
    const stripe = useStripe();
    const elements = useElements();

    const [mensaje, setMensaje] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            setMensaje('Stripe no está disponible. Recarga la página.');
            return;
        }

        setIsLoading(true);
        setMensaje(null);

        console.log('🚀 Iniciando confirmación de pago...', {
            cotizacionId,
            tipoPago: paymentData.tipoPago,
            esMSI: paymentData.esMSI,
            numMSI: paymentData.numMSI
        });

        const confirmParams: any = {
            return_url: `${window.location.origin}/checkout/success?cotizacion=${cotizacionId}&payment_intent={PAYMENT_INTENT_ID}`,
        };

        // 🎯 MSI: Configurar plan específico durante confirmación
        if (paymentData.tipoPago === 'card' && paymentData.esMSI && paymentData.numMSI > 0) {
            // ✅ AQUÍ especificamos el plan MSI exacto durante la confirmación
            confirmParams.payment_method_options = {
                card: {
                    installments: {
                        plan: {
                            count: paymentData.numMSI,
                            interval: 'month',
                            type: 'fixed_count',
                        },
                    },
                },
            };
            console.log(`💳 MSI ESPECÍFICO en confirmación: ${paymentData.numMSI} meses`);
        } else if (paymentData.tipoPago === 'spei') {
            console.log('🏦 Procesando pago SPEI');
        } else {
            console.log('💳 Procesando pago único');
        }

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
                // El pago se procesó correctamente, el usuario será redirigido
                console.log('✅ Pago procesado correctamente');
                onSuccess?.();
            }
        } catch (err: any) {
            console.error('❌ Error inesperado:', err);
            setMensaje('Error inesperado. Por favor inténtalo de nuevo.');
        }

        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            {/* 📋 Resumen del pago */}
            <div className="bg-zinc-700 rounded-lg p-4 space-y-2">
                <h3 className="text-white font-medium text-lg">Resumen del pago</h3>
                <div className="text-zinc-300 text-sm space-y-1">
                    <p><span className="text-zinc-400">Cliente:</span> {paymentData.cotizacion.cliente}</p>
                    <p><span className="text-zinc-400">Cotización:</span> {paymentData.cotizacion.nombre}</p>
                    <p><span className="text-zinc-400">Método:</span> {paymentData.metodo.nombre}</p>
                    {paymentData.esMSI && (
                        <p><span className="text-zinc-400">MSI:</span> Hasta {paymentData.numMSI} meses sin intereses</p>
                    )}
                </div>
                <div className="border-t border-zinc-600 pt-2 mt-3">
                    <p className="text-white font-bold text-xl">
                        Total: ${paymentData.montoFinal.toLocaleString('es-MX', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })} MXN
                    </p>
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

                {/* 🎯 Información MSI */}
                {paymentData.esMSI && paymentData.tipoPago === 'card' && (
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                        <p className="text-purple-300 text-sm">
                            💳 <strong>Meses Sin Intereses disponibles:</strong> Este pago puede dividirse
                            hasta en {paymentData.numMSI} mensualidades sin intereses,
                            sujeto a aprobación de tu banco.
                        </p>
                    </div>
                )}

                {/* 🏦 Información SPEI */}
                {paymentData.tipoPago === 'spei' && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                        <p className="text-blue-300 text-sm">
                            🏦 <strong>Pago SPEI:</strong> Recibirás instrucciones bancarias
                            para completar tu transferencia. Sin comisiones adicionales.
                        </p>
                    </div>
                )}

                {/* 🚨 Mensaje de error */}
                {mensaje && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                        <p className="text-red-300 text-sm">{mensaje}</p>
                    </div>
                )}

                {/* 🔄 Botones de acción */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-3 px-6 rounded-lg border border-zinc-600 font-medium text-sm transition-all duration-200 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={isLoading || !stripe || !elements}
                        className="flex-1 py-3 px-6 rounded-lg border font-medium text-sm transition-all duration-200 bg-purple-600 hover:bg-purple-700 text-white border-purple-500 hover:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Procesando...
                            </div>
                        ) : (
                            `Pagar $${paymentData.montoFinal.toLocaleString('es-MX', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}`
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
