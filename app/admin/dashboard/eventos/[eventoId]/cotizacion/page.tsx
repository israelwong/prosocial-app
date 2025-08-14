import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { obtenerDatosCotizacion } from '@/app/admin/_lib/actions/cotizacion/cotizacion.actions';
import CotizacionForm from './components/CotizacionForm';

export const metadata: Metadata = {
    title: 'Nueva Cotización',
    description: 'Crear nueva cotización para evento',
};

interface PageProps {
    params: Promise<{ eventoId: string }>;
    searchParams: Promise<{
        tipoEventoId?: string;
        paqueteId?: string;
    }>;
}

export default async function CotizacionPage({ params, searchParams }: PageProps) {
    const { eventoId } = await params;
    const { tipoEventoId, paqueteId } = await searchParams;

    try {
        // Cargar todos los datos necesarios de manera eficiente
        const datos = await obtenerDatosCotizacion(eventoId, tipoEventoId, paqueteId);

        // Validaciones adicionales
        if (!datos.evento) {
            notFound();
        }

        // Determinar el tipo de evento a usar
        const eventoTipoFinal = datos.tipoEventoSeleccionado ||
            datos.evento.EventoTipo ||
            datos.tiposEvento[0];

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
                                    Nueva Cotización
                                </h1>
                                <p className="text-zinc-400 mt-1">
                                    {datos.evento.Cliente.nombre} • {datos.evento.nombre || 'Evento sin nombre'}
                                </p>
                            </div>
                            <div className="text-right text-sm">
                                <div className="text-lg font-semibold text-amber-400 mb-1">
                                    {eventoTipoFinal.nombre}
                                </div>
                                {datos.paqueteBase && (
                                    <div className="text-blue-400 text-sm">
                                        Basado en: {datos.paqueteBase.nombre}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Formulario Principal */}
                    <CotizacionForm
                        evento={datos.evento}
                        tiposEvento={datos.tiposEvento}
                        catalogo={datos.catalogo}
                        configuracion={datos.configuracion}
                        condiciones={datos.condiciones}
                        metodosPago={datos.metodosPago}
                        paqueteBase={datos.paqueteBase}
                        serviciosBase={datos.serviciosBase}
                        eventoTipoSeleccionado={eventoTipoFinal}
                        metadata={datos.metadata}
                    />
                </div>
            </div>
        );

    } catch (error: any) {
        console.error('Error al cargar página de cotización:', error);

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
