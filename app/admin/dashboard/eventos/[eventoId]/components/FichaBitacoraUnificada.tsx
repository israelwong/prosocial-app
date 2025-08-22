'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash } from 'lucide-react'
import type { EventoCompleto } from '@/app/admin/_lib/actions/evento/evento/evento.schemas'
import { fichaBitacoraUnificadaEliminarBitacora } from '@/app/admin/_lib/actions/evento/bitacora.actions'
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
    const router = useRouter()

    const bitacora = eventoCompleto.EventoBitacora || []

    const handleSubimtBitacoraNuevo = async () => {
        setLoading(true)
        setIsModalBitacoraNuevoOpen(false)
        // Refrescar la página para mostrar los nuevos datos
        router.refresh()
        setLoading(false)
    }

    const handleEditarBitacora = (bitacoraId: string) => {
        setBitacoraId(bitacoraId)
        setIsModalBitacoraEditarOpen(true)
    }

    const handleSubimtBitacoraActualizar = async () => {
        setLoading(true)
        setIsModalBitacoraEditarOpen(false)
        // Refrescar la página para mostrar los datos actualizados
        router.refresh()
        setLoading(false)
    }

    const handleDeleteBitacora = async (bitacoraId: string) => {
        if (!confirm('¿Estás seguro de eliminar esta nota?')) return

        setLoading(true)
        try {
            await fichaBitacoraUnificadaEliminarBitacora(bitacoraId)
            // Refrescar la página para mostrar los cambios
            router.refresh()
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
                <h3 className="text-lg font-semibold text-zinc-200 border-b border-zinc-700 pb-2">Seguimiento</h3>

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
                    bitacora.map((entrada, index) => (
                        <div key={entrada.id} className="py-3 mb-3 flex justify-between items-center bg-zinc-900 p-5">
                            <div className="pr-5">
                                <button
                                    className="text-zinc-200 text-left flex items-start"
                                    onClick={() => handleEditarBitacora(entrada.id)}
                                    disabled={loading}
                                >
                                    <span className="flex-shrink">{entrada.comentario}</span>
                                </button>
                                <p className="text-sm text-zinc-400 italic">
                                    {new Date(entrada.updatedAt).toLocaleString('es-ES', {
                                        dateStyle: 'full',
                                        timeStyle: 'long'
                                    }).replace(/ GMT[+-]\d{1,2}/, '')}
                                </p>
                            </div>
                            <button
                                onClick={() => handleDeleteBitacora(entrada.id)}
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
