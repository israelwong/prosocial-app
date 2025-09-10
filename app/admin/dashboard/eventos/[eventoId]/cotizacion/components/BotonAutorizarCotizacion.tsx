'use client'
import React, { useState } from 'react';
import { CheckCircle, Loader2, Calendar, XCircle, Trash2 } from 'lucide-react';
import { autorizarCotizacion, verificarEstadoAutorizacion, cancelarCotizacion, eliminarCotizacion, obtenerCotizacionCompleta } from '@/app/admin/_lib/actions/cotizacion/cotizacion.actions';
import { obtenerCuentaPrincipal } from '@/app/admin/_lib/actions/negocio/negocioBanco.actions';
import { cambiarEtapaEvento } from '@/app/admin/_lib/actions/evento/eventoManejo/eventoManejo.actions';
import { COTIZACION_STATUS } from '@/app/admin/_lib/constants/status';
import { EVENTO_ETAPAS } from '@/app/admin/_lib/constants/evento-etapas';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import ModalConfirmacionEliminacion from '@/app/admin/components/ui/ModalConfirmacionEliminacion';
import { useEliminacionCotizacion } from '@/app/hooks/useModalEliminacion';

interface BotonAutorizarCotizacionProps {
    cotizacionId: string;
    eventoId: string;
    estadoInicial?: string;
    className?: string;
    mostrarTexto?: boolean;
    onAutorizado?: () => void;
    onEliminado?: () => void;
    cotizacion?: {
        id: string;
        nombre: string;
        status: string;
        archivada?: boolean;
    };
}

