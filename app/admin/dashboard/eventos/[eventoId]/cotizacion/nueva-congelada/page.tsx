import React from 'react'
import { redirect } from 'next/navigation'
// import FormCotizacionCongelada from '../components/FormCotizacionCongelada' // Componente eliminado en refactoring

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
        <div className="p-6">
            <h1 className="text-xl text-zinc-300 mb-4">Cotización Congelada</h1>
            <p className="text-zinc-500">Esta funcionalidad está siendo refactorizada.</p>
            {/* <FormCotizacionCongelada
                eventoId={eventoId}
                eventoTipoId={eventoTipoId}
                paqueteId={paqueteId}
            /> */}
        </div>
    )
}
