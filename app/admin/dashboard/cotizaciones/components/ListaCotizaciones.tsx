'use client'
import React, { useEffect, useState, useMemo, useCallback, memo } from 'react'
import { obtenerCotizacionesPorEvento, eliminarCotizacion } from '@/app/admin/_lib/cotizacion.actions'
import { obtenerTipoEvento } from '@/app/admin/_lib/eventoTipo.actions'
import { Evento, Cotizacion } from '@/app/admin/_lib/types'
import { Copy, SquareArrowOutUpRight, Pencil, Eye } from 'lucide-react'
import { Cliente } from '@/app/admin/_lib/types'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/admin/_lib/supabase'

interface Props {
    evento: Evento
    cliente: Cliente
}

interface CotizacionWithVisitas extends Cotizacion {
    visitas: number
}

const ListaCotizaciones: React.FC<Props> = ({ evento, cliente }) => {

    const [loading, setLoading] = useState(false)
    const [cotizaciones, setCotizaciones] = useState<CotizacionWithVisitas[]>([])
    const [eliminando, setEliminando] = useState(false)
    const [cantidadCotizaciones, setCantidadCotizaciones] = useState(0)
    const [eventoTipo, setEventoTipo] = useState<string>('')
    const router = useRouter()


    const suscripcionSupabase = () => {
        const subscription = supabase
            .channel('realtime:CotizacionVisita')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'CotizacionVisita' },
                async () => {
                    // console.log('Cambio detectado en CotizacionVisita:', payload);
                    if (evento.id) {
                        const cotizacionesUpdate = await obtenerCotizacionesPorEvento(evento.id)
                        setCotizaciones(cotizacionesUpdate)
                    }
                }
            ).subscribe((status, err) => {
                if (err) {
                    console.error('Error en la suscripción CotizacionVisita:', err);
                } else {
                    console.log('Estado de la suscripción en CotizacionVisita:', status);
                }
            });

        return () => {
            //! Eliminar la suscripción cuando el componente se desmonta
            supabase.removeChannel(subscription);
        };
    }

    useEffect(() => {
        const fetchData = async () => {
            if (evento.id) {
                setLoading(true)
                const cotizacionesData = await obtenerCotizacionesPorEvento(evento.id)
                setCantidadCotizaciones(cotizacionesData.length)
                setCotizaciones(cotizacionesData)
                const eventoTipoData = evento.eventoTipoId ? await obtenerTipoEvento(evento.eventoTipoId) : null
                setEventoTipo(eventoTipoData?.nombre || '')
                setLoading(false)
            }
        }

        fetchData()
        suscripcionSupabase()
    }, [evento.id])

    const handleShareCotizacion = useCallback(() => {
        const fecha_evento = new Date(evento.fecha_evento).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })

        const link_cotizacion = `https://www.prosocial.mx/cotizacion/${evento.id}`
        const mensaje = `Hola ${cliente.nombre}, te compartimos la cotización para el evento ${eventoTipo} de ${evento.nombre} que celebrarás el ${fecha_evento}.\n\n${link_cotizacion}`

        //envia mensaje con link de whatsapp
        window.open(`https://wa.me/${cliente.telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')

    }, [cliente, evento])

    const handleShareTodasLasCotizaciones = () => {
        const fecha_evento = new Date(evento.fecha_evento).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        const link_cotizacion = `https://www.prosocial.mx/cotizacion/evento/${evento.id}`
        const mensaje = `Hola ${cliente.nombre}, te compartimos las cotizaciones para el evento ${eventoTipo} de ${evento.nombre} que celebrarás el ${fecha_evento}.\n\n${link_cotizacion}`

        //envia mensaje con link de whatsapp
        window.open(`https://wa.me/${cliente.telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')

    }

    const handleEliminarCotizacion = useCallback(async (cotizacionId: string) => {
        if (confirm('¿Estás seguro de eliminar esta cotización?')) {
            setEliminando(true)
            const res = await eliminarCotizacion(cotizacionId)
            console.log('res', res)

            // setCotizaciones(cotizaciones.filter(cotizacion => cotizacion.id !== cotizacionId))
            setEliminando(false)
        }
    }, [cotizaciones])

    const cotizacionesRenderizadas = useMemo(() => {

        return cotizaciones.map(cotizacion => (

            <li key={cotizacion.id} className={`mb-3 ${cotizacion.status === 'pendiente' ? 'bg-zinc-900 rounded-md  p-5' : 'bg-green-900/10 border border-green-950/30 rounded-md  p-5'}`}>

                <div className='mb-4'>
                    <div className='flex items-center justify-between'>
                        <button
                            onClick={() => router.push(`/admin/dashboard/cotizaciones/${cotizacion.id}`)}
                            className='flex items-center text-zinc-400 hover:text-zinc-100 mb-1 break-words text-start'
                        >
                            <Pencil size={12} className='md:mr-1 mr-3  ' />
                            <span className='block'>
                                {cotizacion.nombre} por {cotizacion.precio.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                            </span>
                        </button>

                        <p className='text-zinc-500 text-sm flex items-center'>
                            <Eye size={16} className='mr-2' /> {cotizacion.visitas}
                        </p>
                    </div>
                    <p className='text-sm text-zinc-500 italic'>
                        Creada el {cotizacion.createdAt ? new Date(cotizacion.createdAt).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }) : 'Fecha no disponible'}
                    </p>
                </div>

                <div className='items-center flex flex-wrap justify-start md:space-x-2 space-y-1 md:space-y-0'>

                    <button
                        onClick={() => navigator.clipboard.writeText(`https://www.prosocial.mx/cotizacion/${cotizacion.id}`)}
                        className='text-sm flex items-center px-3 py-2 leading-3 border border-zinc-800 rounded-md bg-zinc-900'
                    >
                        <Copy size={12} className='mr-1' /> Copiar
                    </button>

                    <button
                        onClick={() => window.open(`/cotizacion/${cotizacion.id}?preview=true`, '_blank')}
                        className='text-sm flex items-center px-3 py-2 leading-3 border border-zinc-800 rounded-md bg-zinc-900'
                    >
                        <SquareArrowOutUpRight size={12} className='mr-1' /> Abrir
                    </button>

                    <button
                        onClick={handleShareCotizacion}
                        className='text-sm flex items-center px-3 py-2 leading-3 border border-zinc-800 rounded-md bg-zinc-900'
                    >
                        <i className="fab fa-whatsapp text-md mr-1"></i> Enviar
                    </button>
                    {/* //! DESCOMENTAR EN PRODUCCUÓN */}

                    <button
                        onClick={() => cotizacion.id && handleEliminarCotizacion(cotizacion.id)}
                        className='text-sm flex items-center px-3 py-2 leading-3 border border-zinc-800 rounded-md bg-red-900'
                        disabled={eliminando}
                    >
                        Eliminar
                    </button>


                </div>
            </li >
        ))
    }, [cotizaciones, router, handleShareCotizacion, handleEliminarCotizacion, eliminando])

    return (
        <div>
            {evento.id ? (
                <div>
                    {loading ? (
                        <p className='text-zinc-500 italic'>Cargando cotizaciones...</p>
                    ) : (
                        cotizaciones.length > 0 ? (
                            <div>
                                <div>

                                    {cantidadCotizaciones > 1 && (
                                        <div>
                                            <div className='items-center flex flex-wrap justify-start md:space-x-2 space-y-1 md:space-y-0 mb-5'>
                                                <p>Compartir todo:</p>

                                                <button
                                                    onClick={() => window.open(`/cotizacion/evento/${evento.id}`, '_blank')}
                                                    className='text-sm flex items-center px-3 py-2 leading-3 border border-yellow-800 rounded-md bg-zinc-900'
                                                >
                                                    <SquareArrowOutUpRight size={12} className='mr-1' /> Abrir
                                                </button>

                                                <button
                                                    onClick={() => navigator.clipboard.writeText(`https://www.prosocial.mx/cotizacion/evento/${evento.id}`)}
                                                    className='text-sm flex items-center px-3 py-2 leading-3 border border-yellow-800 rounded-md bg-zinc-900'
                                                >
                                                    <Copy size={12} className='mr-1' /> Copiar url
                                                </button>

                                                <button
                                                    onClick={handleShareTodasLasCotizaciones}
                                                    className='text-sm flex items-center px-3 py-2 leading-3 border border-yellow-800 rounded-md bg-zinc-900'
                                                >
                                                    <i className="fab fa-whatsapp text-md mr-1"></i> Enviar
                                                </button>
                                            </div>

                                        </div>
                                    )}

                                </div>
                                <ul>
                                    {cotizacionesRenderizadas}
                                </ul>
                            </div>
                        ) : (
                            <p className='text-zinc-500'>
                                No hay cotizaciones disponibles.
                            </p>
                        )
                    )}
                </div>
            ) : (
                ''
            )}
        </div>
    )
}

export default memo(ListaCotizaciones)