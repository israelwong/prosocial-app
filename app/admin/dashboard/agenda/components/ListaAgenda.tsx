'use client'
import React, { useState, useEffect } from 'react'
import { obtenerAgendaConEventos } from '@/app/admin/_lib/agenda.actions'
import { Agenda } from '@/app/admin/_lib/types'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Search, ChevronRight, User } from 'lucide-react'

interface AgendaEvento extends Agenda {
    Evento: {
        nombre: string
        EventoTipo: {
            nombre: string
        }
    }
    User: {
        username: string
    }
}

export default function ListaAgenda() {
    const [agenda, setAgenda] = useState<AgendaEvento[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const router = useRouter()

    useEffect(() => {
        setLoading(true)
        obtenerAgendaConEventos().then((data) => {
            setAgenda(
                data.map((agenda: any): AgendaEvento => ({
                    ...agenda,
                    Evento: {
                        ...agenda.Evento,
                        nombre: agenda.Evento?.nombre ?? '',
                        EventoTipo: {
                            nombre: agenda.Evento?.EventoTipo?.nombre ?? ''
                        }
                    },
                    User: {
                        username: agenda.User?.username ?? ''
                    }
                }))
            )
            setLoading(false)
        })
    }, [])

    // Solo eventos pendientes
    const eventosPendientes = agenda.filter(agenda => agenda.status === 'pendiente')

    // Función para obtener colores según el tipo de agenda
    const getTipoAgendaColor = (tipo: string | null | undefined) => {
        switch (tipo?.toLowerCase()) {
            case 'evento':
                return {
                    badge: 'bg-purple-900/30 text-purple-400 border border-purple-700/50',
                    border: 'border-l-purple-500'
                };
            case 'sesion':
            case 'sesión':
                return {
                    badge: 'bg-green-900/30 text-green-400 border border-green-700/50',
                    border: 'border-l-green-500'
                };
            case 'cita virtual':
                return {
                    badge: 'bg-blue-900/30 text-blue-400 border border-blue-700/50',
                    border: 'border-l-blue-500'
                };
            default:
                return {
                    badge: 'bg-zinc-900/30 text-zinc-400 border border-zinc-700/50',
                    border: 'border-l-zinc-500'
                };
        }
    };

    const filteredAgenda = eventosPendientes.filter(agenda => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase()
        return (
            agenda.Evento.nombre.toLowerCase().includes(lowerCaseSearchTerm) ||
            (agenda.concepto ?? '').toLowerCase().includes(lowerCaseSearchTerm) ||
            agenda.User.username.toLowerCase().includes(lowerCaseSearchTerm) ||
            (agenda.agendaTipo ?? '').toLowerCase().includes(lowerCaseSearchTerm) ||
            agenda.Evento.EventoTipo.nombre.toLowerCase().includes(lowerCaseSearchTerm) ||
            (agenda.fecha && new Date(agenda.fecha).toLocaleDateString('es-ES').toString().includes(searchTerm))
        )
    })

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="border border-zinc-800 rounded-md p-3 animate-pulse">
                            <div className="flex justify-between items-start mb-2">
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
                                    <div className="h-3 bg-zinc-800 rounded w-1/4"></div>
                                </div>
                                <div className="h-4 bg-zinc-800 rounded w-16"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-medium text-zinc-200">
                        Agenda
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        {eventosPendientes.length} eventos pendientes
                    </p>
                </div>
            </div>

            {/* Búsqueda */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                    type="text"
                    placeholder="Buscar eventos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-200 text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                />
            </div>

            {/* Lista de eventos */}
            {filteredAgenda.length > 0 ? (
                <div className="space-y-2">
                    {filteredAgenda.map((agenda, index) => (
                        <div
                            key={index}
                            onClick={() => router.push(`/admin/dashboard/seguimiento/${agenda.eventoId}`)}
                            className={`border border-zinc-800 hover:border-zinc-700 rounded-md p-3 transition-colors duration-200 cursor-pointer group border-l-4 ${getTipoAgendaColor(agenda.agendaTipo).border}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-medium text-zinc-200 truncate">
                                            {agenda.Evento.nombre}
                                        </h3>
                                        <span className="px-2 py-0.5 text-xs rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700">
                                            {agenda.Evento.EventoTipo.nombre}
                                        </span>
                                    </div>

                                    {agenda.concepto && (
                                        <p className="text-sm text-zinc-300 mb-2 truncate">
                                            {agenda.concepto}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                                        {agenda.fecha && (
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>
                                                    {new Date(new Date(agenda.fecha).getTime() + new Date().getTimezoneOffset() * 60000).toLocaleDateString('es-ES', {
                                                        weekday: 'long',
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        )}

                                        {agenda.hora && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{agenda.hora}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            <span>{agenda.User.username}</span>
                                        </div>

                                        {agenda.agendaTipo && (
                                            <span className={`px-1.5 py-0.5 text-xs rounded ${getTipoAgendaColor(agenda.agendaTipo).badge}`}>
                                                {agenda.agendaTipo}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors duration-200 flex-shrink-0" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Calendar className="w-6 h-6 text-zinc-500" />
                    </div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-1">
                        No hay eventos pendientes
                    </h3>
                    <p className="text-sm text-zinc-600">
                        {searchTerm ? 'Intenta ajustar tu búsqueda' : 'No tienes eventos agendados próximamente'}
                    </p>
                </div>
            )}
        </div>
    )
}
