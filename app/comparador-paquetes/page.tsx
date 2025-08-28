import { Suspense } from 'react'
import ComparadorPaquetes from './components/ComparadorPaquetes'

export const metadata = {
    title: 'Comparador de Paquetes - ProSocial Eventos',
    description: 'Compara tu cotización personalizada con nuestros paquetes preconfigurados'
}

export default function ComparadorPaquetesPage() {
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
                <ComparadorPaquetes />
            </Suspense>
        </div>
    )
}
