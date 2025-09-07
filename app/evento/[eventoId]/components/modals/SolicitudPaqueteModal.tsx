'use client'
import React, { useState } from 'react'
import { Check, MessageCircle, Package, X, Clock, AlertTriangle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { validarFechaEvento, type ValidacionFecha } from '@/app/lib/validaciones-fecha'

interface Paquete {
    id: string
    nombre: string
    precio: number
    eventoTipoId?: string
    eventoTipo?: string
    dias_minimos_contratacion?: number
    dias_minimos_explicacion?: string
}

interface Cliente {
    nombre?: string
    email?: string
    telefono?: string
}

interface Evento {
    fecha_evento?: string | Date
    tipo_evento?: string
}

interface SolicitudPaqueteModalProps {
    paquete: Paquete
    eventoId: string
    cliente?: Cliente
    evento?: Evento
    onClose: () => void
    onSuccess?: () => void
}

export default function SolicitudPaqueteModal({
    paquete,
    eventoId,
    cliente,
    evento,
    onClose,
    onSuccess
}: SolicitudPaqueteModalProps) {
    const [enviandoSolicitud, setEnviandoSolicitud] = useState(false)
    const [mostrarExito, setMostrarExito] = useState(false)

    const formatearPrecio = (precio: number): string => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(precio)
    }

    // Función para validar si la fecha del evento cumple con los días mínimos
    const validacionFecha: ValidacionFecha = validarFechaEvento(
        evento?.fecha_evento,
        paquete.dias_minimos_contratacion,
        paquete.dias_minimos_explicacion
    )

    const confirmarSolicitudPaquete = async () => {
        setEnviandoSolicitud(true)
        try {
            const response = await fetch('/api/cliente-portal/solicitudes-paquete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paqueteId: paquete.id,
                    eventoId,
                    clienteId: cliente?.email,
                    validacionFecha: {
                        cumpleRequisitos: validacionFecha.esValida,
                        diasRestantes: validacionFecha.diasRestantes,
                        diasMinimosRequeridos: paquete.dias_minimos_contratacion
                    }
                })
            })

            if (response.ok) {
                setMostrarExito(true)
                // NO llamar onSuccess() aquí - dejamos que el usuario vea el mensaje
                // onSuccess se llamará cuando cierre el modal de éxito
            } else {
                toast.error('Error al enviar la solicitud')
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error al enviar la solicitud')
        } finally {
            setEnviandoSolicitud(false)
        }
    }

    const cerrarModalExito = () => {
        setMostrarExito(false)
        if (onSuccess) {
            onSuccess()
        }
        onClose()
    }

    if (mostrarExito) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-zinc-900 rounded-xl border border-zinc-700 shadow-2xl max-w-md w-full mx-4">
                    {/* Header del modal */}
                    <div className="p-6 border-b border-zinc-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
                                <Check className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    ¡Solicitud Enviada!
                                </h3>
                                <p className="text-sm text-zinc-400">
                                    Tu solicitud ha sido procesada exitosamente
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contenido del modal */}
                    <div className="p-6">
                        <div className="bg-green-900/20 rounded-lg p-4 border border-green-700/30 mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Check className="w-5 h-5 text-green-400" />
                                <span className="font-medium text-green-400">
                                    Solicitud enviada exitosamente
                                </span>
                            </div>
                            <p className="text-sm text-zinc-300 leading-relaxed">
                                Hemos enviado tu solicitud del paquete <strong className="text-blue-400">{paquete.nombre}</strong>.
                                Pronto un asesor la revisará y podrás verla lista para poder reservarla.
                            </p>
                        </div>

                        <div className="bg-zinc-800/50 rounded-lg p-4 mb-6">
                            <h4 className="font-medium text-white mb-3">¿Qué sigue?</h4>
                            <div className="space-y-2 text-sm text-zinc-300">
                                <div className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                                    <p>Un asesor revisará tu solicitud</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                                    <p>El paquete aparecerá en tus opciones disponibles</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                                    <p>Podrás proceder con la reservación cuando esté listo</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/30">
                            <div className="flex items-center gap-2 mb-2">
                                <Package className="w-4 h-4 text-blue-400" />
                                <span className="text-sm font-medium text-blue-400">
                                    Paquete solicitado
                                </span>
                            </div>
                            <div className="text-sm text-zinc-300">
                                <p className="font-medium">{paquete.nombre}</p>
                                <p className="text-zinc-400">{formatearPrecio(paquete.precio || 0)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer del modal */}
                    <div className="p-6 border-t border-zinc-700">
                        <button
                            onClick={cerrarModalExito}
                            className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 rounded-xl border border-zinc-700 shadow-2xl max-w-md w-full mx-4">
                {/* Header del modal */}
                <div className="p-6 border-b border-zinc-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    Solicitar Paquete
                                </h3>
                                <p className="text-sm text-zinc-400">
                                    Confirma tu solicitud al asesor
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-zinc-400 hover:text-white transition-colors p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Contenido del modal */}
                <div className="p-6">
                    <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 mb-6">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-blue-400">
                                {paquete.nombre}
                            </h4>
                            <span className="text-xl font-bold text-white">
                                {formatearPrecio(paquete.precio || 0)}
                            </span>
                        </div>
                        {paquete.eventoTipo && (
                            <p className="text-sm text-zinc-400">
                                Tipo de evento: {paquete.eventoTipo}
                            </p>
                        )}
                    </div>

                    <div className="bg-zinc-800/50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-zinc-300 leading-relaxed">
                            {validacionFecha.esValida ? (
                                <>
                                    ¿Deseas solicitar información adicional sobre este paquete?
                                    Un asesor se pondrá en contacto contigo para brindarte más detalles
                                    y resolver cualquier duda que puedas tener.
                                </>
                            ) : (
                                <>
                                    Tu evento no cumple con el tiempo mínimo de contratación para este paquete.
                                    Sin embargo, podemos consultar disponibilidad especial. Un asesor revisará
                                    tu caso particular y te contactará con opciones disponibles.
                                </>
                            )}
                        </p>
                    </div>

                    {/* Información de días mínimos de contratación */}
                    {paquete.dias_minimos_contratacion && (
                        <div className={`rounded-lg p-4 mb-6 border ${validacionFecha.esValida
                            ? 'bg-amber-900/20 border-amber-700/30'
                            : 'bg-red-900/20 border-red-700/30'
                            }`}>
                            <div className="flex items-center gap-2 mb-2">
                                {validacionFecha.esValida ? (
                                    <Clock className="w-4 h-4 text-amber-400" />
                                ) : (
                                    <AlertTriangle className="w-4 h-4 text-red-400" />
                                )}
                                <span className={`text-sm font-medium ${validacionFecha.esValida ? 'text-amber-400' : 'text-red-400'
                                    }`}>
                                    Tiempo mínimo de contratación
                                </span>
                            </div>
                            <div className="text-sm text-zinc-300">
                                <p className="font-medium mb-1">
                                    {paquete.dias_minimos_contratacion} días naturales mínimo
                                </p>
                                <p className="text-zinc-400 leading-relaxed mb-2">
                                    {paquete.dias_minimos_explicacion ||
                                        "Tiempo mínimo requerido para garantizar la disponibilidad y coordinación del evento"}
                                </p>
                                {evento?.fecha_evento && (
                                    <>
                                        <p className={`text-sm leading-relaxed mb-2 ${validacionFecha.esValida ? 'text-amber-200' : 'text-red-200'
                                            }`}>
                                            {validacionFecha.mensaje}
                                        </p>
                                        {validacionFecha.mensajeFechaLimite && (
                                            <p className={`text-sm leading-relaxed ${validacionFecha.esValida ? 'text-blue-200' : 'text-orange-200'
                                                }`}>
                                                <span className="font-medium">📅 </span>
                                                {validacionFecha.mensajeFechaLimite}
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Información del cliente */}
                    {cliente && (cliente.nombre || cliente.email) && (
                        <div className="bg-green-900/20 rounded-lg p-4 mb-6 border border-green-700/30">
                            <div className="flex items-center gap-2 mb-2">
                                <Check className="w-4 h-4 text-green-400" />
                                <span className="text-sm font-medium text-green-400">
                                    Tu información de contacto
                                </span>
                            </div>
                            <div className="text-sm text-zinc-300 space-y-1">
                                {cliente.nombre && <p>{cliente.nombre}</p>}
                                {cliente.email && <p>{cliente.email}</p>}
                                {cliente.telefono && <p>{cliente.telefono}</p>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer del modal */}
                <div className="p-6 border-t border-zinc-700 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={enviandoSolicitud}
                        className="flex-1 px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={confirmarSolicitudPaquete}
                        disabled={enviandoSolicitud}
                        className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${validacionFecha.esValida
                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                            : 'bg-amber-600 hover:bg-amber-700 text-white'
                            }`}
                    >
                        {enviandoSolicitud ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Enviando...
                            </>
                        ) : validacionFecha.esValida ? (
                            <>
                                <MessageCircle className="w-4 h-4" />
                                Enviar Solicitud
                            </>
                        ) : (
                            <>
                                <AlertTriangle className="w-4 h-4" />
                                Consultar Disponibilidad
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
