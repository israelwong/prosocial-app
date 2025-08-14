import React from 'react'
import { Metadata } from 'next';
import EventoDetailView from './components/EventoDetailView';
import { obtenerEventoCompleto } from '@/app/admin/_lib/actions/evento/evento/evento.actions';

export const metadata: Metadata = {
    title: 'Detalles del evento',
}

interface PageProps { params: Promise<{ eventoId: string }> }

export default async function Page({ params }: PageProps) {
    const { eventoId } = await params;

    // Cargar datos iniciales del evento completo
    const eventoCompleto = await obtenerEventoCompleto(eventoId);
    console.log('Evento completo:', eventoCompleto);

    if (!eventoCompleto) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-zinc-100 mb-2">Evento no encontrado</h1>
                    <p className="text-zinc-400">El evento que buscas no existe o ha sido eliminado.</p>
                </div>
            </div>
        );
    }

    return <EventoDetailView eventoCompleto={eventoCompleto} />
}
