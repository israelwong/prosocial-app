import React from 'react'
import { Metadata } from 'next';
import ListaEventosSimple from './components/ListaEventosSimple';
import { obtenerEventosPorEtapa } from '@/app/admin/_lib/evento.actions';
import { obtenerEtapasFiltradas } from '@/app/admin/_lib/EventoEtapa.actions';

export const metadata: Metadata = {
    title: 'Eventos - Lista',
}

export default async function page() {
    // Obtener datos iniciales del servidor
    const filtroEtapas = [1, 2] // Nuevo y Seguimiento por defecto

    const [etapas, eventos] = await Promise.all([
        obtenerEtapasFiltradas(filtroEtapas),
        obtenerEventosPorEtapa(filtroEtapas)
    ])

    return (
        <ListaEventosSimple
            eventosIniciales={eventos}
            etapasIniciales={etapas}
        />
    )
}
