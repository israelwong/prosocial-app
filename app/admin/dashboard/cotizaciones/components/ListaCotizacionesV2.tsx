'use client'
import React, { useEffect, useState, useCallback, memo } from 'react'
import { obtenerCotizacionesPorEvento } from '@/app/admin/_lib/cotizacion.actions'
import { obtenerPaquetesPorTipoEvento } from '@/app/admin/_lib/paquete.actions'

import { Cotizacion, Paquete } from '@/app/admin/_lib/types'
import { Copy, SquareArrowOutUpRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/admin/_lib/supabase'

import FichaCotizacionDetalle from './FichaCotizacionDetalle'

interface Props {
    eventoId: string
    eventoTipoId: string
    eventoAsignado: boolean
}

const ListaCotizaciones: React.FC<Props> = ({ eventoId, eventoTipoId, eventoAsignado }) => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
    const [paquetes, setPaquetes] = useState<Paquete[]>([])
    const [paqueteId, setPaqueteId] = useState<string>('')
    const [generandoCotizacion, setGenerandoCotizacion] = useState(false)

    const suscripcionSupabase = useCallback(() => {
        const subscription = supabase
            .channel('realtime:CotizacionVisita')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'CotizacionVisita' },
                async (payload) => {
                    console.log('Cambio detectado en CotizacionVisita:', payload);
                    if (eventoId) {
                        const cotizacionesUpdate = await obtenerCotizacionesPorEvento(eventoId)
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
    }, [eventoId]);

    useEffect(() => {

        const fetchData = async () => {
            setLoading(true)

            const cotizacionesData = await obtenerCotizacionesPorEvento(eventoId)
            setCotizaciones(cotizacionesData)

            obtenerPaquetesPorTipoEvento(eventoTipoId).then(paquetesData => (
                setPaquetes(paquetesData)
            ))

            setLoading(false)
        }

        fetchData()
        suscripcionSupabase()

    }, [eventoId, eventoTipoId, suscripcionSupabase])


    //! Crear nueva cotización
    const handleNuevaCotizacion = useCallback((paqueteId: string) => {
        setGenerandoCotizacion(true)
        router.push(`/admin/dashboard/cotizaciones/nueva?eventoId=${eventoId}&eventoTipoId=${eventoTipoId}&paqueteId=${paqueteId}`)
    }, [eventoId, eventoTipoId, router])

    //! Eliminar cotización
    const handleEliminarCotizacion = async (cotizacionId: string) => {
        // console.log('Eliminar cotización:', cotizacionId)
        setCotizaciones(cotizaciones.filter(cotizacion => cotizacion.id !== cotizacionId))
    }

    return (
        <div>

            <div className='mb-5 flex items-center justify-between'>
                <div className='font-bold text-xl text-zinc-500'>
                    Cotizaciones
                </div>

                <div>

                    {/* //! CREAR COTIZACIONES */}
                    {eventoAsignado ? (
                        !generandoCotizacion ? (
                            <select
                                className="bg-zinc-900 border border-zinc-800 rounded w-full py-2 px-3 text-zinc-500"
                                value={paqueteId}
                                onChange={(e) => {
                                    setPaqueteId(e.target.value);
                                    handleNuevaCotizacion(e.target.value);
                                }}
                            >
                                <option value=''>Seleccionar paquete</option>
                                {loading ? (
                                    <option value=''>Cargando paquetes...</option>
                                ) : (
                                    paquetes.map(paquete => (
                                        <option key={paquete.id} value={paquete.id}>
                                            {paquete.nombre}
                                        </option>
                                    ))
                                )}
                                <option value=''>Crear paquete personalizado</option>
                            </select>
                        ) : (
                            <p className="italic mt-2 text-yellow-500 py-2 px-3 rounded-md">
                                Generando cotización...
                            </p>
                        )
                    ) : (
                        <>
                            <select
                                className="bg-zinc-900 border border-zinc-800 rounded w-full py-2 px-3 text-zinc-500"
                                disabled
                            >
                                <option value=''>Asignate el evento para desbloquar</option>
                            </select>
                        </>
                    )}
                </div>
            </div>

            {/* //! SI MAS DE UNA COTIZACIÓN */}
            {cotizaciones.length > 1 && (
                <div>
                    <div className='items-center flex justify-between md:space-x-2 space-y-1 md:space-y-0 mb-5'>
                        <p>Lista con todas las cotizaciones</p>

                        <div className='flex space-x-2'>
                            <button
                                onClick={() => window.open(`/cotizacion/evento/${eventoId}`, '_blank')}
                                className='text-sm flex items-center px-3 py-2 leading-3 border border-yellow-800 rounded-md bg-zinc-900'
                            >
                                <SquareArrowOutUpRight size={12} className='mr-1' /> Preview
                            </button>

                            <button
                                onClick={() => navigator.clipboard.writeText(`https://www.prosocial.mx/cotizacion/evento/${eventoId}`)}
                                className='text-sm flex items-center px-3 py-2 leading-3 border border-yellow-800 rounded-md bg-zinc-900'
                            >
                                <Copy size={12} className='mr-1' /> Copiar link
                            </button>
                        </div>
                    </div>

                </div>
            )}

            {/* //! LISTAR COTIZACIONES */}
            <div>
                {eventoId ? (
                    <div>
                        {loading ? (
                            <p className='text-zinc-500 italic'>Cargando cotizaciones...</p>
                        ) : (
                            cotizaciones.length > 0 ? (
                                <ul>
                                    {cotizaciones.map((cotizacion, index) => (
                                        <li key={index} className={`mb-3 ${cotizacion.status === 'pendiente' ? 'bg-zinc-900 rounded-md  p-5' : 'bg-green-900/10 border border-green-950/30 rounded-md p-5'}`}>
                                            <FichaCotizacionDetalle
                                                cotizacion={cotizacion}
                                                onEliminarCotizacion={handleEliminarCotizacion}
                                            />
                                        </li>
                                    ))}
                                </ul>
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
        </div>
    )
}

export default memo(ListaCotizaciones)