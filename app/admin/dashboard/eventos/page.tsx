import React from 'react'
import { Metadata } from 'next';
import ListaEventos from './components/ListaEventos';

export const metadata: Metadata = {
    title: 'Eventos en prospección',
}

export default function page() {
    return <ListaEventos />
}
