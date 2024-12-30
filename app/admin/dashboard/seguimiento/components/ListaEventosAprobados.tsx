'use client'

import React, { useEffect } from 'react'
import { Evento } from '@/app/admin/_lib/types'
import { obtenerEventosAprobados } from '@/app/admin/_lib/evento.actions'
import { obtenerTipoEvento } from '@/app/admin/_lib/eventoTipo.actions'
import { useRouter } from 'next/navigation'

export default function ListaEventosAprobados() {

    const router = useRouter()
    const [eventos, setEventos] = React.useState<Evento[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const eventosAprobados = await obtenerEventosAprobados()

            const eventosConTipo = await Promise.all(eventosAprobados.map(async (evento) => {
                const eventoTipo = evento.eventoTipoId ? await obtenerTipoEvento(evento.eventoTipoId) : { nombre: 'Tipo desconocido' }
                return { ...evento, tipoEvento: eventoTipo?.nombre ?? 'Tipo desconocido' }
            }))
            setEventos(eventosConTipo)

        }
        fetchData()
    }, [])

    return (
        <div className=''>

            <h1 className='text-xl font-semibold mb-5'>
                Eventos aprobados
            </h1>

            <div className="grid grid-cols-1 gap-4 max-w-screen-sm ">
                {eventos.map(evento => (
                    <div key={evento.id} className="p-4 border border-zinc-800 rounded-lg shadow-md">

                        <div className='flex items-center'>

                            <span className='bg-zinc-800 text-yellow-500 px-2 py-1 rounded-full text-xs mr-1'>
                                {evento.tipoEvento}
                            </span>
                            <h2 className="text-xl font-bold">
                                {evento.nombre}
                            </h2>
                        </div>

                        <p className="text-gray-600">
                            {new Date(evento.fecha_evento).toLocaleString('es-ES', { dateStyle: 'full' })}
                        </p>
                        <p className="text-gray-600">{evento.status}</p>
                        <button
                            className='mt-2 bg-zinc-900 text-sm border border-zinc-800 text-white p-2 rounded-md'
                            onClick={() => {
                                router.push(`/admin/dashboard/seguimiento/${evento.id}`)
                            }
                            }>
                            Ver detalles
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
