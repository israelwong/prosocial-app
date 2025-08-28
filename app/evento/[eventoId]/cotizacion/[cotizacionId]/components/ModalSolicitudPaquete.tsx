'use client'
import React, { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { X, Package, MessageCircle, Phone, Mail } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Props {
    isOpen: boolean
    onClose: () => void
    paquete: {
        id: string
        nombre: string
        precio: number
        descripcion?: string
        popularidad: string
    }
    cotizacion: {
        id: string
        cliente: {
            nombre: string
            email: string
            telefono?: string
        }
    }
    onEnviarSolicitud: (paqueteId: string, mensaje: string) => Promise<void>
}

export default function ModalSolicitudPaquete({
    isOpen,
    onClose,
    paquete,
    cotizacion,
    onEnviarSolicitud
}: Props) {
    const [mensaje, setMensaje] = useState('')
    const [enviando, setEnviando] = useState(false)

    const handleEnviarSolicitud = async () => {
        if (enviando) return

        setEnviando(true)
        try {
            await onEnviarSolicitud(paquete.id, mensaje)
            toast.success('¡Solicitud enviada! Te contactaremos pronto.')
            onClose()
            setMensaje('')
        } catch (error) {
            toast.error('Error al enviar la solicitud. Intenta de nuevo.')
            console.error('Error:', error)
        } finally {
            setEnviando(false)
        }
    }

    const handleClose = () => {
        if (enviando) return
        setMensaje('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
            <div className="min-h-screen py-6 px-4 flex items-center justify-center">
                <div className="w-full max-w-lg mx-auto bg-zinc-900 rounded-lg border border-zinc-700 shadow-2xl">
                    {/* Header */}
                    <div className="p-6 border-b border-zinc-700">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Package className="w-6 h-6 text-blue-400" />
                                <h2 className="text-xl font-bold text-white">
                                    Solicitar Paquete para Reservar
                                </h2>
                            </div>
                            <Button
                                onClick={handleClose}
                                variant="ghost"
                                size="sm"
                                disabled={enviando}
                                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-6 space-y-6">
                        {/* Información del paquete */}
                        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                            <h3 className="font-semibold mb-2 text-white flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                Paquete Solicitado:
                            </h3>
                            <div className="space-y-2">
                                <p className="text-blue-400 font-medium">{paquete.nombre}</p>
                                <p className="text-2xl font-bold text-white">
                                    ${paquete.precio.toLocaleString('es-MX')}
                                </p>
                                {paquete.descripcion && (
                                    <p className="text-sm text-zinc-400">
                                        {paquete.descripcion}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Información del cliente */}
                        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                            <h4 className="font-medium text-zinc-300 mb-3 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Datos de contacto:
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-zinc-400">Nombre:</span>
                                    <span className="text-white">{cotizacion.cliente.nombre}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-zinc-400">Email:</span>
                                    <span className="text-white">{cotizacion.cliente.email}</span>
                                </div>
                                {cotizacion.cliente.telefono && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-zinc-400">Teléfono:</span>
                                        <span className="text-white">{cotizacion.cliente.telefono}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Campo de mensaje */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                <MessageCircle className="w-4 h-4" />
                                Mensaje adicional (opcional):
                            </label>
                            <textarea
                                value={mensaje}
                                onChange={(e) => setMensaje(e.target.value)}
                                placeholder="¿Hay algún servicio que te gustaría modificar o agregar al paquete?"
                                className="w-full bg-zinc-700 text-white p-3 rounded-lg resize-none border border-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                                rows={4}
                                disabled={enviando}
                                maxLength={500}
                            />
                            <div className="text-xs text-zinc-500 text-right">
                                {mensaje.length}/500 caracteres
                            </div>
                        </div>

                        {/* Información adicional */}
                        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-blue-300 text-sm">
                                        ¿Qué sigue?
                                    </p>
                                    <ul className="text-blue-200 text-sm mt-2 space-y-1">
                                        <li>• Tu asesor te contactará en las próximas horas</li>
                                        <li>• Revisaremos los detalles del paquete contigo</li>
                                        <li>• Podremos personalizar servicios según tus necesidades</li>
                                        <li>• Te enviaremos la cotización final para proceder con la reserva</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer con acciones */}
                    <div className="p-6 border-t border-zinc-700">
                        <div className="flex gap-3">
                            <Button
                                onClick={handleClose}
                                variant="outline"
                                disabled={enviando}
                                className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleEnviarSolicitud}
                                disabled={enviando}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                            >
                                {enviando ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        🎉 Solicitar Paquete para Reservar
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
