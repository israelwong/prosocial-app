import React, { useState } from 'react'
import { Cotizacion } from '@/app/admin/_lib/types'
import { eliminarCotizacion, clonarCotizacion } from '@/app/admin/_lib/cotizacion.actions'
import { useRouter } from 'next/navigation'
import { actualizarVisibilidadCotizacion } from '@/app/admin/_lib/cotizacion.actions'
import BotonAutorizarCotizacion from './BotonAutorizarCotizacion'

import { Pencil, Eye, Layers2, ArrowUpRight, Trash2, Archive, ArchiveRestore, Copy, Check, MessageCircle } from 'lucide-react'

interface Props {
    cotizacion: Cotizacion
    onEliminarCotizacion: (cotizacionId: string) => void | Promise<void>
    eventoId: string
}

export default function FichaCotizacionDetalle({ cotizacion, onEliminarCotizacion, eventoId }: Props) {

    const router = useRouter()
    const [eliminando, setEliminando] = useState<string | null>(null)
    const [clonando, setClonando] = useState<string | null>(null)
    const [copiado, setCopiado] = useState<string | null>(null)
    const [visibleCliente, setVisibleCliente] = useState<boolean>(cotizacion?.visible_cliente ?? false)

    //! Eliminar cotización
    const handleEliminarCotizacion = async (cotizacionId: string) => {
        if (confirm('¿Estás seguro de eliminar esta cotización?')) {
            setEliminando(cotizacionId)
            const res = await eliminarCotizacion(cotizacionId)
            if (res) {
                onEliminarCotizacion(cotizacionId)
            }
            setTimeout(() => { setEliminando(null) }, 2000);
            if (res) {
                onEliminarCotizacion(cotizacionId)

            }
        }
    }

    //! Clonar cotización
    const handleClonarCotizacion = async (cotizacionId: string) => {
        if (confirm('¿Estás seguro de clonar esta cotización?')) {
            setClonando(cotizacionId)
            const response = await clonarCotizacion(cotizacionId)
            if (response.cotizacionId) {
                router.push(`/admin/dashboard/eventos/${eventoId}/cotizacion/${response.cotizacionId}`)
            }
        }
    }

    //! Copiar link de cotización
    const handleCopiarLink = async (cotizacionId: string) => {
        setCopiado(cotizacionId)
        const link = `${window.location.origin}/cotizacion/${cotizacionId}`
        await navigator.clipboard.writeText(link)
        setTimeout(() => setCopiado(null), 2000)
    }

    //! Compartir por WhatsApp
    const handleCompartirWhatsApp = (cotizacionId: string) => {
        const link = `${window.location.origin}/cotizacion/${cotizacionId}`
        const mensaje = `¡Hola! Te comparto la cotización para tu evento: ${link}`
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensaje)}`
        window.open(whatsappUrl, '_blank')
    }

    const handleVisibleCliente = async () => {
        const accion = visibleCliente ? 'archivar' : 'restaurar'
        if (confirm(`¿Estás seguro de ${accion} esta cotización?`)) {
            const nuevaVisibilidad = !visibleCliente
            if (cotizacion.id) {
                await actualizarVisibilidadCotizacion(cotizacion.id, nuevaVisibilidad)
                setVisibleCliente(nuevaVisibilidad)
            }
        }
    }

    return (
        <div>

            <div className='mb-4'>
                <div className='flex items-center justify-between'>
                    <button
                        onClick={() => router.push(`/admin/dashboard/eventos/${eventoId}/cotizacion/${cotizacion.id}`)}
                        className='flex items-center text-zinc-400 hover:text-zinc-100 mb-1 break-words text-start'
                    >
                        <Pencil size={12} className='md:mr-1 mr-3' />
                        <span className='block'>
                            {cotizacion.nombre} por {cotizacion.precio.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                        </span>
                    </button>
                    <p className='text-zinc-500 text-sm flex items-center'>
                        <Eye size={16} className='mr-2' /> {cotizacion.visitas}
                    </p>
                </div>
                <p className='text-sm text-zinc-500 italic'>
                    Creada el {cotizacion.createdAt ? new Date(cotizacion.createdAt).toLocaleString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric'
                    }) : 'Fecha no disponible'}
                </p>
            </div>

            {/* Footer con botones de acción */}
            <div className='border-t border-zinc-700 pt-3 mt-4'>
                {/* Botón de Autorización - Destacado si no está autorizado */}
                {cotizacion.status !== 'autorizado' && cotizacion.id && (
                    <div className="mb-3">
                        <BotonAutorizarCotizacion
                            cotizacionId={cotizacion.id}
                            eventoId={eventoId}
                            estadoInicial={cotizacion.status}
                            className="w-full"
                            mostrarTexto={true}
                            onAutorizado={() => {
                                // Callback opcional para refrescar la vista
                                window.location.reload();
                            }}
                        />
                    </div>
                )}

                {/* Status de autorización si ya está autorizado */}
                {cotizacion.status === 'autorizado' && (
                    <div className="mb-3 p-2 bg-green-900/30 border border-green-700 rounded-lg">
                        <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                            <Check size={16} />
                            Cotización Autorizada
                        </div>
                    </div>
                )}

                <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>

                    {/* //! Eliminar */}
                    <button
                        onClick={() => cotizacion.id && handleEliminarCotizacion(cotizacion.id)}
                        className={`text-sm flex items-center justify-center px-3 py-2 leading-3 border border-red-600 rounded-md bg-red-700 text-red-100 hover:bg-red-600 transition-colors ${eliminando === cotizacion.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={eliminando === cotizacion.id}
                    >
                        {eliminando === cotizacion.id ? 'Eliminando...' : <><Trash2 size={12} className='mr-1' />Eliminar</>}
                    </button>

                    <button
                        onClick={() => handleVisibleCliente()}
                        className={`text-sm flex items-center justify-center px-3 py-2 leading-3 border rounded-md transition-colors ${visibleCliente ? 'border-amber-600 bg-amber-700 text-amber-100 hover:bg-amber-600' : 'border-green-600 bg-green-700 text-green-100 hover:bg-green-600'}`}
                    >
                        {visibleCliente ? <><Archive size={12} className='mr-1' />Archivar</> : <><ArchiveRestore size={12} className='mr-1' />Restaurar</>}
                    </button>

                    <button
                        onClick={() => cotizacion.id && handleCopiarLink(cotizacion.id)}
                        className='text-sm flex items-center justify-center px-3 py-2 leading-3 border border-blue-600 rounded-md bg-blue-700 text-blue-100 hover:bg-blue-600 transition-colors'
                    >
                        {copiado === cotizacion.id ? (
                            <><Check size={12} className='mr-1' />Copiado</>
                        ) : (
                            <><Copy size={12} className='mr-1' />Copiar</>
                        )}
                    </button>

                    <button
                        onClick={() => cotizacion.id && handleCompartirWhatsApp(cotizacion.id)}
                        className='text-sm flex items-center justify-center px-3 py-2 leading-3 border border-green-600 rounded-md bg-green-700 text-green-100 hover:bg-green-600 transition-colors'
                    >
                        <MessageCircle size={12} className='mr-1' />WhatsApp
                    </button>

                    <button
                        onClick={() => cotizacion.id && handleClonarCotizacion(cotizacion.id)}
                        className={`text-sm flex items-center justify-center px-3 py-2 leading-3 border border-purple-600 rounded-md bg-purple-700 text-purple-100 hover:bg-purple-600 transition-colors ${clonando === cotizacion.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={clonando === cotizacion.id}
                    >
                        <Layers2 size={12} className='mr-1' />
                        {clonando === cotizacion.id ? 'Clonando...' : 'Clonar'}
                    </button>

                    <button
                        onClick={() => window.open(`/cotizacion/${cotizacion.id}?preview=true`, '_blank')}
                        className='text-sm flex items-center justify-center px-3 py-2 leading-3 border border-indigo-600 rounded-md bg-indigo-700 text-indigo-100 hover:bg-indigo-600 transition-colors'
                    >
                        <ArrowUpRight size={16} className='mr-1' />Preview
                    </button>

                </div>
            </div>
        </div>
    )
}
