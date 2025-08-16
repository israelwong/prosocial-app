'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, SquareArrowOutUpRight, Plus } from 'lucide-react'
import type { EventoCompleto } from '@/app/admin/_lib/actions/evento/evento/evento.schemas'
import { obtenerCotizacionesPorEvento } from '@/app/admin/_lib/cotizacion.actions'
import { obtenerPaquetesPorTipoEvento } from '@/app/admin/_lib/paquete.actions'
import { Cotizacion, Paquete } from '@/app/admin/_lib/types'
import { supabase } from '@/app/admin/_lib/supabase'
import FichaCotizacionDetalle from '../cotizacion/components/FichaCotizacionDetalle'

interface Props {
    eventoCompleto: EventoCompleto
    eventoAsignado: boolean
}

// Tipo para las cotizaciones de EventoCompleto
type CotizacionSimple = EventoCompleto['Cotizacion'][0]

export default function FichaCotizacionesUnificada({ eventoCompleto, eventoAsignado }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
    const [cotizacionesSimples, setCotizacionesSimples] = useState<CotizacionSimple[]>([])
    const [paquetes, setPaquetes] = useState<Paquete[]>([])
    const [paqueteId, setPaqueteId] = useState<string>('')
    const [copiado, setCopiado] = useState<string | null>(null)

    const eventoId = eventoCompleto.id
    const eventoTipoId = eventoCompleto.eventoTipoId

    // Cargar cotizaciones completas directamente
    useEffect(() => {
        async function cargarCotizaciones() {
            try {
                setLoading(true)

                // Primero usar las cotizaciones simples si están disponibles
                const cotizacionesIniciales = eventoCompleto.Cotizacion || []
                console.log('Cotizaciones del eventoCompleto:', cotizacionesIniciales)
                setCotizacionesSimples(cotizacionesIniciales)

                // Luego cargar las cotizaciones completas
                if (eventoId) {
                    const cotizacionesCompletas = await obtenerCotizacionesPorEvento(eventoId)
                    console.log('Cotizaciones completas:', cotizacionesCompletas)
                    setCotizaciones(cotizacionesCompletas)
                }
            } catch (error) {
                console.error('Error al cargar cotizaciones:', error)
            } finally {
                setLoading(false)
            }
        }
        cargarCotizaciones()
    }, [eventoCompleto, eventoId])

    // Cargar paquetes
    useEffect(() => {
        async function cargarPaquetes() {
            if (eventoTipoId) {
                try {
                    const paquetesData = await obtenerPaquetesPorTipoEvento(eventoTipoId)
                    setPaquetes(paquetesData)
                } catch (error) {
                    console.error('Error al cargar paquetes:', error)
                }
            }
        }
        cargarPaquetes()
    }, [eventoTipoId])

    // Suscripción en tiempo real
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
            subscription.unsubscribe();
        };
    }, [eventoId]);

    useEffect(() => {
        const unsubscribe = suscripcionSupabase();
        return unsubscribe;
    }, [suscripcionSupabase]);

    const handleNuevaCotizacion = async (paqueteIdSeleccionado: string) => {
        if (!paqueteIdSeleccionado) {
            // Cotización personalizada con nueva funcionalidad
            router.push(`/admin/dashboard/eventos/${eventoId}/cotizacion/nueva?eventoTipoId=${eventoTipoId}`)
            return
        }

        // Cotización con paquete usando nueva funcionalidad
        router.push(`/admin/dashboard/eventos/${eventoId}/cotizacion/nueva?eventoTipoId=${eventoTipoId}&paqueteId=${paqueteIdSeleccionado}`)
    }

    const handleEliminarCotizacion = async (cotizacionId: string) => {
        try {
            const response = await fetch(`/api/cotizacion/${cotizacionId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                setCotizaciones(prev => prev.filter(c => c.id !== cotizacionId))
            }
        } catch (error) {
            console.error('Error al eliminar cotización:', error)
        }
    }

    const handleCopiarLink = () => {
        const link = `${window.location.origin}/cotizacion/evento/${eventoId}`
        navigator.clipboard.writeText(link)
        setCopiado('Copiado')
        setTimeout(() => setCopiado(null), 2000)
    }

    const handlePreview = () => {
        window.open(`/evento/${eventoId}/cotizacion/${cotizaciones}?preview=true`, '_blank')
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-6 bg-zinc-800 rounded animate-pulse"></div>
                <div className="h-4 bg-zinc-800 rounded animate-pulse"></div>
                <div className="h-4 bg-zinc-800 rounded animate-pulse"></div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Cabecera con título */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-zinc-200 border-b border-zinc-700 pb-2">Cotizaciones</h3>

                {/* Botones debajo del título */}
                <div className="space-y-3">
                    {/* Selector de nuevo paquete */}
                    {eventoAsignado ? (
                        <select
                            className="w-full bg-zinc-800 border border-zinc-700 rounded py-2 px-3 text-zinc-200 text-sm"
                            value={paqueteId}
                            onChange={(e) => {
                                setPaqueteId(e.target.value);
                                handleNuevaCotizacion(e.target.value);
                            }}
                        >
                            <option value=''>Seleccionar paquete</option>
                            {paquetes.map(paquete => (
                                <option key={paquete.id} value={paquete.id}>
                                    {paquete.nombre}
                                </option>
                            ))}
                            <option value=''>Crear paquete personalizado</option>
                        </select>
                    ) : (
                        <select
                            className="w-full bg-zinc-800 border border-zinc-700 rounded py-2 px-3 text-zinc-400 text-sm"
                            disabled
                        >
                            <option value=''>Primero asignate el evento</option>
                        </select>
                    )}

                    {/* Botones de acción para múltiples cotizaciones */}
                    {(cotizaciones.length > 1 || cotizacionesSimples.length > 1) && (
                        <div className="flex gap-2 text-xs">
                            <button
                                onClick={handlePreview}
                                className="flex items-center gap-1 px-2 py-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
                            >
                                <SquareArrowOutUpRight className="w-3 h-3" />
                                Preview
                            </button>
                            <button
                                onClick={handleCopiarLink}
                                className="flex items-center gap-1 px-2 py-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
                            >
                                <Copy className="w-3 h-3" />
                                {copiado === 'Copiado' ? 'Copiado' : 'Copiar link'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Contenido */}
            <div className="space-y-3">
                {/* Mostrar cotizaciones completas si están disponibles, sino las simples */}
                {cotizaciones.length > 0 ? (
                    <ul className="space-y-3">
                        {cotizaciones.map((cotizacion, index) => (
                            <li
                                key={cotizacion.id}
                                className={`rounded-md p-4 ${cotizacion.status === 'pendiente'
                                    ? 'bg-zinc-900 border border-zinc-800'
                                    : 'bg-green-900/10 border border-green-950/30'
                                    }`}
                            >
                                <FichaCotizacionDetalle
                                    cotizacion={cotizacion}
                                    onEliminarCotizacion={handleEliminarCotizacion}
                                    eventoId={eventoId}
                                />
                            </li>
                        ))}
                    </ul>
                ) : cotizacionesSimples.length > 0 ? (
                    <ul className="space-y-3">
                        {cotizacionesSimples.map((cotizacion, index) => (
                            <li
                                key={cotizacion.id}
                                className={`rounded-md p-4 ${cotizacion.status === 'pendiente'
                                    ? 'bg-zinc-900 border border-zinc-800'
                                    : 'bg-green-900/10 border border-green-950/30'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-zinc-200 font-medium">
                                            Cotización #{index + 1}
                                        </p>
                                        <p className="text-zinc-400 text-sm">
                                            {cotizacion.precio.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                        </p>
                                        <p className="text-xs text-zinc-500 mt-1">
                                            Status: {cotizacion.status}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => router.push(`/admin/dashboard/eventos/${eventoId}/cotizacion/${cotizacion.id}`)}
                                        className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 hover:bg-zinc-800 rounded transition-colors"
                                    >
                                        Ver detalles
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className='text-zinc-500 text-sm'>
                        No hay cotizaciones disponibles.
                    </p>
                )}
            </div>
        </div>
    )
}
