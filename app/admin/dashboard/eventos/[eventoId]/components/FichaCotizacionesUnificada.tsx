'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, SquareArrowOutUpRight, Plus, MoreVertical, Share, Package } from 'lucide-react'
import { WhatsAppIcon } from '@/app/components/ui/WhatsAppIcon'
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
    const [copiado, setCopiado] = useState<string | null>(null)
    const [menuAbierto, setMenuAbierto] = useState(false)
    const [menuPaquetesAbierto, setMenuPaquetesAbierto] = useState(false)

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

    // Cerrar menús al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element
            if (!target.closest('.menu-container')) {
                setMenuAbierto(false)
                setMenuPaquetesAbierto(false)
            }
        }

        if (menuAbierto || menuPaquetesAbierto) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [menuAbierto, menuPaquetesAbierto])

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
        const link = `${window.location.origin}/evento/${eventoId}`
        navigator.clipboard.writeText(link)
        setCopiado('Copiado')
        setTimeout(() => setCopiado(null), 2000)
        setMenuAbierto(false)
    }

    const handlePreview = () => {
        window.open(`/evento/${eventoId}`, '_blank')
        setMenuAbierto(false)
    }

    const handleCompartirWhatsApp = () => {
        const cliente = eventoCompleto.Cliente
        const link = `${window.location.origin}/evento/${eventoId}`
        const mensaje = `¡Hola ${cliente.nombre}! Te comparto las cotizaciones para tu evento: ${link}`

        if (cliente.telefono) {
            // Limpiar el número de caracteres no numéricos
            const numeroLimpio = cliente.telefono.replace(/\D/g, '')

            // Formatear para México: si tiene 10 dígitos, agregar +52
            const numeroWhatsApp = numeroLimpio.length === 10
                ? `52${numeroLimpio}`
                : numeroLimpio

            const whatsappUrl = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`
            window.open(whatsappUrl, '_blank')
        } else {
            // Si no hay número, abrir WhatsApp sin número específico
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensaje)}`
            window.open(whatsappUrl, '_blank')
        }

        setMenuAbierto(false)
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
            {/* Cabecera con título y menú contextual */}
            <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
                <h3 className="text-lg font-semibold text-zinc-200">Cotizaciones</h3>

                <div className="flex items-center gap-2">
                    {/* Menú de acciones (solo si hay cotizaciones) */}
                    {(cotizaciones.length > 0 || cotizacionesSimples.length > 0) && (
                        <div className="relative menu-container">
                            <button
                                onClick={() => setMenuAbierto(!menuAbierto)}
                                className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
                                title="Opciones"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>

                            {menuAbierto && (
                                <div className="absolute right-0 top-8 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg py-1 z-10 min-w-48">
                                    {/* Opciones solo para múltiples cotizaciones */}
                                    {(cotizaciones.length > 1 || cotizacionesSimples.length > 1) && (
                                        <>
                                            <button
                                                onClick={handlePreview}
                                                className="w-full px-3 py-2 text-left text-zinc-200 hover:bg-zinc-700 flex items-center gap-2 text-sm"
                                            >
                                                <SquareArrowOutUpRight className="w-4 h-4" />
                                                Preview
                                            </button>
                                            <button
                                                onClick={handleCopiarLink}
                                                className="w-full px-3 py-2 text-left text-zinc-200 hover:bg-zinc-700 flex items-center gap-2 text-sm"
                                            >
                                                <Copy className="w-4 h-4" />
                                                {copiado === 'Copiado' ? 'Copiado' : 'Copiar link'}
                                            </button>
                                            <button
                                                onClick={handleCompartirWhatsApp}
                                                className="w-full px-3 py-2 text-left text-zinc-200 hover:bg-zinc-700 flex items-center gap-2 text-sm"
                                            >
                                                <WhatsAppIcon className="w-4 h-4" size={16} />
                                                Compartir cotizaciones
                                            </button>
                                            <div className="border-t border-zinc-700 my-1"></div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Menú de crear paquetes */}
                    {eventoAsignado && (
                        <div className="relative menu-container">
                            <button
                                onClick={() => setMenuPaquetesAbierto(!menuPaquetesAbierto)}
                                className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
                                title="Crear cotización"
                            >
                                <Plus className="w-4 h-4" />
                            </button>

                            {menuPaquetesAbierto && (
                                <div className="absolute right-0 top-8 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg py-1 z-10 min-w-48">
                                    <div className="px-3 py-2 text-xs text-zinc-400 border-b border-zinc-700">
                                        Crear nueva cotización
                                    </div>

                                    {/* Paquetes disponibles */}
                                    {paquetes.map(paquete => (
                                        <button
                                            key={paquete.id}
                                            onClick={() => {
                                                handleNuevaCotizacion(paquete.id || '')
                                                setMenuPaquetesAbierto(false)
                                            }}
                                            className="w-full px-3 py-2 text-left text-zinc-200 hover:bg-zinc-700 flex items-center gap-2 text-sm"
                                        >
                                            <Package className="w-4 h-4" />
                                            {paquete.nombre}
                                        </button>
                                    ))}

                                    <div className="border-t border-zinc-700 my-1"></div>

                                    {/* Paquete personalizado */}
                                    <button
                                        onClick={() => {
                                            handleNuevaCotizacion('')
                                            setMenuPaquetesAbierto(false)
                                        }}
                                        className="w-full px-3 py-2 text-left text-zinc-200 hover:bg-zinc-700 flex items-center gap-2 text-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Crear personalizado
                                    </button>
                                </div>
                            )}
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
                                className={`rounded-md p-4 ${cotizacion.status === 'aprobada'
                                        ? 'bg-green-900/20 border border-green-700/50'
                                        : cotizacion.status === 'autorizado'
                                            ? 'bg-blue-900/20 border border-blue-700/50'
                                            : 'bg-zinc-900 border border-zinc-800'
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
                                className={`rounded-md p-4 ${cotizacion.status === 'aprobada'
                                        ? 'bg-green-900/20 border border-green-700/50'
                                        : cotizacion.status === 'autorizado'
                                            ? 'bg-blue-900/20 border border-blue-700/50'
                                            : 'bg-zinc-900 border border-zinc-800'
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
                    <div className="text-center py-8">
                        {!eventoAsignado ? (
                            <div className="space-y-2">
                                <p className='text-zinc-500 text-sm'>
                                    Primero asígnate el evento para crear cotizaciones
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className='text-zinc-500 text-sm'>
                                    No hay cotizaciones disponibles.
                                </p>
                                <p className='text-zinc-600 text-xs'>
                                    Usa el botón + para crear una nueva cotización
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
