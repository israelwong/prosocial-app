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
                            <div className="text-right text-sm">
                                <div className="text-lg font-semibold text-amber-400 mb-1">
                                    {eventoTipoFinal.nombre}
                                </div>
                                <div className="text-blue-400 text-sm">
                                    {cotizacionExistente.cotizacion.status === COTIZACION_STATUS.PENDIENTE ? 'Pendiente' :
                                        cotizacionExistente.cotizacion.status === COTIZACION_STATUS.APROBADA ? 'Aprobada' : 'Rechazada'}
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
