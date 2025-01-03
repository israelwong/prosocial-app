import React from 'react'
import { Metadata } from 'next'
import FormUsuarioEditar from '../components/FormUsuarioEditar'

export const metadata: Metadata = {
    title: 'Detalles de usuario',
}

export default async function page({ params }: { params: Promise<{ usuarioId: string }> }) {
    const { usuarioId } = await params;
    return <FormUsuarioEditar usuarioId={usuarioId} />
}
