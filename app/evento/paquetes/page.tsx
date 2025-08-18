import React from 'react'
import { Metadata } from 'next'
import { obtenerPaquetesParaCliente } from '@/app/admin/_lib/actions/paquetes/paquetes.actions'
import PaquetesDisplay from './components/PaquetesDisplay'

export const metadata: Metadata = {
    title: 'Paquetes - Prosocial',
    description: 'Conoce nuestros paquetes diseñados especialmente para cada tipo de evento'
}

export default async function PaquetesPage() {
    try {
        const rawTiposEventoConPaquetes = await obtenerPaquetesParaCliente()

        // Adaptar los datos al tipo esperado por PaquetesDisplay
        const tiposEventoConPaquetes = rawTiposEventoConPaquetes.map((tipoEvento: any) => ({
            ...tipoEvento,
            Paquete: tipoEvento.Paquete.map((paquete: any) => ({
                ...paquete,
                PaqueteServicio: paquete.PaqueteServicio.map((paqueteServicio: any) => ({
                    ...paqueteServicio,
                    Servicio: {
                        ...paqueteServicio.Servicio,
                        ServicioCategoria: {
                            ...paqueteServicio.Servicio.ServicioCategoria,
                            seccionCategoria: paqueteServicio.Servicio.ServicioCategoria.seccionCategoria
                                ? {
                                    Seccion: {
                                        nombre: paqueteServicio.Servicio.ServicioCategoria.seccionCategoria.Seccion.nombre,
                                        posicion: paqueteServicio.Servicio.ServicioCategoria.seccionCategoria.Seccion.posicion,
                                    }
                                }
                                : undefined,
                        }
                    },
                    ServicioCategoria: {
                        ...paqueteServicio.ServicioCategoria,
                        seccionCategoria: paqueteServicio.ServicioCategoria?.seccionCategoria
                            ? {
                                Seccion: {
                                    nombre: paqueteServicio.ServicioCategoria.seccionCategoria.Seccion.nombre,
                                    posicion: paqueteServicio.ServicioCategoria.seccionCategoria.Seccion.posicion,
                                }
                            }
                            : undefined,
                    }
                }))
            }))
        }))

        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 py-20">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                            Nuestros Paquetes
                        </h1>
                        <p className="text-xl text-purple-100 max-w-3xl mx-auto">
                            Diseñados especialmente para cada tipo de evento,
                            con servicios seleccionados para crear momentos únicos e inolvidables
                        </p>
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <PaquetesDisplay tiposEventoConPaquetes={tiposEventoConPaquetes} />
                </div>
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
