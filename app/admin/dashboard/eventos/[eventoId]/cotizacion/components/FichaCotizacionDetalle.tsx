import React, { useState, useEffect } from 'react'
import { Cotizacion } from '@/app/admin/_lib/types'
import { clonarCotizacion, archivarCotizacion, desarchivarCotizacion, eliminarCotizacion, autorizarCotizacion, cancelarCotizacion, autorizarCotizacionConDatos } from '@/app/admin/_lib/actions/cotizacion/cotizacion.actions'
import { cambiarEtapaEvento } from '@/app/admin/_lib/actions/evento/eventoManejo/eventoManejo.actions'
import { useRouter } from 'next/navigation'
import BotonAutorizarCotizacion from '@/app/admin/dashboard/eventos/[eventoId]/cotizacion/components/BotonAutorizarCotizacion'
import ModalAutorizarCotizacion from '@/app/admin/dashboard/eventos/[eventoId]/components/ModalAutorizarCotizacion'
import { COTIZACION_STATUS } from '@/app/admin/_lib/constants/status'
import { EVENTO_ETAPAS } from '@/app/admin/_lib/constants/evento-etapas'

// Funciones helper para el badge de estado
const getStatusBadgeStyles = (status: string | undefined) => {
    if (!status) return 'bg-zinc-900/50 text-zinc-300 border-zinc-700'

    switch (status) {
        case COTIZACION_STATUS.PENDIENTE:
            return 'bg-zinc-800/50 text-zinc-400 border-zinc-600'
        case COTIZACION_STATUS.APROBADA:
            return 'bg-green-900/50 text-green-300 border-green-700'
        case COTIZACION_STATUS.AUTORIZADO:
            return 'bg-blue-900/50 text-blue-300 border-blue-700'
        case COTIZACION_STATUS.RECHAZADA:
            return 'bg-red-900/50 text-red-300 border-red-700'
        case COTIZACION_STATUS.EXPIRADA:
            return 'bg-gray-900/50 text-gray-300 border-gray-700'
        case COTIZACION_STATUS.ARCHIVADA:
            return 'bg-amber-900/50 text-amber-300 border-amber-700'
        default:
            return 'bg-zinc-900/50 text-zinc-300 border-zinc-700'
    }
}

const getStatusDisplayName = (status: string | undefined) => {
    if (!status) return 'Sin estado'

    switch (status) {
        case COTIZACION_STATUS.PENDIENTE:
            return 'Pendiente'
        case COTIZACION_STATUS.APROBADA:
            return 'Aprobada'
        case COTIZACION_STATUS.AUTORIZADO:
            return 'Autorizado'
        case COTIZACION_STATUS.RECHAZADA:
            return 'Rechazada'
        case COTIZACION_STATUS.EXPIRADA:
            return 'Expirada'
        case COTIZACION_STATUS.ARCHIVADA:
            return 'Archivada'
        default:
            return status || 'Sin estado'
    }
}
import { WhatsAppIcon } from '@/app/components/ui/WhatsAppIcon'
import ModalConfirmacionEliminacion from '@/app/admin/components/ui/ModalConfirmacionEliminacion'
import { useEliminacionCotizacion } from '@/app/hooks/useModalEliminacion'
import { toast } from 'sonner'

