/**
 * Página individual de cotización en el portal del cliente
 * Muestra detalles completos y permite realizar el pago
 */

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CotizacionClienteConPagos from '@/app/cliente/components/CotizacionConPagos';

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
            detalles: {
                servicios: [
                    { nombre: 'Fotografía profesional', precio: 15000, incluido: true },
                    { nombre: 'Videografía HD', precio: 12000, incluido: true },
                    { nombre: 'DJ y equipo de sonido', precio: 8500, incluido: true },
                    { nombre: 'Decoración completa', precio: 18000, incluido: true },
                    { nombre: 'Catering (150 personas)', precio: 22500, incluido: true },
                    { nombre: 'Coordinación del evento', precio: 6000, incluido: true },
                    { nombre: 'Transporte especial', precio: 4500, incluido: false }
                ],
                lugar: 'Jardín Los Rosales',
                direccion: 'Av. Reforma 123, Col. Centro, CDMX',
                duracion: '6 horas',
                invitados: 150,
                notas_adicionales: 'Incluye vals especial y show de luces. Se requiere depósito del 50% para apartar la fecha.'
            }
        },
        'cot_124': {
            id: 'cot_124',
            nombre: 'Paquete Platinum - Boda',
            precio: 125000,
            status: 'aprobada',
            fecha_creacion: '2025-01-10',
            fecha_evento: '2025-06-20',
            notas: 'Boda en jardín con 200 invitados',
            detalles: {
                servicios: [
                    { nombre: 'Fotografía profesional', precio: 25000, incluido: true },
                    { nombre: 'Videografía 4K', precio: 20000, incluido: true },
                    { nombre: 'DJ y banda en vivo', precio: 18000, incluido: true },
                    { nombre: 'Decoración premium', precio: 35000, incluido: true },
                    { nombre: 'Catering gourmet (200 personas)', precio: 40000, incluido: true },
                    { nombre: 'Coordinación completa', precio: 12000, incluido: true },
                    { nombre: 'Suite nupcial', precio: 8000, incluido: true }
                ],
                lugar: 'Hacienda San Miguel',
                direccion: 'Carretera Federal Km 25, Estado de México',
                duracion: '8 horas',
                invitados: 200,
                notas_adicionales: 'Paquete todo incluido con ceremonia religiosa y civil. Incluye hospedaje para novios.'
            }
        }
    };

    return cotizaciones[cotizacionId as keyof typeof cotizaciones] || null;
}

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

