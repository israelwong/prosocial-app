'use client'
import React, { useState, useEffect } from 'react'
import { obtenerAgendaConEventos } from '@/app/admin/_lib/agenda.actions'
import { Agenda } from '@/app/admin/_lib/types'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, ChevronRight } from 'lucide-react'

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
    const [selectedTab, setSelectedTab] = useState<'pendientes' | 'todos' | 'completado'>('pendientes')
    const [searchTerm, setSearchTerm] = useState('')
    const router = useRouter()

    useEffect(() => {
        setLoading(true)
        obtenerAgendaConEventos().then((data) => {
            setAgenda(data.map(agenda => ({
                ...agenda,
                Evento: {
                    ...agenda.Evento,
                    nombre: agenda.Evento.nombre || '',
                    EventoTipo: agenda.Evento.EventoTipo || { nombre: '' }
                },
                User: {
                    ...agenda.User,
                    username: agenda.User?.username || ''
                }
            })))
            setLoading(false)
        })
    }, [])

    const filteredAgenda = agenda.filter(agenda => {
        if (selectedTab === 'todos') return true
        if (selectedTab === 'pendientes') return agenda.status === 'pendiente'
        if (selectedTab === 'completado') return agenda.status === 'completado'
    }).filter(agenda => {
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
            <div className="flex items-center justify-center h-screen">
                <p className="text-zinc-400">
                    Cargando eventos agendados...
                </p>
            </div>
        )
    }

    return (
        <div className='max-w-md mx-auto'>
            <h1 className="text-xl text-zinc-300 mb-5 font-semibold">
                Agenda de eventos programados
            </h1>

            <div className="flex space-x-2 mb-5">
                <button onClick={() => setSelectedTab('pendientes')} className={`p-2 ${selectedTab === 'pendientes' ? 'bg-blue-700' : 'bg-zinc-800'} rounded-md w-full`}>
                    Pendientes
                </button>
                <button onClick={() => setSelectedTab('completado')} className={`p-2 ${selectedTab === 'completado' ? 'bg-yellow-700' : 'bg-zinc-800'} rounded-md w-full`}>
                    Completados
                </button>
                <button onClick={() => setSelectedTab('todos')} className={`p-2 ${selectedTab === 'todos' ? 'bg-yellow-700' : 'bg-zinc-800'} rounded-md w-full`}>
                    Todos
                </button>
            </div>

            <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-5 p-2 w-full rounded-md bg-zinc-800 text-zinc-300"
            />

            <div className="flex flex-col space-y-4">
                {filteredAgenda.map((agenda, index) => (
                    <button key={index} className="bg-zinc-900 p-3 rounded-md border border-zinc-700 text-left hover:bg-zinc-700"
                        onClick={() => router.push(`/admin/dashboard/seguimiento/${agenda.eventoId}`)}>
                        <div className="">

                            <div className='flex items-start justify-start mb-2 flex-col sm:flex-row'>
                                <div className='flex items-start justify-start mb-2 sm:mb-0 sm:mr-2'>
                                    <div
                                        className={`text-zinc-400 mr-2 text-sm border px-2 py-1 rounded-md inline-block ${agenda.agendaTipo === 'Evento' ? 'border-pink-500 text-pink-300' : agenda.agendaTipo === 'Cita virtual' ? 'border-yellow-500 text-yellow-300' : 'border-purple-500 text-purple-300'}`}>
                                        {agenda.agendaTipo}
                                    </div>

                                    <div className="text-sm text-zinc-400 border px-2 py-1 rounded-md inline-block border-zinc-700 mr-2">
                                        {agenda.Evento.EventoTipo.nombre}
                                    </div>
                                </div>

                                <h2 className="text-2xl text-zinc-400 text-left">
                                    {agenda.Evento.nombre}
                                </h2>
                            </div>
                        </div>
                        <ul>
                            {agenda.concepto && (
                                <li className='text-white flex items-start'>
                                    <span>
                                        <ChevronRight size={16} className='mr-2 mt-1' />
                                    </span>
                                    <p className='font-semibold'>
                                        {agenda.concepto}
                                    </p>
                                </li>
                            )}

                            {agenda.fecha && (
                                <li className='text-yellow-400 flex items-start'>
                                    <span>
                                        <Calendar size={16} className='mr-2 mt-1' />
                                    </span>
                                    {new Date(new Date(agenda.fecha).getTime() + new Date().getTimezoneOffset() * 60000).toLocaleString('es-ES', { dateStyle: 'full' })}
                                </li>
                            )}
                            {agenda.hora && (
                                <li className='text-red-400 flex items-start'>
                                    <span>
                                        <Clock size={16} className='mr-2 mt-1' />
                                    </span>
                                    {agenda.hora}
                                </li>
                            )}
                        </ul>
                        <p className='text-sm text-zinc-400 mt-2 italic'>
                            Agendado por: {agenda.User.username}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    )
}