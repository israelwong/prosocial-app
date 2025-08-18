import React, { useState, useEffect } from 'react'
import { Cotizacion } from '@/app/admin/_lib/types'
import { eliminarCotizacion, clonarCotizacion } from '@/app/admin/_lib/cotizacion.actions'
import { useRouter } from 'next/navigation'
import { actualizarVisibilidadCotizacion } from '@/app/admin/_lib/cotizacion.actions'
import { autorizarCotizacion } from '@/app/admin/_lib/autorizarCotizacion.actions'
import BotonAutorizarCotizacion from './BotonAutorizarCotizacion'
import { WhatsAppIcon } from '@/app/components/ui/WhatsAppIcon'
import { toast } from 'sonner'

import { Pencil, Eye, Layers2, ArrowUpRight, Trash2, Archive, ArchiveRestore, Copy, Check, MoreVertical, CheckCircle } from 'lucide-react'

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
    const [menuAbierto, setMenuAbierto] = useState(false)
    const [autorizando, setAutorizando] = useState(false)

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element
            if (!target.closest('.menu-container')) {
                setMenuAbierto(false)
            }
        }

        if (menuAbierto) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [menuAbierto])

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
            setMenuAbierto(false)
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
            setMenuAbierto(false)
        }
    }

    //! Copiar link de cotización
    const handleCopiarLink = async (cotizacionId: string) => {
        setCopiado(cotizacionId)
        const link = `${window.location.origin}/cotizacion/${cotizacionId}`
        await navigator.clipboard.writeText(link)
        setTimeout(() => setCopiado(null), 2000)
        setMenuAbierto(false)
    }

    //! Compartir por WhatsApp
    const handleCompartirWhatsApp = (cotizacionId: string) => {
        const link = `${window.location.origin}/cotizacion/${cotizacionId}`
        const mensaje = `¡Hola! Te comparto la cotización para tu evento: ${link}`
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensaje)}`
        window.open(whatsappUrl, '_blank')
        setMenuAbierto(false)
    }

    const handleVisibleCliente = async () => {
        const accion = visibleCliente ? 'archivar' : 'restaurar'
        if (confirm(`¿Estás seguro de ${accion} esta cotización?`)) {
            const nuevaVisibilidad = !visibleCliente
            if (cotizacion.id) {
                await actualizarVisibilidadCotizacion(cotizacion.id, nuevaVisibilidad)
                setVisibleCliente(nuevaVisibilidad)
            }
            setMenuAbierto(false)
        }
    }

    const handlePreview = () => {
        window.open(`/cotizacion/${cotizacion.id}?preview=true`, '_blank')
        setMenuAbierto(false)
    }

    const handleAutorizar = async () => {
        if (!cotizacion.id) return

        setAutorizando(true)
        try {
            const response = await autorizarCotizacion(cotizacion.id)
            if (response.success) {
                toast.success('Cotización autorizada exitosamente')
                window.location.reload() // Refrescar para actualizar el estado
            } else {
                toast.error(response.message || 'Error al autorizar cotización')
            }
        } catch (error) {
            console.error('Error autorizando cotización:', error)
            toast.error('Error al autorizar cotización')
        } finally {
            setAutorizando(false)
            setMenuAbierto(false)
        }
    }

    return (
        <div className="space-y-4">
            {/* Header con título como link y menú contextual */}
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                    <button
                        onClick={() => router.push(`/admin/dashboard/eventos/${eventoId}/cotizacion/${cotizacion.id}`)}
                        className="text-zinc-300 hover:text-zinc-100 transition-colors mt-1"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <div className="text-left">
                        <div className="font-medium text-zinc-200">
                            {cotizacion.nombre} - {cotizacion.precio.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                        </div>
                        <div className="text-sm text-zinc-400">
                            {cotizacion.servicios?.length ? `${cotizacion.servicios.length} servicios incluidos` : 'Sin descripción'}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Contador de visitas */}
                    <div className="flex items-center gap-1 text-zinc-500 text-sm ml-2">
                        <Eye className="w-4 h-4" />
                        <span>{cotizacion.visitas}</span>
                    </div>

                    {/* Menú contextual */}
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

                                {/* Preview */}
                                <button
                                    onClick={handlePreview}
                                    className="w-full px-3 py-2 text-left text-zinc-200 hover:bg-zinc-700 flex items-center gap-2 text-sm"
                                >
                                    <ArrowUpRight className="w-4 h-4" />
                                    Preview
                                </button>

                                {/* Copiar link */}
                                <button
                                    onClick={() => cotizacion.id && handleCopiarLink(cotizacion.id)}
                                    className="w-full px-3 py-2 text-left text-zinc-200 hover:bg-zinc-700 flex items-center gap-2 text-sm"
                                >
                                    {copiado === cotizacion.id ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Copiado
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copiar link
                                        </>
                                    )}
                                </button>

                                {/* WhatsApp */}
                                <button
                                    onClick={() => cotizacion.id && handleCompartirWhatsApp(cotizacion.id)}
                                    className="w-full px-3 py-2 text-left text-zinc-200 hover:bg-zinc-700 flex items-center gap-2 text-sm"
                                >
                                    <WhatsAppIcon className="w-4 h-4" size={16} />
                                    Compartir cotización
                                </button>

                                {/* Autorizar - Solo si no está autorizado */}
                                {cotizacion.status !== 'autorizado' && (
                                    <>
                                        <button
                                            onClick={handleAutorizar}
                                            disabled={autorizando}
                                            className="w-full px-3 py-2 text-left text-green-400 hover:bg-zinc-700 flex items-center gap-2 text-sm disabled:opacity-50"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            {autorizando ? 'Autorizando...' : 'Autorizar cotización'}
                                        </button>
                                        <div className="border-t border-zinc-700 my-1"></div>
                                    </>
                                )}


                                <div className="border-t border-zinc-700 my-1"></div>

                                {/* Clonar */}
                                <button
                                    onClick={() => cotizacion.id && handleClonarCotizacion(cotizacion.id)}
                                    disabled={clonando === cotizacion.id}
                                    className="w-full px-3 py-2 text-left text-zinc-200 hover:bg-zinc-700 flex items-center gap-2 text-sm disabled:opacity-50"
                                >
                                    <Layers2 className="w-4 h-4" />
                                    {clonando === cotizacion.id ? 'Clonando...' : 'Clonar'}
                                </button>

                                {/* Archivar/Restaurar */}
                                <button
                                    onClick={handleVisibleCliente}
                                    className="w-full px-3 py-2 text-left text-zinc-200 hover:bg-zinc-700 flex items-center gap-2 text-sm"
                                >
                                    {visibleCliente ? (
                                        <>
                                            <Archive className="w-4 h-4" />
                                            Archivar
                                        </>
                                    ) : (
                                        <>
                                            <ArchiveRestore className="w-4 h-4" />
                                            Restaurar
                                        </>
                                    )}
                                </button>

                                <div className="border-t border-zinc-700 my-1"></div>

                                {/* Eliminar */}
                                <button
                                    onClick={() => cotizacion.id && handleEliminarCotizacion(cotizacion.id)}
                                    disabled={eliminando === cotizacion.id}
                                    className="w-full px-3 py-2 text-left text-red-400 hover:bg-zinc-700 flex items-center gap-2 text-sm disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {eliminando === cotizacion.id ? 'Eliminando...' : 'Eliminar'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Información adicional */}
            <div className="text-sm text-zinc-500 space-y-1">
                <p>
                    Creada el {cotizacion.createdAt ? new Date(cotizacion.createdAt).toLocaleString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric'
                    }) : 'Fecha no disponible'}
                </p>
            </div>

            {/* Status autorizado */}
            {cotizacion.status === 'autorizado' && (
                <div className="mt-3 p-3 bg-green-900/30 border border-green-700 rounded-lg">
                    <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Cotización Autorizada
                    </div>
                </div>
            )}
        </div>
    )
}
