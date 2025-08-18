import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { obtenerEventoDetalleCompleto } from '@/app/admin/_lib/actions/seguimiento/seguimiento-detalle.actions'
import { obtenerUsuarios } from '@/app/admin/_lib/actions/users/users.actions'
import { HeaderSimple } from '@/app/admin/dashboard/seguimiento/[eventoId]/components/HeaderSimple'
import { BitacoraSimple } from '@/app/admin/dashboard/seguimiento/[eventoId]/components/BitacoraSimple'
import { BalanceFinancieroAvanzado } from '@/app/admin/dashboard/seguimiento/[eventoId]/components/BalanceFinancieroAvanzado'
import ServiciosAsociados from '@/app/admin/dashboard/seguimiento/[eventoId]/components/ServiciosAsociados'
import FichaAgendaV3 from '@/app/admin/dashboard/seguimiento/[eventoId]/components/FichaAgendaV3'

export const metadata: Metadata = {
    title: 'Detalle del evento',
}

interface PageProps {
    params: Promise<{ eventoId: string }>
}

export default async function Page({ params }: PageProps) {
    try {
        const { eventoId } = await params;

        // Cargar todos los datos del evento y usuarios en el servidor
        console.log('🔄 Cargando datos del evento en el servidor:', eventoId);
        const [datos, usuarios] = await Promise.all([
            obtenerEventoDetalleCompleto(eventoId),
            obtenerUsuarios()
        ]);

        // Mostrar datos con componentes V3 simples
        return (
            <div className="max-w-7xl mx-auto p-6 space-y-6 bg-zinc-950 min-h-screen">
                {/* Header Simple */}
                <HeaderSimple
                    eventoNombre={datos.evento?.nombre || 'Evento sin nombre'}
                    eventoId={eventoId}
                    clienteNombre={datos.cliente?.nombre || undefined}
                    tipoEvento={datos.tipoEvento?.nombre || undefined}
                    etapa={datos.etapaActual?.nombre || undefined}
                    fechaEvento={datos.evento?.fecha_evento}
                />

                {/* Grid de información financiera y servicios */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className='space-y-5'>

                        {/* Balance Financiero Avanzado */}
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

                        {/* Ficha de Agenda V3 */}
                        <FichaAgendaV3 eventoId={eventoId} />

                        {/* Bitácora del Evento */}
                        <BitacoraSimple eventoId={eventoId} />
                    </div>

                    {/* Servicios Asociados */}
                    <ServiciosAsociados
                        evento={datos.evento as any}
                        usuarios={usuarios}
                    />
                </div>

            </div>
        );

    } catch (error) {
        console.error('❌ Error cargando página de detalle:', error);
        notFound();
    }
}