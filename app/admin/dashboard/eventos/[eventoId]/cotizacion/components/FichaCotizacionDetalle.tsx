import React, { useState, useEffect } from 'react'
import { Cotizacion } from '@/app/admin/_lib/types'
import { clonarCotizacion, archivarCotizacion, desarchivarCotizacion } from '@/app/admin/_lib/cotizacion.actions'
import { eliminarCotizacion } from '@/app/admin/_lib/actions/cotizacion/cotizacion.actions'
import { useRouter } from 'next/navigation'
import { autorizarCotizacion } from '@/app/admin/_lib/autorizarCotizacion.actions'
import BotonAutorizarCotizacion from './BotonAutorizarCotizacion'
import { WhatsAppIcon } from '@/app/components/ui/WhatsAppIcon'
import ModalConfirmacionEliminacion from '@/app/components/ui/ModalConfirmacionEliminacion'
import { useEliminacionCotizacion } from '@/app/hooks/useModalEliminacion'
import { toast } from 'sonner'

import { Pencil, Eye, Layers2, ArrowUpRight, Trash2, Archive, ArchiveRestore, Copy, Check, MoreVertical, CheckCircle, Calendar } from 'lucide-react'

interface Props {
    cotizacion: Cotizacion
    onEliminarCotizacion: (cotizacionId: string) => void | Promise<void>
    eventoId: string
}

