'use client'

import React, { useState, useEffect } from 'react'
import PaquetesDisplay from './PaquetesDisplay'
import EventoHeader from '@/app/evento/components/layout/EventoHeader'
import EventoFooter from '@/app/evento/components/layout/EventoFooter'
import { Package, MessageCircle, ArrowRight, Calendar } from 'lucide-react'

interface TipoEvento {
    id: string;
    nombre: string;
    Paquete: any[];
}

interface Props {
    tiposEventoConPaquetes: TipoEvento[];
}

interface EventoMetadata {
    eventoId: string;
    eventoTipoId: string;
    eventoTipoNombre: string;
    cotizacionId?: string;
}

export default function PaquetesContainer({ tiposEventoConPaquetes }: Props) {
    const [eventoMetadata, setEventoMetadata] = useState<EventoMetadata | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Intentar obtener metadata del evento desde sessionStorage
        const storedMetadata = sessionStorage.getItem('eventoMetadata')

        if (storedMetadata) {
            try {
                const metadata = JSON.parse(storedMetadata) as EventoMetadata
                setEventoMetadata(metadata)
            } catch (error) {
                console.error('Error parsing evento metadata:', error)
                setEventoMetadata(null)
            }
        }

        setLoading(false)
    }, [])

    // Si viene de un evento específico, filtrar paquetes por tipo de evento
    const paquetesFiltrados = eventoMetadata
        ? tiposEventoConPaquetes.filter(tipo => tipo.id === eventoMetadata.eventoTipoId)
        : []

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <EventoHeader />
                <div className="flex-grow flex items-center justify-center pt-16">
                    <div className="text-center">
                        <Package className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-pulse" />
                        <p className="text-zinc-400">Cargando paquetes...</p>
                    </div>
                </div>
                <EventoFooter />
            </div>
        )
    }

    // Si NO viene de un evento específico - mostrar mensaje de contacto
    if (!eventoMetadata) {
        return (
            <div className="min-h-screen flex flex-col">
                <EventoHeader />
                <div className="flex-grow flex items-center justify-center px-4 pt-16">
                    <div className="max-w-2xl mx-auto text-center">
                        {/* Header */}
                        <div className="mb-12">
                            <Package className="w-24 h-24 text-purple-400 mx-auto mb-8" />
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                                ¿Quieres más información de nuestros paquetes?
                            </h1>
                            <p className="text-xl text-zinc-300 leading-relaxed">
                                Tenemos paquetes especializados para cada tipo de evento.
                                Contáctanos hoy mismo y te ayudamos a elegir el paquete perfecto para ti.
                            </p>
                        </div>

                        {/* Beneficios */}
                        <div className="bg-zinc-800/50 rounded-xl p-8 mb-12 border border-zinc-700">
                            <h2 className="text-2xl font-bold text-white mb-6">
                                ¿Por qué elegir nuestros paquetes?
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <h3 className="text-white font-semibold mb-1">Diseñados para cada evento</h3>
                                        <p className="text-zinc-400 text-sm">XV años, bodas, bautizos y más</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <h3 className="text-white font-semibold mb-1">Servicios completos</h3>
                                        <p className="text-zinc-400 text-sm">Fotografía, video, entregables y más</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <h3 className="text-white font-semibold mb-1">Precios especiales</h3>
                                        <p className="text-zinc-400 text-sm">Mejores precios que servicios individuales</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <h3 className="text-white font-semibold mb-1">Fácil personalización</h3>
                                        <p className="text-zinc-400 text-sm">Adaptamos todo a tus necesidades</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div className="space-y-4">
                            <a
                                href="https://wa.me/5544546582?text=Hola, quiero información sobre sus paquetes para eventos"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
                            >
                                <MessageCircle className="w-6 h-6" />
                                Contactar por WhatsApp
                                <ArrowRight className="w-5 h-5" />
                            </a>

                            <p className="text-sm text-zinc-500">
                                Respuesta inmediata • Asesoría personalizada • Sin compromiso
                            </p>
                        </div>
                    </div>
                </div>
                <EventoFooter />
            </div>
        )
    }

    // Si SÍ viene de un evento específico - mostrar paquetes filtrados
    return (
        <div className="min-h-screen flex flex-col">
            <EventoHeader />

            {/* Header específico del tipo de evento */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 py-20 pt-32">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Paquetes para {eventoMetadata.eventoTipoNombre}
                    </h1>
                    <p className="text-xl text-purple-100 max-w-3xl mx-auto">
                        Descubre nuestros paquetes diseñados especialmente para hacer de tu {eventoMetadata.eventoTipoNombre.toLowerCase()}
                        un evento único e inolvidable
                    </p>

                    {/* Indicador de contexto */}
                    <div className="mt-8 inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 rounded-full px-4 py-2 text-purple-200">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Basado en tu tipo de evento</span>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    {paquetesFiltrados.length > 0 ? (
                        <PaquetesDisplay tiposEventoConPaquetes={paquetesFiltrados} />
                    ) : (
                        <div className="text-center py-12">
                            <Package className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-4">
                                Próximamente tendremos paquetes para {eventoMetadata.eventoTipoNombre}
                            </h2>
                            <p className="text-zinc-400 mb-8">
                                Mientras tanto, contáctanos para una cotización personalizada
                            </p>
                            <a
                                href={`https://wa.me/5544546582?text=Hola, me interesa una cotización para ${eventoMetadata.eventoTipoNombre}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Solicitar cotización personalizada
                            </a>
                        </div>
                    )}
                </div>
            </div>

            <EventoFooter />
        </div>
    )
}
