'use client'
import React, { useState, useEffect, useMemo } from 'react'
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

// Componente para una tarjeta de agenda individual
const AgendaCard = ({ agenda, color, onClick }: { agenda: AgendaEvento, color: string, onClick: () => void }) => (
    <div
        onClick={onClick}
        className={`border border-zinc-800 hover:border-zinc-700 rounded-md p-3 transition-all duration-200 cursor-pointer group bg-zinc-900/50 hover:bg-zinc-800/50 border-l-4 ${color}`}
    >
        <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
                <h3 className="font-medium text-zinc-200 truncate mb-2">
                    {agenda.Evento.nombre}
                </h3>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                    {agenda.Evento.EventoTipo.nombre && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-900/50 text-blue-300 border border-blue-700/50">
                            {agenda.Evento.EventoTipo.nombre}
                        </span>
                    )}
                    {agenda.concepto && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-teal-900/50 text-teal-300 border border-teal-700/50 truncate" title={agenda.concepto}>
                            {agenda.concepto}
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-2 text-sm text-zinc-500">
                    {agenda.fecha && (
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                                {new Date(new Date(agenda.fecha).getTime() + new Date().getTimezoneOffset() * 60000).toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                })}
                            </span>
                        </div>
                    )}

                    {agenda.hora && (
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{agenda.hora}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>{agenda.User.username}</span>
                    </div>
                </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors duration-200 flex-shrink-0" />
        </div>
    </div>
);

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
                        nombre: agenda.Evento?.nombre ?? 'Sin nombre de evento',
                        EventoTipo: {
                            nombre: agenda.Evento?.EventoTipo?.nombre ?? 'Sin tipo'
                        }
                    },
                    User: {
                        username: agenda.User?.username ?? 'Sin asignar'
                    }
                }))
            )
            setLoading(false)
        })
    }, [])

    const getTipoAgendaColor = (tipo: string | null | undefined) => {
        switch (tipo?.toLowerCase()) {
            case 'evento': return 'border-l-purple-500';
            case 'sesion': case 'sesión': return 'border-l-green-500';
            case 'cita virtual': return 'border-l-blue-500';
            default: return 'border-l-zinc-500';
        }
    };

    const groupedAgenda = useMemo(() => {
        const filtered = agenda.filter(item => {
            if (item.status !== 'pendiente') return false;
            const lowerCaseSearchTerm = searchTerm.toLowerCase()
            return (
                item.Evento.nombre.toLowerCase().includes(lowerCaseSearchTerm) ||
                (item.concepto ?? '').toLowerCase().includes(lowerCaseSearchTerm) ||
                item.User.username.toLowerCase().includes(lowerCaseSearchTerm) ||
                (item.agendaTipo ?? '').toLowerCase().includes(lowerCaseSearchTerm) ||
                item.Evento.EventoTipo.nombre.toLowerCase().includes(lowerCaseSearchTerm)
            )
        });

        const grouped = filtered.reduce((acc, item) => {
            if (!item.fecha) return acc;
            const itemDate = new Date(new Date(item.fecha).getTime() + new Date().getTimezoneOffset() * 60000);
            const monthYear = itemDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
            const capitalizedMonthYear = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);

            if (!acc[capitalizedMonthYear]) {
                acc[capitalizedMonthYear] = [];
            }
            acc[capitalizedMonthYear].push(item);
            return acc;
        }, {} as Record<string, AgendaEvento[]>);

        for (const month in grouped) {
            grouped[month].sort((a, b) => new Date(a.fecha!).getTime() - new Date(b.fecha!).getTime());
        }

        const monthMap: { [key: string]: number } = { 'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11 };
        const sortedMonths = Object.keys(grouped).sort((a, b) => {
            const [monthA, yearA] = a.split(' de ');
            const [monthB, yearB] = b.split(' de ');
            const dateA = new Date(parseInt(yearA), monthMap[monthA.toLowerCase()]);
            const dateB = new Date(parseInt(yearB), monthMap[monthB.toLowerCase()]);
            return dateA.getTime() - dateB.getTime();
        });

        return { grouped, sortedMonths };
    }, [agenda, searchTerm]);

    if (loading) {
        return (
            <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="h-7 bg-zinc-800 rounded w-32 mb-2"></div>
                        <div className="h-4 bg-zinc-800 rounded w-48"></div>
                    </div>
                </div>
                <div className="h-10 bg-zinc-800 rounded w-full mb-6"></div>
                <div className="flex-1 flex space-x-4 overflow-hidden">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-80 flex-shrink-0 animate-pulse">
                            <div className="flex flex-col h-full bg-zinc-900/80 rounded-lg">
                                <div className="p-3 border-b border-zinc-800">
                                    <div className="h-5 bg-zinc-800 rounded w-1/2"></div>
                                    <div className="h-3 bg-zinc-800 rounded w-1/4 mt-2"></div>
                                </div>
                                <div className="p-3 space-y-3">
                                    <div className="h-24 bg-zinc-800 rounded"></div>
                                    <div className="h-24 bg-zinc-800 rounded"></div>
                                    <div className="h-24 bg-zinc-800 rounded"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-medium text-zinc-200">Agenda</h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        {agenda.filter(a => a.status === 'pendiente').length} eventos pendientes en total
                    </p>
                </div>
            </div>

            {/* Búsqueda */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                    type="text"
                    placeholder="Buscar en la agenda..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-200 text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                />
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden -mx-6 px-6">
                {groupedAgenda.sortedMonths.length > 0 ? (
                    <div className="flex h-full space-x-4 pb-4">
                        {groupedAgenda.sortedMonths.map(month => (
                            <div key={month} className="w-80 md:w-96 flex-shrink-0">
                                <div className="flex flex-col h-full bg-zinc-900/80 rounded-lg">
                                    <div className="p-3 border-b border-zinc-800 sticky top-0 bg-zinc-900/80 backdrop-blur-sm">
                                        <h3 className="font-semibold text-zinc-200 capitalize">{month}</h3>
                                        <p className="text-sm text-zinc-500">{groupedAgenda.grouped[month].length} Tareas</p>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                        {groupedAgenda.grouped[month].map(item => (
                                            <AgendaCard
                                                key={item.id}
                                                agenda={item}
                                                color={getTipoAgendaColor(item.agendaTipo)}
                                                onClick={() => router.push(`/admin/dashboard/seguimiento/${item.eventoId}`)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
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
                    </div>
                )}
            </div>
        </div>
    )
}
