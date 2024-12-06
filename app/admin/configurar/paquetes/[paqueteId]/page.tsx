import React from 'react'
import { Metadata } from 'next';
import FormPaqueteEditar from '../components/FormPaqueteEditar';

export const metadata: Metadata = {
    title: 'Configurar Paquete',
}

async function page({ params }: { params: Promise<{ paqueteId: string }> }) {
    const { paqueteId } = await params;
    return <FormPaqueteEditar paqueteId={paqueteId} />
}

export default page
