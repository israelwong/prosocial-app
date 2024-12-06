'use client'
import React, { useEffect, useState, useMemo, useCallback, memo } from 'react'
import { obtenerCotizacionesPorEvento } from '@/app/admin/_lib/cotizacion.actions'
import { obtenerPaquetesPorTipoEvento } from '@/app/admin/_lib/paquete.actions'
import { Evento, Cotizacion, Paquete } from '@/app/admin/_lib/types'
import { useRouter } from 'next/navigation'

interface Props {
    evento: Evento
    onClose: () => void
}

const ListaCotizaciones: React.FC<Props> = ({ evento, onClose }) => {

    const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
    const [paquetes, setPaquetes] = useState<Paquete[]>([])
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            if (evento.id && evento.eventoTipoId) {
                const [cotizacionesData, paquetesData] = await Promise.all([
                    obtenerCotizacionesPorEvento(evento.id),
                    obtenerPaquetesPorTipoEvento(evento.eventoTipoId)
                ])
                setCotizaciones(cotizacionesData)
                setPaquetes(paquetesData)
            }
        }
        fetchData()
    }, [evento.id, evento.eventoTipoId])

    const handleNuevaCotizacion = useCallback((paqueteId: string) => {
        router.push(`/admin/dashboard/cotizaciones/nueva?eventoId=${evento.id}&eventoTipoId=${evento.eventoTipoId}&&paqueteId=${paqueteId}`)
    }, [evento.id, evento.eventoTipoId, router])

    const cotizacionesRenderizadas = useMemo(() => {
        return cotizaciones.map(cotizacion => (
            <li key={cotizacion.id} className={`flex justify-between items-center relative ${cotizacion.status === 'pendiente' ? 'bg-zinc-900 rounded-md  p-5' : ''}`}>
                <div>
                    <p>{cotizacion.nombre}</p>
                    <p className='text-xl'>
                        {cotizacion.precio.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                    </p>
                    <p className='text-sm text-zinc-600'>
                        {cotizacion.createdAt ? new Date(cotizacion.createdAt).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }) : 'Fecha no disponible'}
                    </p>
                </div>
                <div className='space-x-2'>
                    <button className='bg-zinc-900 px-3 py-2 rounded-md border border-zinc-600 text-sm'
                        onClick={() => router.push(`/admin/dashboard/cotizaciones/${cotizacion.id}`)}>
                        Editar
                    </button>
                    <button className='bg-zinc-900 px-3 py-2 rounded-md border border-zinc-600 text-sm'
                        onClick={() => window.open(`/cotizacion/${cotizacion.id}`, '_blank')}
                    >
                        Compartir
                    </button>
                </div>
            </li>
        ))
    }, [cotizaciones, router])

    const paquetesRenderizados = useMemo(() => {
        return paquetes.map(paquete => (
            <option key={paquete.id} value={paquete.id}>
                {paquete.nombre}
            </option>
        ))
    }, [paquetes])

    return (
        <div>
            {evento.id ? (
                <div>
                    <div>
                        {/* header */}
                        <div className='flex justify-between items-center mb-5'>
                            <h2 className=' text-xl text-zinc-300'>
                                Cotizaciones {evento.nombre}
                            </h2>
                            <div className='flex'>
                                <button
                                    className='bg-zinc-900 px-3 py-2 rounded-md border border-zinc-600 text-sm mr-2'
                                >
                                    Compartir paquetes
                                </button>
                                <select
                                    className='opciones_cotizacion bg-zinc-900 px-3 py-2 rounded-md border border-zinc-600 text-sm mr-2'
                                    onChange={(e) => handleNuevaCotizacion(e.target.value)}
                                >
                                    <option>Opciones para crear cotización</option>
                                    {paquetesRenderizados}
                                    <option value="personalizada">Personalizada</option>
                                </select>
                                <button
                                    onClick={onClose}
                                    className='bg-zinc-900 px-3 py-2 rounded-md border border-zinc-600 text-sm'>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                        {/* content */}
                        <div className='grid grid-cols-3 gap-4'>
                            <div className='col-span-2'>
                                {cotizaciones.length > 0 ? (
                                    <ul>
                                        {cotizacionesRenderizadas}
                                    </ul>
                                ) : (
                                    <p>No hay cotizaciones disponibles.</p>
                                )}
                            </div>
                            <div>
                                <div className='bg-zinc-900 px-3 py-2 rounded-md border border-zinc-800 text-sm'>
                                    Se compatió el paquete
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                ''
            )}
        </div>
    )
}

export default memo(ListaCotizaciones)