export default function FichaCotizacionDetalle({ cotizacion, onEliminarCotizacion, eventoId }: Props) {

    const router = useRouter()
    const [clonando, setClonando] = useState<string | null>(null)
    const [copiado, setCopiado] = useState<string | null>(null)
    const [menuAbierto, setMenuAbierto] = useState(false)
    const [autorizando, setAutorizando] = useState(false)
    const [archivada, setArchivada] = useState<boolean>(cotizacion?.archivada ?? false)

    // Hook para modal de eliminación
    const modalEliminacion = useEliminacionCotizacion()

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

    //! Eliminar cotización usando el modal
    const handleEliminarCotizacion = async (cotizacionId: string) => {
        const datos = modalEliminacion.prepararDatosCotizacion(cotizacion)

        // Agregar lógica para detectar si se debe ofrecer archivado
        // Si la cotización está aprobada, sugerir archivado cuando hay bloqueos
        if (cotizacion.status === 'aprobada') {
            // Agregar bloqueo usando la función del modal
            modalEliminacion.actualizarBloqueos(['Cotización aprobada con posibles dependencias activas'])
        }

        modalEliminacion.abrirModal(datos)
        setMenuAbierto(false)
    }

    //! Confirmar eliminación desde el modal
    const confirmarEliminacion = async () => {
        if (!cotizacion.id) return

        await modalEliminacion.ejecutarEliminacion(
            () => eliminarCotizacion(cotizacion.id!),
            (resultado) => {
                // Mensaje de éxito
                const { eliminados, preservados } = resultado
                let successMessage = 'Cotización eliminada exitosamente'

                if (eliminados) {
                    const detalles = []
                    if (eliminados.servicios > 0) detalles.push(`${eliminados.servicios} servicios`)
                    if (eliminados.visitas > 0) detalles.push(`${eliminados.visitas} visitas`)
                    if (eliminados.costos > 0) detalles.push(`${eliminados.costos} costos`)
                    if (eliminados.nominas > 0) detalles.push(`${eliminados.nominas} nóminas`)

                    if (detalles.length > 0) {
                        successMessage += `\n\nEliminados: ${detalles.join(', ')}`
                    }
                }

                if (preservados && (preservados.pagos > 0 || preservados.agendas > 0)) {
                    const preservadosDetalles = []
                    if (preservados.pagos > 0) preservadosDetalles.push(`${preservados.pagos} pagos`)
                    if (preservados.agendas > 0) preservadosDetalles.push(`${preservados.agendas} agendas`)

                    if (preservadosDetalles.length > 0) {
                        successMessage += `\nPreservados: ${preservadosDetalles.join(', ')}`
                    }
                }

                toast.success(successMessage)
                onEliminarCotizacion(cotizacion.id!)
            },
            (error) => {
                toast.error(typeof error === 'string' ? error : 'Error inesperado al eliminar la cotización')
            }
        )
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
        const link = `${window.location.origin}/evento/${eventoId}/cotizacion/${cotizacionId}`
        await navigator.clipboard.writeText(link)
        setTimeout(() => setCopiado(null), 2000)
        setMenuAbierto(false)
    }

    //! Compartir por WhatsApp
    const handleCompartirWhatsApp = (cotizacionId: string) => {
        const link = `${window.location.origin}/evento/${eventoId}/cotizacion/${cotizacionId}`
        const mensaje = `¡Hola! Te comparto la cotización para tu evento: ${link}`
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensaje)}`
        window.open(whatsappUrl, '_blank')
        setMenuAbierto(false)
    }

    const handlePreview = () => {
        window.open(`/evento/${eventoId}/cotizacion/${cotizacion.id}?preview=true`, '_blank')
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

    //! Archivar cotización
    const handleArchivarCotizacion = async () => {
        if (!cotizacion.id) return

        try {
            const resultado = await archivarCotizacion(cotizacion.id)
            if (resultado.success) {
                setArchivada(true)
                toast.success('Cotización archivada exitosamente')
            } else {
                toast.error(resultado.message || 'Error al archivar cotización')
            }
        } catch (error) {
            console.error('Error archivando cotización:', error)
            toast.error('Error al archivar cotización')
        }
        setMenuAbierto(false)
    }

    //! Desarchivar cotización
    const handleDesarchivarCotizacion = async () => {
        if (!cotizacion.id) return

        try {
            const resultado = await desarchivarCotizacion(cotizacion.id)
            if (resultado.success) {
                setArchivada(false)
                toast.success('Cotización desarchivada exitosamente')
            } else {
                toast.error(resultado.message || 'Error al desarchivar cotización')
            }
        } catch (error) {
            console.error('Error desarchivando cotización:', error)
            toast.error('Error al desarchivar cotización')
        }
        setMenuAbierto(false)
    }

    return (
        <div className={`space-y-4 ${archivada ? 'bg-amber-900/30 border-2 border-amber-600/60 rounded-lg p-4' : ''}`}>
            {/* Indicador de archivado */}
            {archivada && (
                <div className="bg-amber-900/50 border border-amber-500 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-200 text-sm font-medium">
                            <Archive className="w-4 h-4" />
                            Cotización Archivada
                        </div>
                        <button
                            onClick={handleDesarchivarCotizacion}
                            className="text-amber-200 hover:text-amber-100 text-xs px-2 py-1 bg-amber-800/60 hover:bg-amber-800/80 rounded transition-colors flex items-center gap-1"
                        >
                            <ArchiveRestore className="w-3 h-3" />
                            Desarchivar
                        </button>
                    </div>
                </div>
            )}

            {/* Header con título como link y menú contextual */}
            <div className="flex items-start justify-between">
                <div className={`flex items-start gap-2 flex-1 min-w-0 ${archivada ? 'opacity-30' : ''}`}>
                    <button
                        onClick={() => router.push(`/admin/dashboard/eventos/${eventoId}/cotizacion/${cotizacion.id}`)}
                        className="text-zinc-300 hover:text-zinc-100 transition-colors mt-1"
                        title="Editar cotización"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <div className="text-left min-w-0">
                        <button
                            onClick={() => router.push(`/admin/dashboard/eventos/${eventoId}/cotizacion/${cotizacion.id}`)}
                            className="font-medium text-zinc-200 hover:underline text-left break-words"
                            title={cotizacion.nombre}
                            style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                        >
                            {cotizacion.nombre} - {cotizacion.precio.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                        </button>
                        <div className="text-sm text-zinc-400 truncate max-w-full">
                            {cotizacion.descripcion || (cotizacion.servicios?.length ? `${cotizacion.servicios.length} servicios incluidos` : 'Sin descripción')}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Contador de visitas */}
                    <div className={`flex items-center gap-1 text-zinc-500 text-sm ml-2 ${archivada ? 'opacity-30' : ''}`}>
                        <Eye className="w-4 h-4" />
                        <span>{cotizacion.visitas}</span>
                    </div>

                    {/* Menú contextual - siempre visible */}
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
                                {cotizacion.status !== 'autorizado' && cotizacion.status !== 'aprobada' && (
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

                                {/* Ir a seguimiento - Solo si está aprobada */}
                                {cotizacion.status === 'aprobada' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                router.push(`/admin/dashboard/seguimiento/${eventoId}`)
                                                setMenuAbierto(false)
                                            }}
                                            className="w-full px-3 py-2 text-left text-blue-400 hover:bg-zinc-700 flex items-center gap-2 text-sm"
                                        >
                                            <Calendar className="w-4 h-4" />
                                            Ir a seguimiento
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

                                {/* Archivar/Desarchivar para cualquier cotización */}
                                <button
                                    onClick={archivada ? handleDesarchivarCotizacion : handleArchivarCotizacion}
                                    className="w-full px-3 py-2 text-left text-amber-400 hover:bg-zinc-700 flex items-center gap-2 text-sm"
                                >
                                    {archivada ? (
                                        <>
                                            <ArchiveRestore className="w-4 h-4" />
                                            Desarchivar cotización
                                        </>
                                    ) : (
                                        <>
                                            <Archive className="w-4 h-4" />
                                            Archivar cotización
                                        </>
                                    )}
                                </button>

                                <div className="border-t border-zinc-700 my-1"></div>

                                {/* Eliminar */}
                                <button
                                    onClick={() => cotizacion.id && handleEliminarCotizacion(cotizacion.id)}
                                    disabled={modalEliminacion.isLoading}
                                    className="w-full px-3 py-2 text-left text-red-400 hover:bg-zinc-700 flex items-center gap-2 text-sm disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {modalEliminacion.isLoading ? 'Eliminando...' : 'Eliminar'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Información adicional */}
            <div className={`text-sm text-zinc-500 space-y-1 ${archivada ? 'opacity-30' : ''}`}>
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

            {/* Status autorizado o aprobado */}
            {cotizacion.status === 'autorizado' && (
                <div className={`mt-3 p-3 bg-blue-900/30 border border-blue-700 rounded-lg ${archivada ? 'opacity-30' : ''}`}>
                    <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Cotización Autorizada
                    </div>
                </div>
            )}

            {cotizacion.status === 'aprobada' && (
                <div className={`mt-3 p-3 bg-green-900/30 border border-green-700 rounded-lg ${archivada ? 'opacity-30' : ''}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Cotización Aprobada
                        </div>
                        <button
                            onClick={() => router.push(`/admin/dashboard/seguimiento/${eventoId}`)}
                            className="text-green-300 hover:text-green-200 text-xs px-2 py-1 bg-green-800/50 hover:bg-green-800/70 rounded transition-colors"
                        >
                            Ir a seguimiento
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de confirmación de eliminación */}
            {modalEliminacion.datos && (
                <ModalConfirmacionEliminacion
                    isOpen={modalEliminacion.isOpen}
                    onClose={modalEliminacion.cerrarModal}
                    onConfirm={confirmarEliminacion}
                    titulo="Eliminar Cotización"
                    entidad={modalEliminacion.datos.entidad}
                    dependencias={modalEliminacion.datos.dependencias}
                    advertencias={modalEliminacion.datos.advertencias}
                    bloqueos={modalEliminacion.datos.bloqueos}
                    isLoading={modalEliminacion.isLoading}
                    loadingText="Eliminando cotización..."
                    onArchivar={handleArchivarCotizacion}
                    mostrarBotonArchivar={!archivada}
                />
            )}
        </div>
    )
}
