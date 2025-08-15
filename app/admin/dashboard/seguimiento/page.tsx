import React from 'react'
import { Metadata } from 'next';
import ListaEventosAprobados from './components/ListaEventosAprobados';

export const metadata: Metadata = {
    title: 'Gestión de eventos',
}

export default function page() {
    return <ListaEventosAprobados />
}
