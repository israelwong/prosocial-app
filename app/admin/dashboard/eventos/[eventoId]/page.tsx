import React from 'react'
import { Metadata } from 'next';
import FormEventoEditar from '../components/FormEventoEditarV2';

export const metadata: Metadata = {
    title: 'Detalles del evento',
}

export default async function Page({ params }: { params: Promise<{ eventoId: string }> }) {
    const { eventoId } = await params;
    return <FormEventoEditar eventoId={eventoId} />
}
