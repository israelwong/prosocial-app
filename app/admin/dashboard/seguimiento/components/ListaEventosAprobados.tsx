'use client'
import React, { useEffect, useState } from 'react'
import { Evento } from '@/app/admin/_lib/types'
import { obtenerEventosAprobados } from '@/app/admin/_lib/evento.actions'
import { obtenerTipoEvento } from '@/app/admin/_lib/eventoTipo.actions'
import { obtenerBalancePagosEvento } from '@/app/admin/_lib/pago.actions'
import { obtenerCliente } from '@/app/admin/_lib/cliente.actions'
import { useRouter } from 'next/navigation'
import { CircleDollarSign, Calendar, CircleUserRound } from 'lucide-react'

interface EventoExtendido extends Evento {
    clienteNombre: string
    tipoEvento: string
    precio: number
    totalPagado: number
    balance: number
}

export default function ListaEventosAprobados() {

    const router = useRouter()
    const [eventos, setEventos] = useState<EventoExtendido[]>([])
    const [filtro, setFiltro] = useState('')
    const [filtroBalance, setFiltroBalance] = useState<'todos' | 'pagados' | 'pendientes'>('todos')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const eventosAprobados = await obtenerEventosAprobados()
            const eventosConTipoYBalance = await Promise.all(eventosAprobados.map(async (evento) => {
                const eventoTipo = evento.eventoTipoId ? await obtenerTipoEvento(evento.eventoTipoId) : { nombre: 'Tipo desconocido' }
                const balancePagos = await obtenerBalancePagosEvento(evento.id)
                const cliente = await obtenerCliente(evento.clienteId)
                return {
                    ...evento,
                    clienteNombre: cliente ? cliente.nombre : 'Cliente desconocido',
                    tipoEvento: eventoTipo?.nombre ?? 'Tipo desconocido',
                    precio: balancePagos.precio,
                    totalPagado: balancePagos.totalPagado,
                    balance: balancePagos.balance ?? 0
                }
            }))
            setEventos(eventosConTipoYBalance)
            setLoading(false)
        }
        fetchData()

    }, [])

    const eventosFiltrados = eventos.filter(evento =>
        (evento.nombre?.toLowerCase().includes(filtro.toLowerCase()) ?? false) ||
        evento.clienteNombre.toLowerCase().includes(filtro.toLowerCase()) ||
        new Date(evento.fecha_evento).toLocaleString('es-ES', { dateStyle: 'full' }).includes(filtro) ||
        evento.tipoEvento.toLowerCase().includes(filtro.toLowerCase()
        )
    ).filter(evento => {
        if (filtroBalance === 'pagados') return evento.balance === 0
        if (filtroBalance === 'pendientes') return evento.balance > 0
        return true
    })

    if (loading) return <div>
        <div className='flex items-center justify-center py-20'>
            <p className='text-zinc-500 text-center flex items-center justify-center'>Cargando eventos aprobados...</p>
        </div>
    </div>

    return (
        <div className=''>
            <div className="grid grid-cols-1 gap-4 max-w-screen-sm mx-auto ">

                <h1 className='text-xl font-semibold mb-2'>
                    Seguimiento de eventos aprobados
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
                        <button
                            className={`p-2 rounded-md ${filtroBalance === 'todos' ? 'w-full bg-blue-500 text-white' : 'w-full bg-zinc-950 text-white'}`}
                            onClick={() => setFiltroBalance('todos')}
                        >
                            Todos
                        </button>
                        <button
                            className={`p-2 rounded-md ${filtroBalance === 'pagados' ? 'w-full bg-blue-500 text-white' : 'w-full bg-zinc-950 text-white'}`}
                            onClick={() => setFiltroBalance('pagados')}
                        >
                            Pagados
                        </button>
                        <button
                            className={`p-2 rounded-md ${filtroBalance === 'pendientes' ? 'w-full bg-blue-500 text-white' : 'w-full bg-zinc-950 text-white'}`}
                            onClick={() => setFiltroBalance('pendientes')}
                        >
                            Pendientes
                        </button>
                    </div>
                </div>

                {eventosFiltrados.map(evento => (
                    <div key={evento.id} className="p-4 border border-zinc-800 rounded-lg shadow-md flex justify-between"
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
                                    }
                                    }>
                                    {evento.nombre}
                                </button>

                            </div>

                            <p className="text-yellow-600 flex items-center">
                                <Calendar className='mr-1' size={16} /> {new Date(evento.fecha_evento).toLocaleString('es-ES', { dateStyle: 'full' })}
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