import { Pencil, Eye, Layers2, ArrowUpRight, Trash2, Archive, ArchiveRestore, Copy, Check, MoreVertical, CheckCircle, Calendar, XCircle } from 'lucide-react'

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
    const [cancelando, setCancelando] = useState(false)
    const [archivada, setArchivada] = useState<boolean>(cotizacion?.archivada ?? false)

    // Estado para el modal de autorización
    const [modalAutorizacionAbierto, setModalAutorizacionAbierto] = useState(false)

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
        if (cotizacion.status === COTIZACION_STATUS.APROBADA) {
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
                // Mostrar mensaje específico basado en si se archivaron cotizaciones
                const mensaje = response.cotizacionesArchivadas && response.cotizacionesArchivadas > 0
                    ? `Cotización aprobada exitosamente. ${response.cotizacionesArchivadas} cotización(es) adicional(es) fueron archivadas automáticamente.`
                    : 'Cotización aprobada exitosamente.'

                toast.success(mensaje)
                // Usar router.refresh() en lugar de window.location.reload() para mejor UX
                router.refresh()
            } else {
                toast.error(response.message || 'Error al aprobar cotización')
            }
        } catch (error) {
            console.error('Error aprobando cotización:', error)
            toast.error('Error al aprobar cotización')
        } finally {
            setAutorizando(false)
            setMenuAbierto(false)
        }
    }

    // Función para abrir modal de autorización
    const handleAbrirModalAutorizacion = () => {
        setModalAutorizacionAbierto(true)
        setMenuAbierto(false)
    }

    // Función para manejar la autorización con modal
    const handleAutorizarConModal = async (data: {
        condicionComercialId: string
        metodoPagoId: string
        montoAPagar: number
    }) => {
        try {
            if (!cotizacion.id) {
                throw new Error('ID de cotización no encontrado')
            }

            console.log('Autorizando cotización:', cotizacion.id, data)

            const response = await autorizarCotizacionConDatos({
                cotizacionId: cotizacion.id,
                condicionComercialId: data.condicionComercialId,
                metodoPagoId: data.metodoPagoId,
                montoAPagar: data.montoAPagar
            })

            if (response.success) {
                toast.success('Cotización autorizada exitosamente')
                setModalAutorizacionAbierto(false)
                router.refresh()
            } else {
                toast.error(response.message || 'Error al autorizar cotización')
                throw new Error(response.message || 'Error al autorizar cotización')
            }
        } catch (error) {
            console.error('Error al autorizar:', error)
            toast.error(error instanceof Error ? error.message : 'Error al autorizar cotización')
            throw error // Re-throw para que el modal maneje el error
        }
    }

    //! Cancelar cotización aprobada o autorizada
    const handleCancelarCotizacion = async () => {
        if (!cotizacion.id) return

        const confirmacion = confirm(
            '⚠️ ¿Estás seguro de cancelar esta cotización?\n\n' +
            'Esta acción:\n' +
            '• Cambiará el status de la cotización a PENDIENTE\n' +
            '• Cambiará el status del evento a PENDIENTE\n' +
            '• Cambiará la etapa del evento a NUEVO\n' +
            '• Cancelará todos los pagos realizados\n' +
            '• Eliminará el evento de la agenda si existe\n\n' +
            '¿Continuar con la cancelación?'
        )

        if (!confirmacion) return

        setCancelando(true)
        try {
            const resultado = await cancelarCotizacion(cotizacion.id)
            if (resultado.success) {
                // Cambiar la etapa del evento a "nuevo" después de la cancelación exitosa
                try {
                    await cambiarEtapaEvento({
                        eventoId: eventoId,
                        etapaId: EVENTO_ETAPAS.NUEVO
                    })
                } catch (etapaError) {
                    console.warn('No se pudo cambiar la etapa del evento:', etapaError)
                    // No interrumpimos el flujo por este error
                }

                let mensaje = 'Cotización cancelada exitosamente'

                if (resultado.detalles) {
                    const detalles = []
                    if (resultado.detalles.pagosAfectados > 0) {
                        detalles.push(`${resultado.detalles.pagosAfectados} pago(s) cancelado(s)`)
                    }
                    if (resultado.detalles.agendaEliminada) {
                        detalles.push('Evento eliminado de agenda')
                    }

                    if (detalles.length > 0) {
                        mensaje += `\n\n${detalles.join(', ')}`
                    }
                }

                // Agregar información sobre el cambio de etapa
                mensaje += '\n\nEvento movido a etapa "Nuevo"'

                toast.success(mensaje)
                router.refresh()
            } else {
                toast.error(resultado.message || 'Error al cancelar cotización')
            }
        } catch (error) {
            console.error('Error cancelando cotización:', error)
            toast.error('Error al cancelar cotización')
        } finally {
            setCancelando(false)
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
                        <div className="flex items-center gap-2 mb-1">
                            <button
                                onClick={() => router.push(`/admin/dashboard/eventos/${eventoId}/cotizacion/${cotizacion.id}`)}
                                className="font-medium text-zinc-200 hover:underline text-left break-words"
                                title={cotizacion.nombre}
                                style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                            >
                                {cotizacion.nombre} - {cotizacion.precio.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                            </button>

                        </div>
                        {cotizacion.descripcion && (
                            <div className="text-sm text-zinc-400 truncate max-w-full">
                                {cotizacion.descripcion}
                            </div>
                        )}

                        {/* Días mínimos de contratación - Solo mostrar si NO está aprobada */}
                        {cotizacion.dias_minimos_contratacion && cotizacion.status !== COTIZACION_STATUS.APROBADA && (
                            <div className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
                                <Calendar className="w-3 h-3" />
                                <span>Contratar con {cotizacion.dias_minimos_contratacion} días de anticipación</span>
                            </div>
                        )}

                        {/* Badge de estado */}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${getStatusBadgeStyles(cotizacion.status)} flex-shrink-0`}>
                            {getStatusDisplayName(cotizacion.status)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
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

                                {/* Autorizar - Solo si está en pendiente */}
                                {cotizacion.status === COTIZACION_STATUS.PENDIENTE && (
                                    <>
                                        <button
                                            onClick={handleAbrirModalAutorizacion}
                                            className="w-full px-3 py-2 text-left text-green-400 hover:bg-zinc-700 flex items-center gap-2 text-sm"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Autorizar cotización
                                        </button>
                                        <div className="border-t border-zinc-700 my-1"></div>
                                    </>
                                )}

                                {/* Cancelar cotización - Solo si está aprobada */}
                                {cotizacion.status === COTIZACION_STATUS.APROBADA && (
                                    <>
                                        <button
                                            onClick={handleCancelarCotizacion}
                                            disabled={cancelando}
                                            className="w-full px-3 py-2 text-left text-orange-400 hover:bg-zinc-700 flex items-center gap-2 text-sm disabled:opacity-50"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            {cancelando ? 'Cancelando...' : 'Cancelar cotización'}
                                        </button>
                                        <div className="border-t border-zinc-700 my-1"></div>
                                    </>
                                )}

                                {/* Cancelar cotización - Solo si está autorizada */}
                                {cotizacion.status === COTIZACION_STATUS.AUTORIZADO && (
                                    <>
                                        <button
                                            onClick={handleCancelarCotizacion}
                                            disabled={cancelando}
                                            className="w-full px-3 py-2 text-left text-orange-400 hover:bg-zinc-700 flex items-center gap-2 text-sm disabled:opacity-50"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            {cancelando ? 'Cancelando...' : 'Cancelar cotización'}
                                        </button>
                                        <div className="border-t border-zinc-700 my-1"></div>
                                    </>
                                )}

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
            <div className={`bg-zinc-950/60 rounded-md px-3 py-2 ${archivada ? 'opacity-30' : ''}`}>
                <div className="text-sm text-zinc-500 space-y-1">
                    <p>
                        Creada el {cotizacion.createdAt ? new Date(cotizacion.createdAt).toLocaleString('es-MX', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric'
                        }) : 'Fecha no disponible'}
                    </p>
                    <p>
                        Modificada el {cotizacion.updatedAt ? new Date(cotizacion.updatedAt).toLocaleString('es-MX', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric'
                        }) : 'Fecha no disponible'}
                    </p>
                </div>
            </div>

            {/* Status autorizado o aprobado */}
            {cotizacion.status === COTIZACION_STATUS.AUTORIZADO && (
                <div className={`mt-3 p-3 bg-blue-900/30 border border-blue-700 rounded-lg ${archivada ? 'opacity-30' : ''}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Cotización Autorizada
                        </div>
                        <button
                            onClick={() => router.push(`/admin/dashboard/seguimiento/${eventoId}`)}
                            className="text-blue-300 hover:text-blue-200 text-xs px-2 py-1 bg-blue-800/50 hover:bg-blue-800/70 rounded transition-colors"
                        >
                            Ir a seguimiento
                        </button>
                    </div>
                </div>
            )}

            {cotizacion.status === COTIZACION_STATUS.APROBADA && (
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

            {/* Modal de autorización */}
            <ModalAutorizarCotizacion
                isOpen={modalAutorizacionAbierto}
                onClose={() => setModalAutorizacionAbierto(false)}
                cotizacion={{
                    id: cotizacion.id || '',
                    nombre: cotizacion.nombre,
                    total: cotizacion.precio
                }}
                onAutorizar={handleAutorizarConModal}
            />
        </div>
    )
}
