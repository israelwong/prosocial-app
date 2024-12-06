import React from 'react'
import { Metadata } from 'next';


export const metadata: Metadata = {
    title: 'Configurar Paquete',
}

async function page({ params }: { params: Promise<{ clienteId: string }> }) {
    const { clienteId } = await params;
    return (
        <div>
            <h1>Configurar cliente</h1>
            <p>Cliente ID: {clienteId}</p>
        </div>
    )
}

export default page
