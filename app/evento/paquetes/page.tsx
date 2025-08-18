import React from 'react'
import { Metadata } from 'next'
import { obtenerPaquetesParaCliente } from '@/app/admin/_lib/actions/paquetes/paquetes.actions'
import PaquetesContainer from './components/PaquetesContainer'

export const metadata: Metadata = {
    title: 'Paquetes - Prosocial',
    description: 'Conoce nuestros paquetes diseñados especialmente para cada tipo de evento'
}

export default async function PaquetesPage() {
    try {
        const tiposEventoConPaquetes = await obtenerPaquetesParaCliente()

        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
                <PaquetesContainer tiposEventoConPaquetes={tiposEventoConPaquetes} />
            </div>
        )
    } catch (error) {
        console.error('Error al cargar paquetes:', error)
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">
                        Error al cargar paquetes
                    </h1>
                    <p className="text-zinc-400">
                        Por favor, intenta nuevamente más tarde.
                    </p>
                </div>
            </div>
        )
    }
}
