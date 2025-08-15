import React from 'react'
import { Metadata } from 'next';
import ListaEventosAprobados from './components/ListaEventosAprobados';
import { obtenerEventosSeguimientoPorEtapa } from '@/app/admin/_lib/actions/seguimiento';

export const metadata: Metadata = {
    title: 'Gestión de eventos - Seguimiento',
}

export default async function SeguimientoPage() {
    // Obtener datos iniciales en el servidor
    const eventosPorEtapa = await obtenerEventosSeguimientoPorEtapa();

    return (
        <ListaEventosAprobados
            eventosPorEtapaIniciales={eventosPorEtapa}
        />
    );
}
