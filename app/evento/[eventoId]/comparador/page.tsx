import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { obtenerEventoCompleto } from '@/app/admin/_lib/actions/evento/evento.actions'
import ComparadorPaquetes from './components/ComparadorPaquetes'

export const metadata = {
    title: 'Comparador de Paquetes - ProSocial Eventos',
    description: 'Compara tu cotización personalizada con nuestros paquetes preconfigurados'
}

interface PageProps {
    params: Promise<{ eventoId: string }>
}

export default async function ComparadorPaquetesPage({ params }: PageProps) {
    const { eventoId } = await params

    // Verificar que el evento existe
    let evento;
    try {
        evento = await obtenerEventoCompleto(eventoId)
    } catch (error) {
        console.error('❌ Error al obtener evento:', error)
        redirect('/404')
    }

    if (!evento) {
        redirect('/404')
    }

    return (
        <div className="min-h-screen bg-zinc-900">
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-white text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p>Cargando comparador...</p>
                    </div>
                </div>
            }>
                <ComparadorPaquetes eventoId={eventoId} />
            </Suspense>
        </div>
    )
}
