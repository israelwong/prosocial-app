import React from 'react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { obtenerCotizacionesPorEvento } from '@/app/admin/_lib/cotizacion.actions'
import { obtenerEventoPorId } from '@/app/admin/_lib/evento.actions'
import ListaCotizaciones from './_components/ListaCotizaciones'
import EstadoDisponibilidad from './_components/EstadoDisponibilidad'

export const metadata: Metadata = {
    title: 'Cotizaciones del Evento'
}

interface PageProps { 
    params: Promise<{ eventoId: string }>
}

export default async function CotizacionesEventoPage({ params }: PageProps) {
    const { eventoId } = await params
    
    try {
        // Obtener información del evento
        const evento = await obtenerEventoPorId(eventoId)
        
        if (!evento) {
            redirect('/404')
        }

        // Verificar si el evento ya está contratado
        if (evento.status === 'contratado') {
            redirect('/cliente/login')
        }

        // Obtener cotizaciones del evento
        const cotizaciones = await obtenerCotizacionesPorEvento(eventoId)

        // Si no hay cotizaciones
        if (cotizaciones.length === 0) {
            return (
                <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
                    <div className="max-w-md w-full bg-zinc-800 p-8 rounded-lg text-center">
                        <div className="w-16 h-16 bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold text-white mb-2">Sin cotizaciones disponibles</h1>
                        <p className="text-zinc-400 mb-6">
                            Aún no se han creado cotizaciones para este evento.
                        </p>
                        <div className="text-sm text-zinc-500">
                            El equipo de ProSocial se pondrá en contacto contigo pronto.
                        </div>
                    </div>
                </div>
            )
        }

        // Si solo hay una cotización, redirigir directamente
        if (cotizaciones.length === 1) {
            redirect(`/evento/cotizacion/${eventoId}/cotizacion/${cotizaciones[0].id}`)
        }

        // Si hay múltiples cotizaciones, mostrar lista
        return (
            <div className="min-h-screen bg-zinc-900">
                <div className="max-w-4xl mx-auto p-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Cotizaciones Disponibles
                        </h1>
                        <p className="text-zinc-400">
                            Evento: {evento.nombre} - {new Date(evento.fecha_evento).toLocaleDateString()}
                        </p>
                    </div>

                    {/* Estado de disponibilidad */}
                    <EstadoDisponibilidad evento={evento} />

                    {/* Lista de cotizaciones */}
                    <ListaCotizaciones 
                        cotizaciones={cotizaciones} 
                        eventoId={eventoId}
                        evento={evento}
                    />
                </div>
            </div>
        )

    } catch (error) {
        console.error('Error al cargar cotizaciones:', error)
        redirect('/404')
    }
}
