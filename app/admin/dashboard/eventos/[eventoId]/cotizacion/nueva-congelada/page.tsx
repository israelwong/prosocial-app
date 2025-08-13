import React from 'react'
import { redirect } from 'next/navigation'
import FormCotizacionCongelada from '../components/FormCotizacionCongelada'

interface Props {
    params: Promise<{ eventoId: string }>
    searchParams: Promise<{ paqueteId?: string; eventoTipoId?: string }>
}

export default async function NuevaCotizacionPage({ params, searchParams }: Props) {
    const { eventoId } = await params
    const { paqueteId, eventoTipoId } = await searchParams

    // Validar parámetros requeridos
    if (!eventoTipoId) {
        redirect(`/admin/dashboard/eventos/${eventoId}`)
    }

    return (
        <FormCotizacionCongelada
            eventoId={eventoId}
            eventoTipoId={eventoTipoId}
            paqueteId={paqueteId}
        />
    )
}
