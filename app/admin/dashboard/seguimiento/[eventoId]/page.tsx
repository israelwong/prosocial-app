import React from 'react'
import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { obtenerEventoDetalleCompleto } from '@/app/admin/_lib/actions/seguimiento/seguimiento-detalle.actions'
import { obtenerUsuarios } from '@/app/admin/_lib/actions/users/users.actions'
import { HeaderSimple } from '@/app/admin/dashboard/seguimiento/[eventoId]/components/HeaderSimple'
import { BitacoraSimple } from '@/app/admin/dashboard/seguimiento/[eventoId]/components/BitacoraSimple'
import { BalanceFinancieroAvanzado } from '@/app/admin/dashboard/seguimiento/[eventoId]/components/BalanceFinancieroAvanzado'
import ServiciosAsociadosMinimalista from './components/ServiciosAsociadosMinimalista'
import FichaAgenda from '@/app/admin/dashboard/seguimiento/[eventoId]/components/FichaAgenda'

export const metadata: Metadata = {
    title: 'Detalle del evento',
}

interface PageProps {
    params: Promise<{ eventoId: string }>
}

export default async function Page({ params }: PageProps) {
    try {
        const { eventoId } = await params;

        // Validar que eventoId existe y tiene formato válido
        if (!eventoId || typeof eventoId !== 'string' || eventoId.trim() === '') {
            console.log(`⚠️ eventoId inválido: ${eventoId}, mostrando página not-found`);
            notFound();
        }

        // Cargar todos los datos del evento y usuarios en el servidor
        console.log(`🔄 Cargando datos del evento en el servidor: ${eventoId}`);

        let datos, usuarios;
        try {
            [datos, usuarios] = await Promise.all([
                obtenerEventoDetalleCompleto(eventoId.trim()),
                obtenerUsuarios()
            ]);
        } catch (dbError) {
            console.error('❌ Error al acceder a la base de datos:', dbError);
            notFound();
        }

        // Si el evento no se encuentra, mostrar página not-found
        if (!datos) {
            console.log(`⚠️ Evento ${eventoId} no encontrado en la base de datos, mostrando página not-found`);
            notFound();
        }

        // Mostrar datos con componentes V3 simples
        return (
            <div className="max-w-fit mx-auto p-6 space-y-6 bg-zinc-950 min-h-screen">
                {/* Header Simple */}
                <HeaderSimple
                    eventoNombre={datos.evento?.nombre || 'Evento sin nombre'}
                    eventoId={eventoId}
                    clienteNombre={datos.cliente?.nombre || undefined}
                    clienteTelefono={datos.cliente?.telefono || undefined}
                    tipoEvento={datos.tipoEvento?.nombre || undefined}
                    etapa={datos.etapaActual?.nombre || undefined}
                    fechaEvento={datos.evento?.fecha_evento}
                />

                {/* Grid de 3 columnas para distribución equilibrada */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

                    {/* Columna 1: Finanzas, Bitácora y Agenda */}
                    <div className='space-y-5'>
                        {/* Balance Financiero Avanzado con pestaña de costos integrada */}
                        <BalanceFinancieroAvanzado
                            cotizacion={datos.cotizacion ? {
                                ...datos.cotizacion,
                                evento: {
                                    id: eventoId,
                                    cotizaciones: [{
                                        id: datos.cotizacion.id || '',
                                        nombre: datos.cotizacion.nombre || `Cotización ${datos.cotizacion.id?.slice(-4) || 'N/A'}`
                                    }]
                                }
                            } as any : null}
                            pagos={datos.pagos as any}
                        />

                        {/* Bitácora del Evento */}
                        <BitacoraSimple eventoId={eventoId} />

                    </div>

                    {/* Columna 2: Servicios Asociados (completa) */}
                    <div className='space-y-5'>
                        <ServiciosAsociadosMinimalista
                            evento={{
                                ...datos.evento,
                                Cotizacion: datos.cotizacion ? [datos.cotizacion] : []
                            } as any}
                            usuarios={usuarios}
                        />
                    </div>

                    {/* Columna 3: TodoList y Multimedia */}
                    <div className='space-y-5'>

                        {/* Ficha de Agenda V3 */}
                        <FichaAgenda eventoId={eventoId} />

                        {/* Widget TodoList / Checklist */}
                        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
                            <h3 className="text-lg font-semibold text-zinc-100 mb-4">📋 Lista de Tareas</h3>
                            <div className="text-zinc-400 text-sm">
                                Componente TodoList en desarrollo...
                            </div>
                        </div>

                        {/* Widget Multimedia - Vista de repositorio */}
                        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
                            <h3 className="text-lg font-semibold text-zinc-100 mb-4">🎬 Repositorio Multimedia</h3>
                            <div className="space-y-3">
                                {/* Estructura visual del repositorio */}
                                <div className="text-sm text-zinc-300">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span>📁</span>
                                            <span className="font-medium">Fotografía</span>
                                        </div>
                                        <div className="ml-6 space-y-1 text-xs text-zinc-400">
                                            <div>📷 Fotos Sesión (0 archivos)</div>
                                            <div>✨ Fotos Retocadas (0 archivos)</div>
                                            <div>🎉 Fotos Evento (0 archivos)</div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span>📁</span>
                                            <span className="font-medium">Video</span>
                                        </div>
                                        <div className="ml-6 space-y-1 text-xs text-zinc-400">
                                            <div>💝 Video Remembranza (0 archivos)</div>
                                            <div>🎬 Video Extendido (0 archivos)</div>
                                            <div>📝 Video Resumen (0 archivos)</div>
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full mt-3 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm rounded-md transition-colors border border-zinc-700">
                                    🔧 Gestionar Repositorio
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        );

    } catch (error) {
        console.error('❌ Error crítico cargando página de detalle:', {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
            eventoId: (await params)?.eventoId || 'no disponible'
        });

        // En caso de cualquier error, redirigir al dashboard principal
        redirect('/admin/dashboard/seguimiento');
    }
}