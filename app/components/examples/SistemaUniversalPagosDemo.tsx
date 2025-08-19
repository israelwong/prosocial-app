/**
 * Ejemplo de testing y documentación del sistema universal de pagos
 * Demuestra cómo usar los componentes en diferentes contextos
 */

import React from 'react';
import { UniversalPaymentModal } from '@/app/components/payments/UniversalPaymentModal';
import { CreatePaymentSessionParams } from '@/app/lib/payments/payment-types';

// Ejemplo 1: Pago desde cotización pública (contexto original)
export function EjemploPagoPublico() {
    const paymentParamsPublico: CreatePaymentSessionParams = {
        montoFinal: 45000,
        esMSI: true,
        numMSI: 6,
        tipoPago: 'card',

        cotizacion: {
            id: 'cot_public_123',
            nombre: 'Paquete Essential - Cumpleaños',
            cliente: 'Juan Pérez'
        },

        metodo: {
            id: 'metodo_1',
            nombre: 'Tarjeta de Crédito',
            tipo: 'card'
        },

        cliente: {
            id: 'guest_user',
            nombre: 'Juan Pérez',
            email: 'juan@example.com',
            telefono: '5545556666'
        },

        // Configuración para contexto público
        cotizacionId: 'cot_public_123',
        isClientPortal: false, // IMPORTANTE: false para público
        returnUrl: '/checkout/success',
        cancelUrl: '/cotizacion/cot_public_123'
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Pago desde Cotización Pública</h3>
            <p className="text-gray-600 mb-4">
                Contexto: Usuario navegando en la página pública, sin autenticación
            </p>

            <UniversalPaymentModal
                paymentParams={paymentParamsPublico}
                onSuccess={() => console.log('Pago público exitoso')}
                onCancel={() => console.log('Pago público cancelado')}
                onError={(error) => console.error('Error pago público:', error)}
                theme="dark" // Tema oscuro para páginas públicas
            />
        </div>
    );
}

// Ejemplo 2: Pago desde portal del cliente (contexto autenticado)
export function EjemploPagoCliente() {
    const paymentParamsCliente: CreatePaymentSessionParams = {
        montoFinal: 67500,
        esMSI: true,
        numMSI: 12,
        tipoPago: 'card',

        cotizacion: {
            id: 'cot_client_456',
            nombre: 'Paquete Complete - XV Años',
            cliente: 'María García'
        },

        metodo: {
            id: 'metodo_1',
            nombre: 'Tarjeta de Crédito',
            tipo: 'card'
        },

        cliente: {
            id: 'cliente_123',
            nombre: 'María García',
            email: 'maria@example.com',
            telefono: '5544546582'
        },

        // Configuración para portal del cliente
        cotizacionId: 'cot_client_456',
        isClientPortal: true, // IMPORTANTE: true para portal cliente
        clienteId: 'cliente_123',
        returnUrl: '/cliente/pagos/success?cotizacionId=cot_client_456',
        cancelUrl: '/cliente/cotizaciones/cot_client_456'
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Pago desde Portal del Cliente</h3>
            <p className="text-gray-600 mb-4">
                Contexto: Cliente autenticado en su portal personal
            </p>

            <UniversalPaymentModal
                paymentParams={paymentParamsCliente}
                onSuccess={() => console.log('Pago cliente exitoso')}
                onCancel={() => console.log('Pago cliente cancelado')}
                onError={(error) => console.error('Error pago cliente:', error)}
                theme="light" // Tema claro para portal del cliente
            />
        </div>
    );
}

// Ejemplo 3: Diferencias en el procesamiento del webhook
export function DocumentacionWebhook() {
    return (
        <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Procesamiento del Webhook</h3>

            <div className="space-y-4">
                <div className="bg-white p-4 rounded border-l-4 border-blue-500">
                    <h4 className="font-medium text-blue-900 mb-2">Pago Público</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Metadata: <code>isClientPortal: "false"</code></li>
                        <li>• URL de éxito: <code>/checkout/success</code></li>
                        <li>• Redirección: Página pública de confirmación</li>
                        <li>• Notificaciones: Email básico al cliente</li>
                    </ul>
                </div>

                <div className="bg-white p-4 rounded border-l-4 border-green-500">
                    <h4 className="font-medium text-green-900 mb-2">Pago Cliente Portal</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Metadata: <code>isClientPortal: "true"</code></li>
                        <li>• URL de éxito: <code>/cliente/pagos/success?cotizacionId=...</code></li>
                        <li>• Redirección: Dashboard personalizado del cliente</li>
                        <li>• Notificaciones: Email + actualización en portal</li>
                    </ul>
                </div>
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">🔧 Configuración del Webhook</h4>
                <pre className="text-xs text-yellow-800 bg-yellow-100 p-2 rounded overflow-x-auto">
                    {`// En /pages/api/webhooks/stripe.js
const isClientPortal = metadata.isClientPortal === 'true';
const clienteId = metadata.clienteId;

if (isClientPortal) {
  // Lógica específica para portal del cliente
  // - Actualizar dashboard
  // - Notificaciones personalizadas
  // - Redirección a portal
} else {
  // Lógica para página pública
  // - Email básico
  // - Redirección a página pública
}`}
                </pre>
            </div>
        </div>
    );
}

