import React from 'react'
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { obtenerCotizacionCompleta, obtenerDatosCotizacion } from '@/app/admin/_lib/actions/cotizacion/cotizacion.actions';
import CotizacionForm from '../components/CotizacionForm';
import { COTIZACION_STATUS } from '@/app/admin/_lib/constants/status';

export const metadata: Metadata = {
    title: 'Editar Cotización',
    description: 'Editar cotización existente',
}

interface PageProps {
    params: Promise<{
        eventoId: string;
        cotizacionId: string;
    }>
}

export default async function EditarCotizacionPage({ params }: PageProps) {
    const { eventoId, cotizacionId } = await params;

    try {
        // Cargar cotización existente y datos necesarios en paralelo
        const [cotizacionExistente, datosCotizacion] = await Promise.all([
            obtenerCotizacionCompleta(cotizacionId),
            obtenerDatosCotizacion(eventoId) // Sin parámetros adicionales para usar defaults
        ]);

        if (!cotizacionExistente) {
            notFound();
        }

        if (!datosCotizacion.evento) {
            notFound();
        }

        // Determinar el tipo de evento (similar a página de creación)
        const eventoTipoFinal = datosCotizacion.evento.EventoTipo ||
            datosCotizacion.tiposEvento[0];

        if (!eventoTipoFinal) {
            throw new Error('No se pudo determinar el tipo de evento');
        }

        return (
            <div className="min-h-screen bg-zinc-950">
                <div className="container mx-auto px-4 py-6">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-100">
                                    Editar Cotización
                                </h1>
                                <p className="text-zinc-400 mt-1">
                                    {datosCotizacion.evento.Cliente?.nombre ?? 'Sin cliente'} • {cotizacionExistente.cotizacion.nombre}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-semibold text-amber-400 mb-2">
                                    {eventoTipoFinal.nombre}
                                </div>
                                {/* Badge de status más prominente */}
                                <div className="inline-flex items-center gap-2">
                                    {cotizacionExistente.cotizacion.status === COTIZACION_STATUS.PENDIENTE && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-900/30 border border-yellow-600/30">
                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                            <span className="text-yellow-300 font-medium text-sm">Pendiente</span>
                                        </div>
                                    )}
                                    {cotizacionExistente.cotizacion.status === COTIZACION_STATUS.APROBADA && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-900/30 border border-green-600/30">
                                            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-green-300 font-medium text-sm">Aprobada</span>
                                        </div>
                                    )}
                                    {cotizacionExistente.cotizacion.status === COTIZACION_STATUS.AUTORIZADO && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-900/30 border border-blue-600/30">
                                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-blue-300 font-medium text-sm">Autorizada</span>
                                        </div>
                                    )}
                                    {cotizacionExistente.cotizacion.status === COTIZACION_STATUS.RECHAZADA && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-900/30 border border-red-600/30">
                                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            <span className="text-red-300 font-medium text-sm">Rechazada</span>
                                        </div>
                                    )}
                                    {/* Fallback para otros estados */}
                                    {![COTIZACION_STATUS.PENDIENTE, COTIZACION_STATUS.APROBADA, COTIZACION_STATUS.AUTORIZADO, COTIZACION_STATUS.RECHAZADA].includes(cotizacionExistente.cotizacion.status as any) && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-600">
                                            <div className="w-2 h-2 bg-zinc-400 rounded-full"></div>
                                            <span className="text-zinc-300 font-medium text-sm capitalize">{cotizacionExistente.cotizacion.status}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Formulario de Edición */}
                    <CotizacionForm
                        evento={datosCotizacion.evento}
                        tiposEvento={datosCotizacion.tiposEvento}
                        catalogo={datosCotizacion.catalogo}
                        configuracion={datosCotizacion.configuracion}
                        condiciones={datosCotizacion.condiciones}
                        metodosPago={datosCotizacion.metodosPago}
                        paqueteBase={null} // No hay paquete base en edición
                        serviciosBase={[]} // Los servicios vienen de la cotización existente
                        eventoTipoSeleccionado={eventoTipoFinal}
                        metadata={{
                            tienePaqueteBase: false,
                            tieneEventoTipoEspecifico: true,
                            totalServicios: datosCotizacion.metadata?.totalServicios || 0
                        }}
                        cotizacionExistente={cotizacionExistente.cotizacion}
                        modo="editar"
                    />
                </div>
            </div>
        );

    } catch (error: any) {
        // console.error('Error al cargar página de edición:', error);

        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-400 mb-2">
                        Error al cargar cotización
                    </h1>
                    <p className="text-zinc-400 mb-4">
                        {error?.message || 'Ha ocurrido un error inesperado'}
                    </p>
                    <a
                        href={`/admin/dashboard/eventos/${eventoId}`}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 bg-zinc-700 text-zinc-100 hover:bg-zinc-600"
                    >
                        Volver al evento
                    </a>
                </div>
            </div>
        );
    }
}
