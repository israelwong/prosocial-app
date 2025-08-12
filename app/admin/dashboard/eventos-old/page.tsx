import React from 'react'
import { Metadata } from 'next';
import ListaEventos from './components/ListaEventos-v2';

export const metadata: Metadata = {
    title: 'Eventos en prospección',
}

export default function page() {
    return <ListaEventos />
}