// Ejemplo 4: Estructura de archivos del sistema
export function DocumentacionArquitectura() {
    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">📁 Arquitectura del Sistema de Pagos</h3>

            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                <pre>{`
app/
├── lib/payments/                    # 🏗️ Capa de servicios
│   ├── stripe-service.ts           # Servicio principal de Stripe
│   └── payment-types.ts            # Interfaces TypeScript
│
├── components/payments/             # 🎨 Componentes reutilizables
│   ├── UniversalPaymentModal.tsx   # Modal universal de pagos
│   └── PaymentForm.tsx             # Formulario de pago
│
├── hooks/                          # 🎣 Custom hooks
│   └── useStripePayment.ts         # Hook para lógica de pagos
│
├── cliente/                        # 👤 Portal del cliente
│   ├── layout.tsx                  # Layout con navegación
│   ├── dashboard/page.tsx          # Dashboard principal
│   ├── components/
│   │   └── CotizacionConPagos.tsx  # Componente cotización + pago
│   ├── cotizaciones/
│   │   └── [cotizacionId]/
│   │       ├── page.tsx            # Detalles de cotización
│   │       └── pagar/page.tsx      # Página de pago dedicada
│   └── pagos/
│       └── success/page.tsx        # Página de éxito cliente
│
└── api/                           # 🔧 APIs
    ├── checkout/create-session.js  # Crear sesión (con soporte cliente)
    └── webhooks/stripe.js          # Webhook mejorado

pages/api/                         # 🔗 APIs legacy (compatibilidad)
├── checkout/create-session.js      # ✅ Enhanced con isClientPortal
└── webhooks/stripe.js              # ✅ Reescrito con lógica dual
        `}</pre>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">🔄 Reutilización</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Mismos componentes para público y cliente</li>
                        <li>• Configuración por parámetros</li>
                        <li>• Temas adaptables (light/dark)</li>
                        <li>• URLs contextuales automáticas</li>
                    </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">⚡ Beneficios</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                        <li>• Código DRY (Don't Repeat Yourself)</li>
                        <li>• Mantenimiento centralizado</li>
                        <li>• Consistencia en UX</li>
                        <li>• Escalabilidad para nuevos contextos</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

// Ejemplo principal que muestra todo
export default function SistemaUniversalPagosDemo() {
    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Sistema Universal de Pagos - ProSocial
                    </h1>
                    <p className="text-gray-600 max-w-3xl mx-auto">
                        Demostración del sistema modular de pagos que funciona tanto en cotizaciones públicas
                        como en el portal autenticado del cliente, reutilizando componentes y lógica.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Documentación de arquitectura */}
                    <DocumentacionArquitectura />

                    {/* Ejemplos de uso */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <EjemploPagoPublico />
                        <EjemploPagoCliente />
                    </div>

                    {/* Documentación del webhook */}
                    <DocumentacionWebhook />

                    {/* Resumen de funcionalidades */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">✨ Funcionalidades Implementadas</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                                <h4 className="font-medium text-blue-900 mb-2">Reutilización</h4>
                                <p className="text-sm text-blue-700">
                                    Mismos componentes funcionan en público y portal cliente
                                </p>
                            </div>

                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="font-medium text-green-900 mb-2">Automatización</h4>
                                <p className="text-sm text-green-700">
                                    Webhook actualiza cotización → evento → agenda automáticamente
                                </p>
                            </div>

                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                    </svg>
                                </div>
                                <h4 className="font-medium text-purple-900 mb-2">Configurabilidad</h4>
                                <p className="text-sm text-purple-700">
                                    Parámetros adaptan comportamiento según contexto
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
