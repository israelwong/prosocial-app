'use client'
import React, { useEffect, useState, useMemo } from 'react'
import { Evento } from '@/app/admin/_lib/types'
import { useRouter } from 'next/navigation'
import { CircleDollarSign, Calendar, CircleUserRound } from 'lucide-react'
import { obtenerEventosAprobadosV2 } from '@/app/admin/_lib/evento.actions'

interface EventoExtendido extends Evento {
    clienteNombre: string
    tipoEvento: string
    precio: number
    totalPagado: number
    balance: number
}

export default function ListaEventosAprobados() {
    const router = useRouter()
    const [filtro, setFiltro] = useState('')
    const [filtroBalance, setFiltroBalance] = useState<'todos' | 'pagados' | 'pendientes'>('todos')
    const [loading, setLoading] = useState(true)
    const [eventosAprobadosV2, setEventosAprobadosV2] = useState<EventoExtendido[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const eventosAprobadosV2 = await obtenerEventosAprobadosV2()
            setEventosAprobadosV2(eventosAprobadosV2)
            setLoading(false)
        }
        fetchData()
    }, [])

    const eventosFiltrados = useMemo(() => {
        return eventosAprobadosV2.filter(evento =>
            (evento.nombre?.toLowerCase().includes(filtro.toLowerCase()) ?? false) ||
            evento.clienteNombre.toLowerCase().includes(filtro.toLowerCase()) ||
            new Date(evento.fecha_evento).toLocaleString('es-ES', { dateStyle: 'full' }).includes(filtro) ||
            evento.tipoEvento.toLowerCase().includes(filtro.toLowerCase())
        ).filter(evento => {
            if (filtroBalance === 'pagados') return evento.balance === 0
            if (filtroBalance === 'pendientes') return evento.balance > 0
            return true
        })
    }, [eventosAprobadosV2, filtro, filtroBalance])

    if (loading) return (
        <div className='flex items-center justify-center h-screen'>
            <p className='text-zinc-500 text-center'>Cargando eventos aprobados...</p>
        </div>
    )

    return (
        <div className=''>
            <div className="grid grid-cols-1 gap-4 max-w-screen-sm mx-auto ">
                <h1 className='text-xl font-semibold mb-2'>
                    Gestión de eventos aprobados
                </h1>

                <div className='sticky top-0 mb-2'>
                    <input
                        type="text"
                        placeholder="Filtrar por nombre, cliente o fecha"
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        className="p-2 border border-zinc-800 rounded-md bg-zinc-900 text-white w-full mb-3"
                    />

                    <div className="flex justify-between gap-2 text-sm">
                        {['todos', 'pagados', 'pendientes'].map((estado) => (
                            <button
                                key={estado}
                                className={`p-2 rounded-md ${filtroBalance === estado ? 'w-full bg-blue-500 text-white' : 'w-full bg-zinc-950 text-white'}`}
                                onClick={() => setFiltroBalance(estado as 'todos' | 'pagados' | 'pendientes')}
                            >
                                {estado.charAt(0).toUpperCase() + estado.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {eventosFiltrados.map(evento => (
                    <div key={evento.id} className="p-4 border border-zinc-800 rounded-lg shadow-md flex justify-between cursor-pointer"
                        onClick={() => { router.push(`/admin/dashboard/seguimiento/${evento.id}`) }}
                    >
                        <div>
                            <div className='flex items-center mb-3'>
                                <span className='bg-zinc-800 text-yellow-500 px-2 py-1 rounded-full text-xs mr-1'>
                                    {evento.tipoEvento}
                                </span>
                                <button
                                    className='text-xl font-bold'
                                    onClick={() => {
                                        router.push(`/admin/dashboard/seguimiento/${evento.id}`)
                                    }}>
                                    {evento.nombre}
                                </button>
                            </div>

                            <p className="text-yellow-600 flex items-center">
                                <Calendar className='mr-1' size={16} />
                                {new Date(new Date(evento.fecha_evento).getTime() + new Date().getTimezoneOffset() * 60000).toLocaleString('es-ES', { dateStyle: 'full' })}
                            </p>

                            <p className='flex items-center'>
                                <CircleUserRound size={16} className='mr-1' /> {evento.clienteNombre}
                            </p>

                            <div className=''>
                                {evento.balance === 0 ? (
                                    <p className='flex items-center text-green-500'>
                                        <CircleDollarSign size={16} className='mr-1' /> Pagado
                                    </p>
                                ) : (
                                    <p className='flex items-center text-red-500'>
                                        <CircleDollarSign size={16} className='mr-1' /> {evento.balance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}