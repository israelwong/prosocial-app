import React from 'react'
import { Metadata } from 'next';
import ListaEventosSimple from './components/ListaEventosSimple';
import { getEventosPorEtapaConCotizaciones } from '@/app/admin/_lib/actions/eventos/eventos.actions';
import { obtenerEtapasPorPosicion } from '@/app/admin/_lib/actions/evento/eventoManejo/eventoManejo.actions';

export const metadata: Metadata = {
    title: 'Eventos - Lista',
}

export default async function page() {
    // Obtener datos iniciales del servidor
    const filtroEtapas = [1, 2] // Nuevo y Seguimiento por defecto

    const [etapas, eventos] = await Promise.all([
        obtenerEtapasPorPosicion(filtroEtapas),
        getEventosPorEtapaConCotizaciones(filtroEtapas)
    ])

    return (
        <ListaEventosSimple
            eventosIniciales={eventos}
            etapas={etapas}
        />
    )
}
