import React from 'react'
import { Metadata } from 'next';
import ListaEventosAprobados from './components/ListaEventosAprobados';
import { obtenerEventosSeguimientoPorEtapaListaAprobados } from '@/app/admin/_lib/actions/seguimiento';

export const metadata: Metadata = {
    title: 'Gestión de eventos - Seguimiento',
}

export default async function SeguimientoPage() {
    // Obtener datos iniciales en el servidor con precio de cotización correcto
    const eventosPorEtapa = await obtenerEventosSeguimientoPorEtapaListaAprobados();

    return (
        <ListaEventosAprobados
            eventosPorEtapaIniciales={eventosPorEtapa}
        />
    );
}
