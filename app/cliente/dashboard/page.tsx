/**
 * Dashboard principal del cliente
 * Muestra todas sus cotizaciones y permite pagar las pendientes
 */

import React from 'react';
import Link from 'next/link';
import CotizacionClienteConPagos from '@/app/cliente/components/CotizacionConPagos';

// Estos tipos idealmente vendrían de tu sistema de tipos
interface Cotizacion {
    id: string;
    nombre: string;
    precio: number;
    status: 'pending' | 'aprobada' | 'en_revision' | 'cancelada';
    fecha_creacion: string;
    fecha_evento?: string;
    notas?: string;
}

interface Cliente {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
}

interface MetodoPago {
    id: string;
    nombre: string;
    tipo: string;
    msi_disponible: boolean;
    num_msi: number;
}

// Datos de ejemplo - en producción vendrían de tu API
const clienteEjemplo: Cliente = {
    id: 'cliente_123',
    nombre: 'María García',
    email: 'maria@example.com',
    telefono: '5544546582'
};

const cotizacionesEjemplo: Cotizacion[] = [
    {
        id: 'cot_123',
        nombre: 'Paquete Complete - XV Años',
        precio: 67500,
        status: 'pending',
        fecha_creacion: '2025-01-15',
        fecha_evento: '2025-03-15',
        notas: 'Celebración de XV años con 150 invitados'
    },
    {
        id: 'cot_124',
        nombre: 'Paquete Platinum - Boda',
        precio: 125000,
        status: 'aprobada',
        fecha_creacion: '2025-01-10',
        fecha_evento: '2025-06-20',
        notas: 'Boda en jardín con 200 invitados'
    },
    {
        id: 'cot_125',
        nombre: 'Paquete Essential - Cumpleaños',
        precio: 35000,
        status: 'en_revision',
        fecha_creacion: '2025-01-12',
        fecha_evento: '2025-02-28'
    }
];

const metodoPagoEjemplo: MetodoPago = {
    id: 'metodo_1',
    nombre: 'Tarjeta de Crédito',
    tipo: 'card',
    msi_disponible: true,
    num_msi: 12
};

function getStatusBadge(status: string) {
    const configs = {
        pending: {
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            label: 'Pendiente de pago'
        },
        aprobada: {
            bg: 'bg-green-100',
            text: 'text-green-800',
            label: 'Pagada y confirmada'
        },
        en_revision: {
            bg: 'bg-blue-100',
            text: 'text-blue-800',
            label: 'En revisión'
        },
        cancelada: {
            bg: 'bg-red-100',
            text: 'text-red-800',
            label: 'Cancelada'
        }
    };

    const config = configs[status as keyof typeof configs] || configs.en_revision;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            {config.label}
        </span>
    );
}

export default function ClienteDashboard() {
    const cotizacionesPendientes = cotizacionesEjemplo.filter(c => c.status === 'pending');
    const cotizacionesAprobadas = cotizacionesEjemplo.filter(c => c.status === 'aprobada');
    const cotizacionesEnRevision = cotizacionesEjemplo.filter(c => c.status === 'en_revision');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Bienvenido, {clienteEjemplo.nombre}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Gestiona tus cotizaciones y realiza pagos de forma segura
                            </p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Link
                                href="/cliente/perfil"
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                            >
                                Mi Perfil
                            </Link>
                            <Link
                                href="/cliente/historial"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Ver Historial
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                                <p className="text-2xl font-bold text-gray-900">{cotizacionesPendientes.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Confirmadas</p>
                                <p className="text-2xl font-bold text-gray-900">{cotizacionesAprobadas.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">En Revisión</p>
                                <p className="text-2xl font-bold text-gray-900">{cotizacionesEnRevision.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Invertido</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {cotizacionesAprobadas.reduce((sum, c) => sum + c.precio, 0).toLocaleString('es-MX', {
                                        style: 'currency',
                                        currency: 'MXN',
                                        minimumFractionDigits: 0
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cotizaciones pendientes de pago */}
                {cotizacionesPendientes.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Cotizaciones pendientes de pago
                        </h2>

                        <div className="space-y-6">
                            {cotizacionesPendientes.map((cotizacion) => (
                                <CotizacionClienteConPagos
                                    key={cotizacion.id}
                                    cotizacion={cotizacion}
                                    cliente={clienteEjemplo}
                                    metodoPago={metodoPagoEjemplo}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Todas las cotizaciones */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                        Todas mis cotizaciones
                    </h2>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cotización
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Precio
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha Evento
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {cotizacionesEjemplo.map((cotizacion) => (
                                        <tr key={cotizacion.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {cotizacion.nombre}
                                                    </div>
                                                    {cotizacion.notas && (
                                                        <div className="text-sm text-gray-500">
                                                            {cotizacion.notas}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(cotizacion.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {cotizacion.precio.toLocaleString('es-MX', {
                                                    style: 'currency',
                                                    currency: 'MXN'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {cotizacion.fecha_evento ?
                                                    new Date(cotizacion.fecha_evento).toLocaleDateString('es-MX') :
                                                    'Por definir'
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/cliente/cotizaciones/${cotizacion.id}`}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    Ver detalles
                                                </Link>
                                                {cotizacion.status === 'pending' && (
                                                    <Link
                                                        href={`/cliente/cotizaciones/${cotizacion.id}/pagar`}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Pagar ahora
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
