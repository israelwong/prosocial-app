/**
 * Página de éxito de pagos para el portal del cliente
 * Reutiliza la lógica de la página pública con tema del cliente
 */

'use client'
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { obtenerPagoSesionStripe } from '@/app/admin/_lib/actions/pagos';
import { Pago as PagoType, Cliente as ClienteType } from '@/app/admin/_lib/types';
import { PagoLoadingSkeleton } from '../../../components/ui/skeleton';

export default function PagoExitosoCliente() {
    const searchParams = useSearchParams();
    const sessionId = searchParams ? searchParams.get('session_id') : null;
    const cotizacionId = searchParams ? searchParams.get('cotizacionId') : null;
    const [pago, setPago] = useState<PagoType | null>(null);
    const [cliente, setCliente] = useState<ClienteType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sessionId) {
            obtenerPagoSesionStripe(sessionId).then((response) => {
                setPago(response.pago);
                setCliente(response.cliente);
                setLoading(false);
            });
        }
    }, [sessionId]);

    const handleVolverACotizacion = () => {
        if (cotizacionId) {
            window.location.href = `/cliente/cotizaciones/${cotizacionId}`;
        } else {
            window.location.href = '/cliente/dashboard';
        }
    };

    if (loading) {
        return <PagoLoadingSkeleton />
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header de éxito */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            ¡Pago procesado exitosamente!
                        </h1>
                        <p className="text-gray-600">
                            Hola {cliente?.nombre}, tu pago ha sido confirmado.
                        </p>
                    </div>
                </div>

                {/* Detalles del pago */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Detalles del pago
                    </h2>

                    <div className="space-y-3">
                        <div className="flex justify-between py-2">
                            <span className="text-gray-600">Monto:</span>
                            <span className="font-semibold text-gray-900">
                                {pago?.monto?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                            </span>
                        </div>

                        <div className="flex justify-between py-2">
                            <span className="text-gray-600">Concepto:</span>
                            <span className="font-medium text-gray-900">
                                {pago?.concepto}
                            </span>
                        </div>

                        <div className="flex justify-between py-2">
                            <span className="text-gray-600">Estado:</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Completado
                            </span>
                        </div>

                        <div className="flex justify-between py-2">
                            <span className="text-gray-600">Fecha:</span>
                            <span className="text-gray-900">
                                {new Date().toLocaleDateString('es-MX')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Información adicional */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="font-medium text-blue-900 mb-1">
                                Próximos pasos
                            </h3>
                            <p className="text-blue-700 text-sm">
                                Tu evento ha sido confirmado automáticamente y agregado a nuestra agenda.
                                Recibirás un correo electrónico con todos los detalles de tu servicio.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleVolverACotizacion}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                    >
                        Ver mi cotización
                    </button>

                    <button
                        onClick={() => window.location.href = '/cliente/dashboard'}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-colors"
                    >
                        Ir al panel principal
                    </button>
                </div>

                {/* Contacto */}
                <div className="text-center mt-8">
                    <p className="text-gray-600 mb-4">
                        ¿Tienes alguna pregunta sobre tu evento?
                    </p>
                    <a
                        href="https://wa.me/5544546582?text=Hola, tengo una consulta sobre mi evento"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z" />
                        </svg>
                        Contactar por WhatsApp
                    </a>
                </div>
            </div>
        </div>
    );
}
