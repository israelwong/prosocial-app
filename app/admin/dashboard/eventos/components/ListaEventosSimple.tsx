'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, User, Calendar, MapPin, Clock, FileText, Phone } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { EventoPorEtapa } from '@/app/admin/_lib/schemas/evento.schemas'
import { EventoEtapa } from '@/app/admin/_lib/actions/evento/eventoManejo/eventoManejo.schemas'
import { formatearFecha } from '@/app/admin/_lib/utils/fechas'
import { AGENDA_STATUS } from '@/app/admin/_lib/constants/status'

// Helper para formatear tiempo relativo
const formatearTiempoRelativo = (fecha: Date) => {
    const ahora = new Date()
    const diferencia = ahora.getTime() - fecha.getTime()
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))
    const horas = Math.floor(diferencia / (1000 * 60 * 60))
    const minutos = Math.floor(diferencia / (1000 * 60))

    if (dias > 0) return `hace ${dias}d`
    if (horas > 0) return `hace ${horas}h`
    if (minutos > 0) return `hace ${minutos}m`
    return 'ahora'
}

// Helper para calcular días hasta el evento
const calcularDiasHastaEvento = (fechaEvento: Date) => {
    const ahora = new Date()
    const fecha = new Date(fechaEvento)
    const diferencia = fecha.getTime() - ahora.getTime()
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24))

    if (dias < 0) return { dias: Math.abs(dias), estado: 'pasado' }
    if (dias === 0) return { dias: 0, estado: 'hoy' }
    if (dias <= 7) return { dias, estado: 'urgente' }
    if (dias <= 30) return { dias, estado: 'pronto' }
    return { dias, estado: 'lejano' }
}

interface ListaEventosSimpleProps {
    eventosIniciales: EventoPorEtapa[]
    etapas: EventoEtapa[]
}

export default function ListaEventosSimple({ eventosIniciales, etapas }: ListaEventosSimpleProps) {
    const router = useRouter()

    // Estados principales
    const [eventos, setEventos] = useState<EventoPorEtapa[]>(eventosIniciales)
    const [busqueda, setBusqueda] = useState<string>('')
    const [creandoEvento, setCreandoEvento] = useState(false)

    // Filtrar eventos
    const eventosFiltrados = eventos.filter(evento => {
        const coincideBusqueda = !busqueda ||
            evento.Cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            (evento.nombre?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
            (evento.Cliente.telefono?.toLowerCase() || '').includes(busqueda.toLowerCase())

        return coincideBusqueda
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
                                placeholder="Buscar por cliente, evento o teléfono..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Lista de eventos por etapa */}
                {eventosFiltrados.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-zinc-500 mb-4">
                            {busqueda ? 'No se encontraron eventos' : 'No hay eventos registrados'}
                        </div>
                        {!busqueda && (
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
                                        {eventosEtapa.map(evento => {
                                            const diasHastaEvento = calcularDiasHastaEvento(evento.fecha_evento)
                                            return (
                                                <div
                                                    key={evento.id}
                                                    onClick={() => handleVerEvento(evento.id)}
                                                    className="p-5 bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-700 rounded-lg cursor-pointer transition-all duration-200 space-y-3"
                                                >
                                                    {/* Header del evento */}
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h3 className="font-semibold text-zinc-100 text-base">
                                                                    {evento.nombre || 'Por configurar'}
                                                                </h3>
                                                                {evento.EventoTipo && (
                                                                    <span className="px-2.5 py-1 text-xs bg-zinc-700 text-zinc-300 rounded-md font-medium">
                                                                        {evento.EventoTipo.nombre}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Información del cliente */}
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2 text-sm text-zinc-400">
                                                                    <User className="h-4 w-4" />
                                                                    <span className="font-medium">{evento.Cliente.nombre}</span>
                                                                </div>
                                                                {evento.Cliente.telefono && (
                                                                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                                                                        <Phone className="h-4 w-4" />
                                                                        <span>{evento.Cliente.telefono}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Badge de días hasta el evento */}
                                                        <div className={`px-3 py-1.5 text-sm rounded-lg font-semibold ${diasHastaEvento.estado === 'pasado'
                                                                ? 'bg-red-900/50 text-red-300 border border-red-800'
                                                                : diasHastaEvento.estado === 'hoy'
                                                                    ? 'bg-purple-900/50 text-purple-300 border border-purple-800'
                                                                    : diasHastaEvento.estado === 'urgente'
                                                                        ? 'bg-orange-900/50 text-orange-300 border border-orange-800'
                                                                        : diasHastaEvento.estado === 'pronto'
                                                                            ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-800'
                                                                            : 'bg-blue-900/50 text-blue-300 border border-blue-800'
                                                            }`}>
                                                            {diasHastaEvento.estado === 'pasado'
                                                                ? `Hace ${diasHastaEvento.dias} días`
                                                                : diasHastaEvento.estado === 'hoy'
                                                                    ? 'Hoy'
                                                                    : `En ${diasHastaEvento.dias} días`
                                                            }
                                                        </div>
                                                    </div>

                                                    {/* Separador visual */}
                                                    <div className="border-t border-zinc-700/50"></div>

                                                    {/* Información de fecha y estado */}
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-zinc-400" />
                                                            <span className="text-sm text-zinc-400 font-medium">Fecha:</span>
                                                            <span className="text-sm text-zinc-200 font-medium">{formatearFecha(evento.fecha_evento, {
                                                                weekday: 'short',
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}</span>
                                                        </div>
                                                        {evento.Agenda && evento.Agenda.length > 0 && (
                                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${evento.Agenda[0].status === AGENDA_STATUS.CONFIRMADO
                                                                    ? 'bg-green-900/50 text-green-300 border border-green-800'
                                                                    : 'bg-yellow-900/50 text-yellow-300 border border-yellow-800'
                                                                }`}>
                                                                {evento.Agenda[0].status === AGENDA_STATUS.CONFIRMADO ? 'Confirmada' : 'Tentativa'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Última actividad */}
                                                    <div className="bg-zinc-800/50 p-3 rounded-md">
                                                        <div className="flex items-start gap-2">
                                                            <Clock className="h-4 w-4 text-zinc-500 mt-0.5" />
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-xs text-zinc-500 font-medium">Última actividad</span>
                                                                    {evento.EventoBitacora && evento.EventoBitacora.length > 0 && (
                                                                        <>
                                                                            <span className="text-xs text-zinc-400">
                                                                                {formatearTiempoRelativo(evento.EventoBitacora[0].createdAt)}
                                                                            </span>
                                                                            {evento.EventoBitacora[0].importancia !== '1' && (
                                                                                <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium ${evento.EventoBitacora[0].importancia === '3'
                                                                                        ? 'bg-red-900/50 text-red-300'
                                                                                        : 'bg-orange-900/50 text-orange-300'
                                                                                    }`}>
                                                                                    {evento.EventoBitacora[0].importancia === '3' ? 'Urgente' : 'Importante'}
                                                                                </span>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </div>
                                                                {evento.EventoBitacora && evento.EventoBitacora.length > 0 ? (
                                                                    <p className="text-sm text-zinc-300 leading-relaxed">
                                                                        {evento.EventoBitacora[0].comentario}
                                                                    </p>
                                                                ) : (
                                                                    <p className="text-sm text-zinc-500 italic">Sin actividad reciente</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
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
