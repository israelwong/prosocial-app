'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Trash } from 'lucide-react'
import type { EventoCompleto } from '@/app/admin/_lib/actions/evento/evento.schemas'
import type { EventoBitacora } from '@/app/admin/_lib/types'
import { fichaBitacoraUnificadaEliminarBitacora, obtenerEventoBitacora } from '@/app/admin/_lib/actions/evento/bitacora.actions'
import { supabase } from '@/app/admin/_lib/supabase'
import ModalBitacoraNuevo from './ModalBitacoraNuevo'
import ModalBitacoraEditar from './ModalBitacoraEditar'

interface Props {
    eventoCompleto: EventoCompleto
}

export default function FichaBitacoraUnificada({ eventoCompleto }: Props) {
    const [isModalBitacoraNuevoOpen, setIsModalBitacoraNuevoOpen] = useState(false)
    const [isModalBitacoraEditarOpen, setIsModalBitacoraEditarOpen] = useState(false)
    const [bitacoraId, setBitacoraId] = useState('')
    const [loading, setLoading] = useState(false)
    const [bitacora, setBitacora] = useState<EventoBitacora[]>(eventoCompleto.EventoBitacora || [])
    const router = useRouter()

    // Función para recargar solo la bitácora
    const recargarBitacora = useCallback(async () => {
        try {
            console.log('🔄 Recargando bitácora del evento:', eventoCompleto.id)
            const bitacoraActualizada = await obtenerEventoBitacora(eventoCompleto.id)
            setBitacora(bitacoraActualizada)
            console.log('✅ Bitácora actualizada:', bitacoraActualizada.length, 'entradas')
        } catch (error) {
            console.error('❌ Error recargando bitácora:', error)
        }
    }, [eventoCompleto.id])

    // Suscripción realtime para EventoBitacora (patrón probado)
    useEffect(() => {
        console.log('🔔 Configurando suscripción realtime para EventoBitacora')
        
        const subscription = supabase
            .channel('realtime:EventoBitacora')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'EventoBitacora' },
                async (payload) => {
                    console.log('🔔 Cambio detectado en EventoBitacora:', payload)
                    // Verificar si el cambio es del evento actual
                    const newRecord = payload.new as any
                    const oldRecord = payload.old as any
                    if (newRecord?.eventoId === eventoCompleto.id || oldRecord?.eventoId === eventoCompleto.id) {
                        console.log('✅ Cambio relevante para evento actual, recargando bitácora...')
                        await recargarBitacora()
                    } else {
                        console.log('ℹ️ Cambio en bitácora de otro evento, ignorando')
                    }
                }
            ).subscribe((status, err) => {
                if (err) {
                    console.error('❌ Error en la suscripción EventoBitacora:', err)
                } else {
                    console.log('✅ Estado de la suscripción EventoBitacora:', status)
                }
            })

        // Cleanup al desmontar
        return () => {
            console.log('🧹 Limpiando suscripción EventoBitacora')
            subscription.unsubscribe()
        }
    }, [eventoCompleto.id, recargarBitacora])

    const formatearFecha = (fecha: Date) => {
        try {
            // Verificar que sea una fecha válida
            if (!fecha || !(fecha instanceof Date) || isNaN(fecha.getTime())) {
                return 'Fecha no válida'
            }

            // Formatear en español con formato completo: "sábado 3 de enero 2025"
            return fecha.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
        } catch (error) {
            console.error('Error formateando fecha:', error, fecha)
            return 'Error en fecha'
        }
    }

    const handleSubimtBitacoraNuevo = async () => {
        setLoading(true)
        setIsModalBitacoraNuevoOpen(false)
        // Recargar solo la bitácora en lugar de toda la página
        await recargarBitacora()
        setLoading(false)
    }

    const handleEditarBitacora = (bitacoraId: string) => {
        setBitacoraId(bitacoraId)
        setIsModalBitacoraEditarOpen(true)
    }

    const handleSubimtBitacoraActualizar = async () => {
        setLoading(true)
        setIsModalBitacoraEditarOpen(false)
        // Recargar solo la bitácora en lugar de toda la página
        await recargarBitacora()
        setLoading(false)
    }

    const handleDeleteBitacora = async (bitacoraId: string) => {
        if (!confirm('¿Estás seguro de eliminar esta nota?')) return

        setLoading(true)
        try {
            await fichaBitacoraUnificadaEliminarBitacora(bitacoraId)
            // Actualizar estado local directamente (más eficiente que recargar)
            setBitacora(prevBitacora => prevBitacora.filter(item => item.id !== bitacoraId))
        } catch (error) {
            console.error('Error al eliminar bitácora:', error)
            alert('Error al eliminar la nota')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            {/* Cabecera con título */}
            <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
                    <h3 className="text-lg font-semibold text-zinc-200">Seguimiento</h3>
                    
                    {/* Indicadores y controles */}
                    <div className="flex items-center gap-3">
                        {/* Indicador realtime */}
                        <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span>En vivo</span>
                        </div>
                        
                        {/* Botón de recarga manual */}
                        <button
                            onClick={recargarBitacora}
                            disabled={loading}
                            className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded border border-zinc-600 transition-colors disabled:opacity-50"
                            title="Recargar bitácora"
                        >
                            ⟳
                        </button>
                    </div>
                </div>

                {/* Botón debajo del título */}
                <div className="flex gap-2">
                    <button
                        className='flex items-center gap-1 px-2 py-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors disabled:opacity-50 text-xs'
                        onClick={() => setIsModalBitacoraNuevoOpen(true)}
                        disabled={loading}
                    >
                        {loading ? 'Cargando...' : 'Agregar nota'}
                    </button>
                </div>
            </div>

            {/* Contenido */}
            <div>
                {bitacora && bitacora.length > 0 ? (
                    bitacora.map((entrada: EventoBitacora, index: number) => (
                        <div key={entrada.id} className="py-3 mb-3 flex justify-between items-center bg-zinc-900 p-5">
                            <div className="pr-5">
                                <button
                                    className="text-zinc-200 text-left flex items-start"
                                    onClick={() => handleEditarBitacora(entrada.id!)}
                                    disabled={loading}
                                >
                                    <span className="flex-shrink">{entrada.comentario}</span>
                                </button>
                                <p className="text-sm text-zinc-400 italic">
                                    {(entrada.updatedAt || entrada.createdAt) ?
                                        formatearFecha(entrada.updatedAt || entrada.createdAt!) :
                                        'Sin fecha'}
                                </p>
                            </div>
                            <button
                                onClick={() => handleDeleteBitacora(entrada.id!)}
                                className="text-red-500 hover:text-red-400 disabled:opacity-50"
                                disabled={loading}
                            >
                                <Trash size={16} />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-zinc-600 p-5 bg-zinc-900 rounded-md border border-zinc-800">
                        No hay comentarios registrados
                    </p>
                )}
            </div>

            {/* MODALES */}
            {isModalBitacoraNuevoOpen && (
                <ModalBitacoraNuevo
                    eventoId={eventoCompleto.id}
                    onSubmit={handleSubimtBitacoraNuevo}
                    onClose={() => setIsModalBitacoraNuevoOpen(false)}
                />
            )}

            {isModalBitacoraEditarOpen && (
                <ModalBitacoraEditar
                    bitacoraId={bitacoraId}
                    onSubmit={handleSubimtBitacoraActualizar}
                    onClose={() => setIsModalBitacoraEditarOpen(false)}
                />
            )}
        </div>
    )
}
