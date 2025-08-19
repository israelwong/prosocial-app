/**
 * Página dedicada al pago de una cotización específica
 * Integra el sistema universal de pagos con enfoque en UX del cliente
 */

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { UniversalPaymentModal } from '@/app/components/payments/UniversalPaymentModal';
import { CreatePaymentSessionParams } from '@/app/lib/payments/payment-types';

interface Props {
    params: {
        cotizacionId: string;
    };
}

// En producción, estos datos vendrían de tu API/base de datos
async function getCotizacionData(cotizacionId: string) {
    // Simulamos una llamada a la API
    const cotizaciones = {
        'cot_123': {
            id: 'cot_123',
            nombre: 'Paquete Complete - XV Años',
            precio: 67500,
            status: 'pending',
            fecha_creacion: '2025-01-15',
            fecha_evento: '2025-03-15',
            notas: 'Celebración de XV años con 150 invitados',
            cliente: {
                id: 'cliente_123',
                nombre: 'María García',
                email: 'maria@example.com',
                telefono: '5544546582'
            },
            metodoPago: {
                id: 'metodo_1',
                nombre: 'Tarjeta de Crédito',
                tipo: 'card',
                msi_disponible: true,
                num_msi: 12
            },
            detalles: {
                servicios: [
                    { nombre: 'Fotografía profesional', precio: 15000 },
                    { nombre: 'Videografía HD', precio: 12000 },
                    { nombre: 'DJ y equipo de sonido', precio: 8500 },
                    { nombre: 'Decoración completa', precio: 18000 },
                    { nombre: 'Catering (150 personas)', precio: 22500 },
                    { nombre: 'Coordinación del evento', precio: 6000 }
                ],
                lugar: 'Jardín Los Rosales',
                direccion: 'Av. Reforma 123, Col. Centro, CDMX',
                duracion: '6 horas',
                invitados: 150
            }
        }
    };

    return cotizaciones[cotizacionId as keyof typeof cotizaciones] || null;
}

