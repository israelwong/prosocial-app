'use client'
import React, { useEffect, useState, useMemo, useCallback, memo } from 'react'
import { obtenerCotizacionesPorEvento } from '@/app/admin/_lib/cotizacion.actions'
import { obtenerPaquetesPorTipoEvento } from '@/app/admin/_lib/paquete.actions'
import { Evento, Cotizacion, Paquete } from '@/app/admin/_lib/types'
import { useRouter } from 'next/navigation'
import { Copy, SquareArrowOutUpRight, Pencil } from 'lucide-react'
import { Cliente } from '@/app/admin/_lib/types'

interface Props {
    evento: Evento
    cliente: Cliente
    onClose: () => void
}

const ListaCotizaciones: React.FC<Props> = ({ evento, cliente, onClose }) => {

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

    const handleShareCotizacion = useCallback(() => {

        const fecha_evento = new Date(evento.fecha_evento).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })

        const link_cotizacion = `https://www.prosocial.mx/cotizacion/${evento.id}`
        const mensaje = `Hola ${cliente.nombre}, te compartimos la cotización para el evento ${evento.tipoEvento} de ${evento.nombre} que celebrarás el ${fecha_evento}.\n\n${link_cotizacion}`

        //envia mensaje con link de whatsapp
        window.open(`https://wa.me/${cliente.telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')


        console.log(mensaje)
    }, [cliente, evento])

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
                <div className='space-x-6 items-center align-middle'>
                    <button
                        onClick={() => router.push(`/admin/dashboard/cotizaciones/${cotizacion.id}`)}
                    >
                        <Pencil />
                    </button>

                    <button
                        onClick={() => navigator.clipboard.writeText(`https://www.prosocial.mx/cotizacion/${cotizacion.id}`)}
                    >
                        <Copy />
                    </button>

                    <button
                        onClick={() => window.open(`/cotizacion/${cotizacion.id}`, '_blank')}
                    >
                        <SquareArrowOutUpRight />
                    </button>
                    <button
                        onClick={handleShareCotizacion}
                    >
                        <i className="fab fa-whatsapp text-2xl"></i>
                    </button>
                </div>
            </li >
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
                                {/* //! COmpartir paquetes */}
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