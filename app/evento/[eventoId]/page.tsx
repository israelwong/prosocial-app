import React from 'react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { obtenerCotizacionesParaEvento } from '@/app/admin/_lib/actions/cotizacion/cotizacion.actions'
import { obtenerEventoCompleto } from '@/app/admin/_lib/actions/evento/evento/evento.actions'
import ListaCotizaciones from './components/ListaCotizaciones'
import ListaPaquetes from './components/ListaPaquetes'
import Header from './components/Header'
import Footer from './components/Footer'
import FechaNoDisponible from './components/FechaNoDisponible'
import Image from 'next/image'

export const metadata: Metadata = {
    title: 'Cotizaciones - ProSocial Eventos'
}

interface PageProps {
    params: Promise<{ eventoId: string }>
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EventoPage({ params, searchParams }: PageProps) {
    const { eventoId } = await params

    // Obtener los search params si existen
    const sp = searchParams ? await searchParams : {}

    // Si viene con legacy parameter, limpiar la URL
    if (sp.legacy) {
        redirect(`/evento/${eventoId}`)
    }

    // Obtener datos completos del evento y validación de cotizaciones
    const [evento, resultadoCotizaciones] = await Promise.all([
        obtenerEventoCompleto(eventoId),
        obtenerCotizacionesParaEvento(eventoId)
    ])

    // Si el evento no existe
    if (!evento) {
        redirect('/404')
    }

    // Si hay error en la validación de cotizaciones
    if ('error' in resultadoCotizaciones) {
        redirect('/404')
    }

    // Si requiere login de cliente
    if (resultadoCotizaciones.requiereLogin) {
        redirect('/cliente/login')
    }

    // Calcular días restantes
    const fechaEvento = new Date(evento.fecha_evento)
    const hoy = new Date()
    const diasRestantes = Math.ceil((fechaEvento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

    // Fecha no disponible (fecha pasada)
    if (diasRestantes < 0) {
        return <FechaNoDisponible evento={evento} diasRestantes={diasRestantes} />
    }

    // Si la fecha no está disponible por otros motivos
    if (!resultadoCotizaciones.disponible) {
        return <FechaNoDisponible evento={evento} diasRestantes={diasRestantes} />
    }    // Si hay redirección automática (1 cotización)
    if (resultadoCotizaciones.accion === 'redireccion_automatica' && resultadoCotizaciones.cotizacionUnica) {
        redirect(`/evento/${eventoId}/cotizacion/${resultadoCotizaciones.cotizacionUnica.id}`)
    }

    // Si no hay cotizaciones
    if (resultadoCotizaciones.accion === 'sin_cotizaciones') {
        // Si hay paquetes, mostrarlos en el layout completo
        if (resultadoCotizaciones.paquetes && resultadoCotizaciones.paquetes.length > 0) {
            return (
                <div className="min-h-screen bg-gradient-to-b from-zinc-950/50 to-zinc-950/70 flex flex-col">
                    <Header evento={evento} disponible={true} diasRestantes={diasRestantes} />

                    {/* Hero Section */}
                    <section className="py-16">
                        <div className="max-w-4xl mx-auto px-4 text-center">
                            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                                Tenemos paquetes especiales para ti
                            </h2>
                            <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">
                                Para tu evento de <span className="font-semibold text-white">{evento.EventoTipo?.nombre}</span>
                                {' '}que se celebrará en <span className="font-semibold text-zinc-300">{diasRestantes} días</span>
                            </p>
                        </div>
                    </section>

                    {/* Lista de paquetes */}
                    <main className="flex-grow py-8">
                        <div className="max-w-5xl mx-auto px-4">
                            <ListaPaquetes
                                paquetes={resultadoCotizaciones.paquetes || []}
                                eventoId={eventoId}
                            />
                        </div>
                    </main>

                    <Footer />
                </div>
            )
        }

        // Si no hay paquetes ni cotizaciones, mostrar mensaje
        return (
            <div className="min-h-screen bg-zinc-900">
                {/* Header con logo y branding */}
                <header className="bg-zinc-800 shadow-lg border-b border-zinc-700">
                    <div className="max-w-4xl mx-auto px-4 py-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1">
                                    <img
                                        src="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/logotipo_blanco.svg"
                                        alt="ProSocial"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">ProSocial</h1>
                                    <p className="text-sm text-zinc-400">Momentos para toda la vida</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-zinc-400">{evento.Cliente?.nombre}</p>
                                <div className="bg-zinc-700 rounded-lg px-3 py-1 mt-1">
                                    <p className="text-xs text-zinc-300">
                                        {fechaEvento.toLocaleDateString('es-MX', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Contenido principal */}
                <main className="flex items-center justify-center min-h-[calc(100vh-140px)] p-4">
                    <div className="max-w-md w-full bg-zinc-800 p-8 rounded-xl shadow-xl text-center border border-zinc-700">
                        <div className="w-16 h-16 bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">
                            Estamos preparando tu cotización
                        </h2>
                        <p className="text-zinc-300 mb-6">
                            Nuestro equipo está trabajando en las mejores opciones para tu evento.
                        </p>
                        <div className="text-sm text-zinc-400 mb-8 p-4 bg-zinc-700/50 rounded-lg border border-zinc-600">
                            Te contactaremos pronto con las cotizaciones personalizadas.
                        </div>

                        {/* Botón de contacto */}
                        <a
                            href="https://wa.me/5544546582?text=Hola, me interesa información sobre mi evento"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z" />
                            </svg>
                            Contactar por WhatsApp
                        </a>
                    </div>
                </main>
            </div>
        )
    }

    // Si hay múltiples cotizaciones, mostrar lista
    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-950/50 to-zinc-950/70 flex flex-col">
            <Header evento={evento} disponible={true} diasRestantes={diasRestantes} />

            {/* Hero Section */}
            <section className="pt-16 pb-0">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                        {evento.Cliente?.nombre}
                    </h2>
                    <p className="text-xl text-zinc-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                        Te presentamos las cotizaciones que hemos preparado para tu evento de{' '}
                        <span className="font-semibold text-white">{evento.EventoTipo?.nombre}</span>
                        {' '}que se celebrará el{' '}
                        <span className="font-semibold text-zinc-300">
                            {fechaEvento.toLocaleDateString('es-MX', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </p>
                </div>
            </section>

            {/* Lista de cotizaciones y paquetes */}
            <main className="flex-grow py-8">
                <div className="max-w-5xl mx-auto px-4">
                    <ListaCotizaciones
                        cotizaciones={resultadoCotizaciones.cotizaciones || []}
                        eventoId={eventoId}
                        evento={evento}
                    />

                    {/* Lista de paquetes pre-diseñados */}
                    <ListaPaquetes
                        paquetes={resultadoCotizaciones.paquetes || []}
                        eventoId={eventoId}
                    />
                </div>
            </main>

            <Footer />
        </div>
    )
}