export default async function PagarCotizacionPage({ params }: Props) {
    const cotizacion = await getCotizacionData(params.cotizacionId);

    if (!cotizacion) {
        notFound();
    }

    if (cotizacion.status !== 'pending') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-6 text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">
                        Cotización no disponible para pago
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Esta cotización ya ha sido procesada o no está disponible para pago.
                    </p>
                    <Link
                        href={`/cliente/cotizaciones/${params.cotizacionId}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Ver detalles de la cotización
                    </Link>
                </div>
            </div>
        );
    }

    // Configurar parámetros de pago para el portal del cliente
    const paymentParams: CreatePaymentSessionParams = {
        // Datos del pago
        montoFinal: cotizacion.precio,
        esMSI: cotizacion.metodoPago.msi_disponible,
        numMSI: cotizacion.metodoPago.num_msi,
        tipoPago: 'card',

        // Datos de la cotización
        cotizacion: {
            id: cotizacion.id,
            nombre: cotizacion.nombre,
            cliente: cotizacion.cliente.nombre
        },

        // Método de pago
        metodo: {
            id: cotizacion.metodoPago.id,
            nombre: cotizacion.metodoPago.nombre,
            tipo: cotizacion.metodoPago.tipo
        },

        // Datos del cliente
        cliente: {
            id: cotizacion.cliente.id,
            nombre: cotizacion.cliente.nombre,
            email: cotizacion.cliente.email,
            telefono: cotizacion.cliente.telefono
        },

        // Configuración para portal del cliente
        cotizacionId: cotizacion.id,
        isClientPortal: true,
        clienteId: cotizacion.cliente.id,
        returnUrl: `/cliente/pagos/success?cotizacionId=${cotizacion.id}`,
        cancelUrl: `/cliente/cotizaciones/${cotizacion.id}`
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm mb-8">
                    <Link href="/cliente/dashboard" className="text-blue-600 hover:text-blue-800">
                        Dashboard
                    </Link>
                    <span className="text-gray-400">/</span>
                    <Link href="/cliente/cotizaciones" className="text-blue-600 hover:text-blue-800">
                        Cotizaciones
                    </Link>
                    <span className="text-gray-400">/</span>
                    <Link href={`/cliente/cotizaciones/${cotizacion.id}`} className="text-blue-600 hover:text-blue-800">
                        {cotizacion.nombre}
                    </Link>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-600">Realizar Pago</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Columna izquierda - Resumen de la cotización */}
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                        Finalizar Pago
                                    </h1>
                                    <p className="text-gray-600">
                                        Estás a punto de confirmar tu evento con el pago de esta cotización
                                    </p>
                                </div>
                            </div>

                            {/* Advertencia de seguridad */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <div>
                                        <p className="font-medium text-green-900 text-sm">
                                            Transacción 100% segura
                                        </p>
                                        <p className="text-green-700 text-sm mt-1">
                                            Tu información y pago están protegidos con encriptación SSL y procesados por Stripe.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Resumen de la cotización */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Resumen de tu cotización
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-medium text-gray-900">{cotizacion.nombre}</h3>
                                    <p className="text-sm text-gray-600">{cotizacion.notas}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Fecha del evento:</span>
                                        <p className="font-medium text-gray-900">
                                            {new Date(cotizacion.fecha_evento).toLocaleDateString('es-MX', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Ubicación:</span>
                                        <p className="font-medium text-gray-900">{cotizacion.detalles.lugar}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Duración:</span>
                                        <p className="font-medium text-gray-900">{cotizacion.detalles.duracion}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Invitados:</span>
                                        <p className="font-medium text-gray-900">{cotizacion.detalles.invitados} personas</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Servicios incluidos (versión resumida) */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="font-medium text-gray-900 mb-3">Servicios incluidos</h3>
                            <div className="space-y-2">
                                {cotizacion.detalles.servicios.map((servicio, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-gray-700">{servicio.nombre}</span>
                                        </div>
                                        <span className="text-gray-600">
                                            {servicio.precio.toLocaleString('es-MX', {
                                                style: 'currency',
                                                currency: 'MXN'
                                            })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Información de contacto rápida */}
                        <div className="bg-blue-50 rounded-xl p-4">
                            <h3 className="font-medium text-blue-900 text-sm mb-2">
                                ¿Necesitas ayuda con tu pago?
                            </h3>
                            <p className="text-blue-700 text-sm mb-3">
                                Nuestro equipo está disponible para asistirte durante el proceso de pago.
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                                <a href="tel:5512345678" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    55 1234 5678
                                </a>
                                <a href="mailto:soporte@prosocial.mx" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Enviar email
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Columna derecha - Panel de pago */}
                    <div>
                        <div className="sticky top-8">
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                {/* Resumen de precio */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="text-gray-900">
                                            {cotizacion.precio.toLocaleString('es-MX', {
                                                style: 'currency',
                                                currency: 'MXN'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-gray-600">IVA incluido:</span>
                                        <span className="text-gray-900">
                                            {(cotizacion.precio * 0.16).toLocaleString('es-MX', {
                                                style: 'currency',
                                                currency: 'MXN'
                                            })}
                                        </span>
                                    </div>
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold text-gray-900">Total:</span>
                                            <span className="text-2xl font-bold text-gray-900">
                                                {cotizacion.precio.toLocaleString('es-MX', {
                                                    style: 'currency',
                                                    currency: 'MXN'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Método de pago disponible */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-medium text-gray-900 mb-2">Método de pago</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-700">{cotizacion.metodoPago.nombre}</span>
                                        {cotizacion.metodoPago.msi_disponible && (
                                            <span className="text-sm text-green-600 font-medium bg-green-100 px-2 py-1 rounded">
                                                Hasta {cotizacion.metodoPago.num_msi} MSI
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Componente de pago universal */}
                                <UniversalPaymentModal
                                    paymentParams={paymentParams}
                                    onSuccess={() => {
                                        console.log('Pago exitoso - redirigiendo...');
                                    }}
                                    onCancel={() => {
                                        console.log('Pago cancelado');
                                    }}
                                    onError={(error: string) => {
                                        console.error('Error en el pago:', error);
                                    }}
                                    className="w-full"
                                    theme="light"
                                />

                                {/* Información adicional */}
                                <div className="mt-6 text-center">
                                    <p className="text-xs text-gray-500 mb-2">
                                        Al hacer clic en "Realizar Pago", aceptas nuestros{' '}
                                        <Link href="/terminos" className="text-blue-600 hover:text-blue-800">
                                            términos y condiciones
                                        </Link>
                                    </p>
                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <span>Pagos seguros con Stripe</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
