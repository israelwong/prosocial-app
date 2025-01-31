import React, { useState } from 'react'
import { Cotizacion } from '@/app/admin/_lib/types'
import { eliminarCotizacion, clonarCotizacion } from '@/app/admin/_lib/cotizacion.actions'
import { useRouter } from 'next/navigation'
import { actualizarVisibilidadCotizacion } from '@/app/admin/_lib/cotizacion.actions'

import { Pencil, Eye, Layers2, ArrowUpRight, Trash2, Archive, ArchiveRestore } from 'lucide-react'

interface Props {
    cotizacion: Cotizacion
    onEliminarCotizacion: (cotizacionId: string) => void | Promise<void>
}

export default function FichaCotizacionDetalle({ cotizacion, onEliminarCotizacion }: Props) {

    const router = useRouter()
    const [eliminando, setEliminando] = useState<string | null>(null)
    const [clonando, setClonando] = useState<string | null>(null)

    // const [copiado, setCopiado] = useState<string | null>(null)
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
        setClonando(cotizacionId)
        const response = await clonarCotizacion(cotizacionId)
        if (response.cotizacionId) {
            router.push(`/admin/dashboard/cotizaciones/${response.cotizacionId}`)
        }
    }

    // const handleCopiar = async (cotizacionId: string) => {
    //     setCopiado(cotizacionId)
    //     await navigator.clipboard.writeText(`https://www.prosocial.mx/cotizacion/${cotizacionId}`)
    //     setTimeout(() => setCopiado(null), 2000)
    // }

    const handleVisibleCliente = async () => {
        const nuevaVisibilidad = !visibleCliente
        if (cotizacion.id) {
            await actualizarVisibilidadCotizacion(cotizacion.id, nuevaVisibilidad)
            setVisibleCliente(nuevaVisibilidad)
        }
        // console.log('nuevaVisibilidad', nuevaVisibilidad)
    }

    return (
        <div>

            <div className='mb-4'>
                <div className='flex items-center justify-between'>
                    <button
                        onClick={() => router.push(`/admin/dashboard/cotizaciones/${cotizacion.id}`)}
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
            <div className='items-center flex flex-wrap justify-start md:space-x-2 space-y-1 md:space-y-0'>

                {/* //! Eliminarº */}
                <button
                    onClick={() => cotizacion.id && handleEliminarCotizacion(cotizacion.id)}
                    className={`text-sm flex items-center px-3 py-2 leading-3 border border-zinc-800 rounded-md bg-red-900 ${eliminando === cotizacion.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={eliminando === cotizacion.id}
                >
                    {eliminando === cotizacion.id ? 'Eliminando...' : <Trash2 size={12} />}
                </button>

                <button
                    onClick={() => handleVisibleCliente()}
                    className={`text-sm flex items-center px-3 py-2 leading-3 border ${visibleCliente ? 'border-zinc-700 bg-zinc-900 text-zinc-300' : 'border-yellow-700 bg-yellow-900 text-yellow-300'} rounded-md`}
                >
                    {visibleCliente ? <Archive size={12} className='mr-1' /> : <ArchiveRestore size={12} className='mr-1' />}
                    {visibleCliente ? 'Archivar' : 'Restaurar'}
                </button>

                {/* <button
                    onClick={() => cotizacion.id && handleCopiar(cotizacion.id)}
                    className='text-sm flex items-center px-3 py-2 leading-3 border border-zinc-800 rounded-md bg-zinc-900'
                >
                    {copiado === cotizacion.id ? (
                        <>
                            <Check size={12} className='mr-1' /> Copiado
                        </>
                    ) : (
                        <>
                            <Copy size={12} className='mr-1' /> Copiar link
                        </>
                    )}
                </button> */}

                <button
                    onClick={() => cotizacion.id && handleClonarCotizacion(cotizacion.id)}
                    className={`text-sm flex items-center px-3 py-2 leading-3 border border-zinc-800 rounded-md bg-zinc-900 ${clonando === cotizacion.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={clonando === cotizacion.id}
                >
                    <Layers2 size={12} className='mr-1' />
                    {clonando === cotizacion.id ? 'Clonando...' : 'Clonar'}
                </button>

                <button
                    onClick={() => window.open(`/cotizacion/${cotizacion.id}?preview=true`, '_blank')}
                    className='text-sm flex items-center px-3 py-2 leading-3 border border-zinc-800 rounded-md bg-zinc-900'
                >
                    <ArrowUpRight size={16} className='mr-1' /> Preview

                </button>

            </div>
        </div>
    )
}
