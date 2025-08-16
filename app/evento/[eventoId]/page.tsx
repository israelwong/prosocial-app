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

export default async function EventoPage({ params }: PageProps) {
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
                <div className="min-h-screen bg-zinc-900">
                    {/* Header móvil */}
                    <div className="bg-zinc-800 p-4 border-b border-zinc-700">
                        <h1 className="text-lg font-bold text-white">
                            {evento.nombre}
                        </h1>
                        <p className="text-zinc-400 text-sm">
                            {new Date(evento.fecha_evento).toLocaleDateString('es-MX', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </p>
                    </div>

                    {/* Contenido principal */}
                    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
                        <div className="max-w-sm w-full bg-zinc-800 p-6 rounded-lg text-center border border-zinc-700">
                            <div className="w-16 h-16 bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">
                                Sin cotizaciones disponibles
                            </h2>
                            <p className="text-zinc-400 mb-6 text-sm">
                                Aún no se han creado cotizaciones para este evento.
                            </p>
                            <div className="text-xs text-zinc-500 mb-6">
                                El equipo de ProSocial se pondrá en contacto contigo pronto.
                            </div>

                            {/* Botón de contacto */}
                            <a
                                href="https://wa.me/5544546582?text=Hola, me interesa información sobre mi evento"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z" />
                                </svg>
                                <span>Contactar por WhatsApp</span>
                            </a>
                        </div>
                    </div>
                </div>
            )
        }

        // Si solo hay una cotización, redirigir directamente
        if (cotizaciones.length === 1) {
            redirect(`/evento/${eventoId}/cotizacion/${cotizaciones[0].id}`)
        }

        // Si hay múltiples cotizaciones, mostrar lista
        return (
            <div className="min-h-screen bg-zinc-900">
                {/* Header móvil */}
                <div className="bg-zinc-800 p-4 border-b border-zinc-700 sticky top-0 z-10">
                    <h1 className="text-lg font-bold text-white">
                        Cotizaciones Disponibles
                    </h1>
                    <p className="text-zinc-400 text-sm">
                        {evento.nombre} - {new Date(evento.fecha_evento).toLocaleDateString('es-MX', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </p>
                </div>

                {/* Contenido principal */}
                <div className="p-4 pb-20 space-y-4">
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