export default async function CotizacionDetallePage({ params }: Props) {
    const cotizacion = await getCotizacionData(params.cotizacionId);

    if (!cotizacion) {
        notFound();
    }

    const serviciosIncluidos = cotizacion.detalles.servicios.filter(s => s.incluido);
    const serviciosOpcionales = cotizacion.detalles.servicios.filter(s => !s.incluido);
    const totalServicios = serviciosIncluidos.reduce((sum, s) => sum + s.precio, 0);

    function getStatusInfo(status: string) {
        const configs = {
            pending: {
                bg: 'bg-yellow-50',
                border: 'border-yellow-200',
                text: 'text-yellow-800',
                icon: '⏳',
                title: 'Pendiente de pago',
                description: 'Tu cotización está lista para ser pagada. Una vez procesado el pago, tu evento será confirmado automáticamente.'
            },
            aprobada: {
                bg: 'bg-green-50',
                border: 'border-green-200',
                text: 'text-green-800',
                icon: '✅',
                title: 'Pagada y confirmada',
                description: 'Tu evento ha sido confirmado. Revisa tu correo electrónico para más detalles.'
            },
            en_revision: {
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                text: 'text-blue-800',
                icon: '👀',
                title: 'En revisión',
                description: 'Estamos revisando los detalles de tu cotización. Te contactaremos pronto.'
            }
        };

        return configs[status as keyof typeof configs] || configs.en_revision;
    }

    const statusInfo = getStatusInfo(cotizacion.status);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb y navegación */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center space-x-2 text-sm">
                        <Link href="/cliente/dashboard" className="text-blue-600 hover:text-blue-800">
                            Dashboard
                        </Link>
                        <span className="text-gray-400">/</span>
                        <Link href="/cliente/cotizaciones" className="text-blue-600 hover:text-blue-800">
                            Cotizaciones
                        </Link>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-600">{cotizacion.nombre}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columna principal - Detalles */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header de la cotización */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                        {cotizacion.nombre}
                                    </h1>
                                    <p className="text-gray-600">{cotizacion.notas}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Total</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {cotizacion.precio.toLocaleString('es-MX', {
                                            style: 'currency',
                                            currency: 'MXN'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Estado de la cotización */}
                            <div className={`rounded-lg p-4 ${statusInfo.bg} ${statusInfo.border} border`}>
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">{statusInfo.icon}</span>
                                    <div>
                                        <h3 className={`font-medium ${statusInfo.text} text-sm`}>
                                            {statusInfo.title}
                                        </h3>
                                        <p className={`${statusInfo.text} text-sm mt-1`}>
                                            {statusInfo.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detalles del evento */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Detalles del evento
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-medium text-gray-700 mb-2">Información general</h3>
                                    <dl className="space-y-2">
                                        <div>
                                            <dt className="text-sm text-gray-500">Fecha del evento</dt>
                                            <dd className="text-sm font-medium text-gray-900">
                                                {new Date(cotizacion.fecha_evento).toLocaleDateString('es-MX', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm text-gray-500">Duración</dt>
                                            <dd className="text-sm font-medium text-gray-900">{cotizacion.detalles.duracion}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm text-gray-500">Número de invitados</dt>
                                            <dd className="text-sm font-medium text-gray-900">{cotizacion.detalles.invitados} personas</dd>
                                        </div>
                                    </dl>
                                </div>

                                <div>
                                    <h3 className="font-medium text-gray-700 mb-2">Ubicación</h3>
                                    <dl className="space-y-2">
                                        <div>
                                            <dt className="text-sm text-gray-500">Lugar</dt>
                                            <dd className="text-sm font-medium text-gray-900">{cotizacion.detalles.lugar}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm text-gray-500">Dirección</dt>
                                            <dd className="text-sm font-medium text-gray-900">{cotizacion.detalles.direccion}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            {cotizacion.detalles.notas_adicionales && (
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                    <h3 className="font-medium text-blue-900 text-sm mb-2">Notas adicionales</h3>
                                    <p className="text-blue-800 text-sm">{cotizacion.detalles.notas_adicionales}</p>
                                </div>
                            )}
                        </div>

                        {/* Servicios incluidos */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Servicios incluidos
                            </h2>

                            <div className="space-y-3">
                                {serviciosIncluidos.map((servicio, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-gray-900 font-medium">{servicio.nombre}</span>
                                        </div>
                                        <span className="text-green-700 font-medium">
                                            {servicio.precio.toLocaleString('es-MX', {
                                                style: 'currency',
                                                currency: 'MXN'
                                            })}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-gray-900">Total de servicios</span>
                                    <span className="text-lg font-bold text-gray-900">
                                        {totalServicios.toLocaleString('es-MX', {
                                            style: 'currency',
                                            currency: 'MXN'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Servicios opcionales (si los hay) */}
                        {serviciosOpcionales.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Servicios opcionales disponibles
                                </h2>

                                <div className="space-y-3">
                                    {serviciosOpcionales.map((servicio, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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

                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-blue-800 text-sm">
                                        💡 Estos servicios se pueden agregar por separado. Contacta a tu coordinador para más información.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Columna lateral - Panel de pago */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <CotizacionClienteConPagos
                                cotizacion={cotizacion}
                                cliente={clienteEjemplo}
                                metodoPago={metodoPagoEjemplo}
                            />

                            {/* Información de contacto */}
                            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    ¿Necesitas ayuda?
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Teléfono</p>
                                            <p className="text-sm text-gray-600">55 1234 5678</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Email</p>
                                            <p className="text-sm text-gray-600">soporte@prosocial.mx</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Horario de atención</p>
                                            <p className="text-sm text-gray-600">Lun - Vie: 9:00 - 18:00</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <Link
                                        href="/cliente/soporte"
                                        className="block w-full text-center bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-lg transition-colors"
                                    >
                                        Contactar soporte
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
