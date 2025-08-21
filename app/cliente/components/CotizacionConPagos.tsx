/**
 * Ejemplo de integración del sistema de pagos en el portal del cliente
 * Este componente muestra cómo usar UniversalPaymentModal
 */

'use client';
import React from 'react';
import { UniversalPaymentModal } from '@/app/components/payments/UniversalPaymentModal';
import { CreatePaymentSessionParams } from '@/app/lib/payments/payment-types';

interface Props {
    cotizacion: {
        id: string;
        nombre: string;
        precio: number;
        status: string;
    };
    cliente: {
        id: string;
        nombre: string;
        email: string;
        telefono: string;
    };
    metodoPago: {
        id: string;
        nombre: string;
        tipo: string;
        msi_disponible: boolean;
        num_msi: number;
    };
}

export default function CotizacionConPagos({ cotizacion, cliente, metodoPago }: Props) {
    // Configurar parámetros de pago para el portal del cliente
    const paymentParams: CreatePaymentSessionParams = {
        // Datos del pago
        montoFinal: cotizacion.precio,
        esMSI: metodoPago.msi_disponible,
        numMSI: metodoPago.num_msi,
        tipoPago: 'card', // Se puede cambiar en el formulario

        // Datos de la cotización
        cotizacion: {
            id: cotizacion.id,
            nombre: cotizacion.nombre,
            cliente: cliente.nombre
        },

        // Método de pago
        metodo: {
            id: metodoPago.id,
            nombre: metodoPago.nombre,
            tipo: metodoPago.tipo
        },

        // Datos del cliente
        cliente: {
            id: cliente.id,
            nombre: cliente.nombre,
            email: cliente.email,
            telefono: cliente.telefono
        },

        // Configuración para portal del cliente
        cotizacionId: cotizacion.id,
        isClientPortal: true,
        clienteId: cliente.id,
        returnUrl: `/cliente/pagos/success?cotizacionId=${cotizacion.id}`,
        cancelUrl: `/cliente/cotizaciones/${cotizacion.id}`
    };

    const handlePaymentSuccess = () => {
        console.log('Pago exitoso - redirigiendo...');
        // La redirección la maneja automáticamente el hook
    };

    const handlePaymentCancel = () => {
        console.log('Pago cancelado');
    };

    const handlePaymentError = (error: string) => {
        console.error('Error en el pago:', error);
        // Aquí podrías mostrar un toast o notificación de error
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header de la cotización */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <h2 className="text-xl font-bold mb-2">{cotizacion.nombre}</h2>
                <p className="text-blue-100">Cotización para {cliente.nombre}</p>
            </div>

            {/* Contenido */}
            <div className="p-6">
                {/* Status de la cotización */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-sm text-gray-600">Estado de la cotización</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cotizacion.status === 'aprobada'
                            ? 'bg-green-100 text-green-800'
                            : cotizacion.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {cotizacion.status === 'aprobada' ? 'Aprobada' :
                                cotizacion.status === 'pending' ? 'Pendiente' : 'En revisión'}
                        </span>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {cotizacion.precio.toLocaleString('es-MX', {
                                style: 'currency',
                                currency: 'MXN'
                            })}
                        </p>
                    </div>
                </div>

                {/* Información del método de pago */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-gray-900 mb-2">Método de pago disponible</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700">{metodoPago.nombre}</span>
                        {metodoPago.msi_disponible && (
                            <span className="text-sm text-green-600 font-medium">
                                Hasta {metodoPago.num_msi} MSI
                            </span>
                        )}
                    </div>
                </div>

                {/* Botón de pago */}
                {cotizacion.status === 'pending' && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="font-medium text-blue-900 text-sm">
                                        Cotización lista para pago
                                    </p>
                                    <p className="text-blue-700 text-sm mt-1">
                                        Puedes proceder con el pago para confirmar tu evento.
                                        Una vez procesado, tu evento será automáticamente confirmado.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <UniversalPaymentModal
                            paymentParams={paymentParams}
                            onSuccess={handlePaymentSuccess}
                            onCancel={handlePaymentCancel}
                            onError={handlePaymentError}
                            className="w-full"
                            theme="light"
                        />
                    </div>
                )}

                {cotizacion.status === 'aprobada' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <div>
                                <p className="font-medium text-green-900 text-sm">
                                    ¡Cotización pagada y confirmada!
                                </p>
                                <p className="text-green-700 text-sm mt-1">
                                    Tu evento ha sido confirmado. Revisa tu correo para más detalles.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Ejemplo de uso en una página de cotización del cliente
export function EjemploUsoEnPaginaCliente() {
    // Estos datos vendrían de tu API/base de datos
    const cotizacionEjemplo = {
        id: 'cot_123',
        nombre: 'Paquete Complete - XV Años',
        precio: 67500,
        status: 'pending'
    };

    const clienteEjemplo = {
        id: 'cliente_123',
        nombre: 'María García',
        email: 'maria@example.com',
        telefono: '5544546582'
    };

    const metodoPagoEjemplo = {
        id: 'metodo_1',
        nombre: 'Tarjeta de Crédito',
        tipo: 'card',
        msi_disponible: true,
        num_msi: 12
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">
                    Portal del Cliente - Cotizaciones
                </h1>

                <CotizacionConPagos
                    cotizacion={cotizacionEjemplo}
                    cliente={clienteEjemplo}
                    metodoPago={metodoPagoEjemplo}
                />
            </div>
        </div>
    );
}
