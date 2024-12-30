import React from 'react'
import { Metadata } from 'next';
import ListaEventosAprobados from './components/ListaEventosAprobados';

export const metadata: Metadata = {
    title: 'Seguimiento',
}

export default function page() {
    return <ListaEventosAprobados />
}
