'use client';

import React, { useEffect, useState } from 'react'
import { EventoBitacora } from '@/app/admin/_lib/types'
import { obtenerEventoBitacora, eliminarBitacoraEvento } from '@/app/admin/_lib/EventoBitacora.actions'
import ModalBitacoraNuevo from './ModalBitacoraNuevo'
import ModalBitacoraEditar from './ModalBitacoraEditar'
import { Trash } from 'lucide-react';

interface Props {
    eventoId: string;
}

export default function FichaBitacora({ eventoId }: Props) {

    const [isModalBitacoraNuevoOpen, setIsModalBitacoraNuevoOpen] = useState(false)
    const [isModalBitacoraEditarOpen, setIsModalBitacoraEditarOpen] = useState(false)
    const [bitacora, setBitacora] = useState<EventoBitacora[] | null>(null)
    const [guardado, setGuardando] = useState(false)
    const [bitacoraId, setBitacoraId] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            const bitacoraData = await obtenerEventoBitacora(eventoId)
            setBitacora(bitacoraData)
            setGuardando(false)
        }
        fetchData()
    }, [eventoId, guardado])


    const handleSubimtBitacoraNuevo = async () => {
        setGuardando(true)
        setIsModalBitacoraNuevoOpen(false)
    }

    const handleEditarBitacora = (bitacoraId: string) => {
        setBitacoraId(bitacoraId)
        setGuardando(true)
        setIsModalBitacoraEditarOpen(true)
    }

    const handleSubimtBitacoraActualizar = async () => {
        setGuardando(true)
        setIsModalBitacoraEditarOpen(false)
    }

    const handleDeleteBitacora = async (bitacoraId: string) => {
        if (!confirm('¿Estás seguro de eliminar esta nota?')) return
        await eliminarBitacoraEvento(bitacoraId)
        setGuardando(true)
    }

    return (
        <div>
            <div className='flex justify-between items-center mb-5 '>
                <h3 className='text-xl font-semibold text-zinc-500'>
                    Comentarios
                </h3>
                <button
                    className='bg-zinc-900 text-white p-2 rounded-md'
                    onClick={() => setIsModalBitacoraNuevoOpen(true)}
                >
                    Agregar nota
                </button>
            </div>

            <div>
                {bitacora && bitacora.length > 0 ? (
                    bitacora.map((bitacora, index) => (
                        <div key={index} className="py-2 mb-3 flex justify-between items-center bg-zinc-900 p-5">
                            <div className="pr-5">
                                <button className="text-lg text-zinc-200 text-left flex items-start"
                                    onClick={() => bitacora.id && handleEditarBitacora(bitacora.id)}
                                >
                                    <span className="flex-shrink">{bitacora.comentario}</span>
                                </button>
                                <p className="text-sm text-zinc-400 italic">{bitacora.updatedAt ? new Date(bitacora.updatedAt).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'long' }).replace(/ GMT[+-]\d{1,2}/, '') : 'Fecha no disponible'}</p>
                            </div>
                            <button
                                onClick={() => bitacora.id && handleDeleteBitacora(bitacora.id)}
                                className="text-red-500">
                                <Trash size={16} />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-zinc-500">No hay comentarios registrados</p>
                )}
            </div>

            {/* MODALES */}
            {isModalBitacoraNuevoOpen && (
                <ModalBitacoraNuevo
                    eventoId={eventoId}
                    onSubmit={() => handleSubimtBitacoraNuevo()}
                    onClose={() => setIsModalBitacoraNuevoOpen(false)}
                />
            )}

            {/* MODALES */}
            {isModalBitacoraEditarOpen && (
                <ModalBitacoraEditar
                    bitacoraId={bitacoraId}
                    onSubmit={() => handleSubimtBitacoraActualizar()}
                    onClose={() => setIsModalBitacoraEditarOpen(false)}
                />
            )}

        </div>
    )
}
