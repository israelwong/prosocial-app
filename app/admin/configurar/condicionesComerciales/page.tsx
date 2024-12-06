import React from 'react'
import { Metadata } from 'next';
import ListaCondicionesComerciales from './components/ListaCondicionesComerciales';

export const metadata: Metadata = {
    title: 'Condiciones Comerciales',
}

export default function page() {
    return <ListaCondicionesComerciales />
}
