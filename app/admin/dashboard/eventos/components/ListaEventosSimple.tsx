'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, User, Calendar, MapPin, Clock, FileText } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { EventoPorEtapa } from '@/app/admin/_lib/schemas/evento.schemas'
import { EventoEtapa } from '@/app/admin/_lib/actions/evento/eventoManejo/eventoManejo.schemas'
import { formatearFecha } from '@/app/admin/_lib/utils/fechas'

interface ListaEventosSimpleProps {
    eventosIniciales: EventoPorEtapa[]
    etapas: EventoEtapa[]
}

export default function ListaEventosSimple({ eventosIniciales, etapas }: ListaEventosSimpleProps) {
    const router = useRouter()

    // Estados principales
    const [eventos, setEventos] = useState<EventoPorEtapa[]>(eventosIniciales)
    const [busqueda, setBusqueda] = useState<string>('')
    const [filtroEtapa, setFiltroEtapa] = useState<string>('')
    const [creandoEvento, setCreandoEvento] = useState(false)

    // Filtrar eventos
    const eventosFiltrados = eventos.filter(evento => {
        const coincideBusqueda = !busqueda ||
            evento.Cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            (evento.nombre?.toLowerCase() || '').includes(busqueda.toLowerCase())

        const coincideEtapa = !filtroEtapa || evento.eventoEtapaId === filtroEtapa

        return coincideBusqueda && coincideEtapa
    })

    // Agrupar eventos por etapa
    const eventosPorEtapa = etapas.map(etapa => ({
        etapa,
        eventos: eventosFiltrados.filter(evento => evento.eventoEtapaId === etapa.id)
    }))

    const handleCrearEvento = () => {
        setCreandoEvento(true)
        router.push('/admin/dashboard/eventos/nuevo')
    }

    const handleVerEvento = (eventoId: string) => {
        router.push(`/admin/dashboard/eventos/${eventoId}`)
    }

    const totalEventos = eventosFiltrados.length
    const eventosConCotizaciones = eventosFiltrados.filter(e => e.Cotizacion && e.Cotizacion.length > 0).length
    const eventosSinCotizaciones = eventosFiltrados.filter(e => !e.Cotizacion || e.Cotizacion.length === 0).length

    return (
        <div className="min-h-screen bg-zinc-950 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-zinc-100">Eventos</h1>
                            <p className="text-zinc-400 mt-1">Gestión de promesas y seguimiento</p>
                        </div>
                        <Button
                            onClick={handleCrearEvento}
                            disabled={creandoEvento}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {creandoEvento ? 'Creando...' : 'Nuevo Evento'}
                        </Button>
                    </div>

                    {/* Métricas simples */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                            <div className="text-2xl font-bold text-zinc-100">{totalEventos}</div>
                            <div className="text-sm text-zinc-400">Total Eventos</div>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                            <div className="text-2xl font-bold text-green-400">{eventosConCotizaciones}</div>
                            <div className="text-sm text-zinc-400">Con Cotizaciones</div>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                            <div className="text-2xl font-bold text-yellow-400">{eventosSinCotizaciones}</div>
                            <div className="text-sm text-zinc-400">Sin Cotizaciones</div>
                        </div>
                    </div>

                    {/* Filtros simples */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Buscar por cliente o evento..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <select
                            value={filtroEtapa}
                            onChange={(e) => setFiltroEtapa(e.target.value)}
                            className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Todas las etapas</option>
                            {etapas.map((etapa) => (
                                <option key={etapa.id} value={etapa.id}>
                                    {etapa.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Lista de eventos por etapa */}
                {eventosFiltrados.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-zinc-500 mb-4">
                            {busqueda || filtroEtapa ? 'No se encontraron eventos' : 'No hay eventos registrados'}
                        </div>
                        {!busqueda && !filtroEtapa && (
                            <Button onClick={handleCrearEvento} disabled={creandoEvento}>
                                Crear tu primer evento
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {eventosPorEtapa.map(({ etapa, eventos: eventosEtapa }) => (
                            eventosEtapa.length > 0 && (
                                <div key={etapa.id} className="bg-zinc-900/30 border border-zinc-800 rounded-lg">
                                    <div className="p-4 border-b border-zinc-800">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-lg font-semibold text-zinc-200">{etapa.nombre}</h2>
                                            <span className="px-2 py-1 bg-zinc-700 text-zinc-300 text-sm rounded-full">
                                                {eventosEtapa.length}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                                        {eventosEtapa.map(evento => (
                                            <div
                                                key={evento.id}
                                                onClick={() => handleVerEvento(evento.id)}
                                                className="p-4 bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-700 rounded-lg cursor-pointer transition-colors"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-zinc-200 mb-1">
                                                            {evento.nombre || 'Por configurar'}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                                                            <User className="h-3 w-3" />
                                                            <span>{evento.Cliente.nombre}</span>
                                                        </div>
                                                    </div>
                                                    {evento.EventoTipo && (
                                                        <span className="px-2 py-1 text-xs bg-zinc-700 text-zinc-300 rounded">
                                                            {evento.EventoTipo.nombre}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between text-xs text-zinc-500">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{formatearFecha(evento.fecha_evento, {
                                                            weekday: 'short',
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-blue-400">
                                                        <FileText className="h-3 w-3" />
                                                        <span>{evento.Cotizacion?.length || 0} cotizaciones</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