export default function BotonAutorizarCotizacion({
    cotizacionId,
    eventoId,
    estadoInicial = COTIZACION_STATUS.PENDIENTE,
    className = '',
    mostrarTexto = true,
    onAutorizado,
    onEliminado,
    cotizacion
}: BotonAutorizarCotizacionProps) {
    const [procesando, setProcesando] = useState(false);
    const [cancelando, setCancelando] = useState(false);
    const [estaAutorizado, setEstaAutorizado] = useState(estadoInicial === COTIZACION_STATUS.AUTORIZADO);
    const [estaAprobado, setEstaAprobado] = useState(estadoInicial === COTIZACION_STATUS.APROBADA);
    const router = useRouter();

    // Hook para modal de eliminación
    const modalEliminacion = useEliminacionCotizacion();

    const manejarAutorizacion = async () => {
        if (estaAutorizado || estaAprobado) {
            toast.info('Esta cotización ya está autorizada');
            return;
        }

        // Redirigir a la página dedicada de autorización
        router.push(`/admin/dashboard/eventos/${eventoId}/cotizacion/${cotizacionId}/autorizar`);
    };

    const confirmarAutorizacion = async () => {
        setProcesando(true);

        try {
            console.log('🔥 Iniciando autorización desde UI:', cotizacionId);

            const resultado = await autorizarCotizacion(cotizacionId);

            if (resultado.success) {
                setEstaAprobado(true);
                toast.success(resultado.message || 'Cotización autorizada exitosamente');

                // Callback personalizado si se proporciona
                if (onAutorizado) {
                    onAutorizado();
                }

                // Refresh para actualizar la UI
                router.refresh();

            } else {
                toast.error(resultado.error || 'Error al autorizar cotización');
                console.error('❌ Error en autorización:', resultado.error);
            }

        } catch (error) {
            console.error('❌ Error inesperado al autorizar:', error);
            toast.error('Error inesperado al autorizar cotización');
        } finally {
            setProcesando(false);
        }
    };

    //! Cancelar cotización aprobada
    const handleCancelarCotizacion = async () => {
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
            const resultado = await cancelarCotizacion(cotizacionId)
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
                setEstaAprobado(false)
                setEstaAutorizado(false)
                router.refresh()
            } else {
                toast.error(resultado.message || 'Error al cancelar cotización')
            }
        } catch (error) {
            console.error('Error cancelando cotización:', error)
            toast.error('Error al cancelar cotización')
        } finally {
            setCancelando(false)
        }
    }

    //! Eliminar cotización usando el modal
    const handleEliminarCotizacion = async () => {
        if (!cotizacion) {
            toast.error('Datos de cotización no disponibles');
            return;
        }

        const datos = modalEliminacion.prepararDatosCotizacion(cotizacion)

        // Agregar lógica para detectar si se debe ofrecer archivado
        // Si la cotización está aprobada, sugerir archivado cuando hay bloqueos
        if (cotizacion.status === COTIZACION_STATUS.APROBADA) {
            // Agregar bloqueo usando la función del modal
            modalEliminacion.actualizarBloqueos(['Cotización aprobada con posibles dependencias activas'])
        }

        modalEliminacion.abrirModal(datos)
    }

    //! Confirmar eliminación desde el modal
    const confirmarEliminacion = async () => {
        await modalEliminacion.ejecutarEliminacion(
            () => eliminarCotizacion(cotizacionId),
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
                if (onEliminado) {
                    onEliminado()
                }
            },
            (error) => {
                toast.error(typeof error === 'string' ? error : 'Error inesperado al eliminar la cotización')
            }
        )
    }

    const verificarEstado = async () => {
        try {
            const estado = await verificarEstadoAutorizacion(cotizacionId);
            if (estado.estaAutorizado) {
                setEstaAutorizado(true);
            }
            // Verificar también si está aprobado basándose en el estado inicial
            if (estadoInicial === COTIZACION_STATUS.APROBADA) {
                setEstaAprobado(true);
            }
        } catch (error) {
            console.error('Error verificando estado:', error);
        }
    };

    React.useEffect(() => {
        verificarEstado();
        // Actualizar estados basándose en el estado inicial
        setEstaAutorizado(estadoInicial === COTIZACION_STATUS.AUTORIZADO);
        setEstaAprobado(estadoInicial === COTIZACION_STATUS.APROBADA);
    }, [cotizacionId, estadoInicial]);

    // Si está aprobado, mostrar botones de seguimiento y cancelar
    if (estaAprobado || estadoInicial === COTIZACION_STATUS.APROBADA) {
        return (
            <div className={`space-y-2 ${className}`}>
                {/* Estado aprobado */}
                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg">
                    <CheckCircle size={16} />
                    {mostrarTexto && <span className="text-sm font-medium text-center">Cotización Aprobada</span>}
                </div>

                {/* Botones de acción */}
                <div className="flex flex-wrap gap-2 justify-center w-full">
                    <button
                        onClick={() => router.push(`/admin/dashboard/seguimiento/${eventoId}`)}
                        className="flex-1 min-w-[120px] p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center"
                        title="Seguimiento"
                        aria-label="Seguimiento"
                    >
                        <svg className="mr-2" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14"></path>
                            <path d="M12 5l7 7-7 7"></path>
                        </svg>
                        <span className="text-sm font-medium">Seguimiento</span>
                    </button>
                    <button
                        onClick={handleCancelarCotizacion}
                        disabled={cancelando}
                        className="flex-1 min-w-[120px] p-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors flex items-center justify-center disabled:opacity-50"
                        title="Cancelar"
                        aria-label="Cancelar"
                    >
                        <XCircle size={18} className="mr-2" />
                        <span className="text-sm font-medium">Cancelar</span>
                    </button>
                    {cotizacion && (
                        <button
                            onClick={handleEliminarCotizacion}
                            disabled={modalEliminacion.isLoading}
                            className="flex-1 min-w-[120px] p-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center justify-center disabled:opacity-50"
                            title="Eliminar"
                            aria-label="Eliminar"
                        >
                            <Trash2 size={18} className="mr-2" />
                            <span className="text-sm font-medium">Eliminar</span>
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Si está autorizado
    if (estaAutorizado) {
        return (
            <div className={`flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg ${className}`}>
                <CheckCircle size={16} />
                {mostrarTexto && <span className="text-sm font-medium text-center">Autorizado</span>}
            </div>
        );
    }

    // Botón de autorizar (estado pendiente)
    return (
        <div className={className}>
            <button
                onClick={manejarAutorizacion}
                disabled={procesando}
                className="
                    w-full flex items-center justify-center gap-2 px-4 py-3 
                    bg-green-600 hover:bg-green-700 
                    text-white rounded-lg 
                    transition-colors duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                    text-center min-w-0
                "
                title="Autorizar cotización y mover evento al pipeline de seguimiento"
            >
                {procesando ? (
                    <>
                        <Loader2 size={16} className="animate-spin flex-shrink-0" />
                        {mostrarTexto && <span className="text-sm font-medium truncate">Autorizando...</span>}
                    </>
                ) : (
                    <>
                        <CheckCircle size={16} className="flex-shrink-0" />
                        {mostrarTexto && <span className="text-sm font-medium truncate">Autorizar Cotización</span>}
                    </>
                )}
            </button>

            {/* Modal de eliminación */}
            {modalEliminacion.isOpen && modalEliminacion.datos && (
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
                />
            )}
        </div>
    );
}
