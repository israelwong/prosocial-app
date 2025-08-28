'use client'
import React, { useState } from 'react'
import { Check, MessageCircle, Package, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Paquete {
    id: string
    nombre: string
    precio: number
    eventoTipoId?: string
    eventoTipo?: string
}

interface Cliente {
    nombre?: string
    email?: string
    telefono?: string
}

interface SolicitudPaqueteModalProps {
    paquete: Paquete
    eventoId: string
    cliente?: Cliente
    onClose: () => void
    onSuccess?: () => void
}

export default function SolicitudPaqueteModal({
    paquete,
    eventoId,
    cliente,
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
                    clienteId: cliente?.email
                })
            })

            if (response.ok) {
                setMostrarExito(true)
                if (onSuccess) {
                    onSuccess()
                }
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
                                Tu solicitud para el paquete <strong className="text-blue-400">{paquete.nombre}</strong> ha
                                sido enviada correctamente. Pronto deberías verla en tus opciones de paquetes
                                para poder reservarla.
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
                            ¿Deseas solicitar información adicional sobre este paquete?
                            Un asesor se pondrá en contacto contigo para brindarte más detalles
                            y resolver cualquier duda que puedas tener.
                        </p>
                    </div>

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
                        className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {enviandoSolicitud ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Enviando...
                            </>
                        ) : (
                            <>
                                <MessageCircle className="w-4 h-4" />
                                Enviar Solicitud
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
