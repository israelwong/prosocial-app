'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Clock, ArrowLeft, AlertTriangle, MessageCircle, CheckCircle, Loader2 } from 'lucide-react'
import { crearConsultaDisponibilidad } from '@/app/admin/_lib/actions/notificaciones/consulta-disponibilidad.actions'

interface CotizacionNoDisponibleProps {
    eventoId: string
    cotizacionId: string
    motivo: 'expirada' | 'fecha_limite' | 'fecha_ocupada'
    diasMinimos?: number
    fechaEvento?: Date | null
    fechaLimite?: Date | null
}

export default function CotizacionNoDisponible({
    eventoId,
    cotizacionId,
    motivo,
    diasMinimos,
    fechaEvento,
    fechaLimite
}: CotizacionNoDisponibleProps) {
    const [enviando, setEnviando] = useState(false)
    const [enviado, setEnviado] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Función para enviar consulta de disponibilidad
    const handleConsultarDisponibilidad = async () => {
        setEnviando(true)
        setError(null)

        try {
            const resultado = await crearConsultaDisponibilidad({
                eventoId,
                cotizacionId,
                motivo,
                fechaEvento,
                diasMinimos,
                fechaLimite
            })

            if (resultado.success) {
                setEnviado(true)
                // Opcional: Abrir WhatsApp después de enviar la notificación
                setTimeout(() => {
                    window.open(`https://wa.me/5215511999650?text=${crearMensajeWhatsApp()}`, '_blank')
                }, 1000)
            } else {
                setError(resultado.error || 'Error al enviar la consulta')
            }
        } catch (err) {
            setError('Error inesperado. Intenta nuevamente.')
        } finally {
            setEnviando(false)
        }
    }

    const obtenerMensaje = () => {
        switch (motivo) {
            case 'expirada':
                return {
                    titulo: 'Cotización Expirada',
                    mensaje: 'Esta cotización ha vencido y ya no está disponible para contratación.',
                    icono: <Clock className="w-16 h-16 text-red-400" />,
                    mostrarConsulta: true
                }
            case 'fecha_limite':
                const diasRestantes = fechaLimite ? Math.ceil((fechaLimite.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0
                return {
                    titulo: 'Tiempo Límite Agotado',
                    mensaje: `Para contratar este evento se requieren al menos ${diasMinimos} días de anticipación. ${diasRestantes > 0 ? `Solo quedan ${diasRestantes} días.` : 'El tiempo límite ha vencido.'}`,
                    icono: <AlertTriangle className="w-16 h-16 text-amber-400" />,
                    mostrarConsulta: true
                }
            case 'fecha_ocupada':
                return {
                    titulo: 'Fecha No Disponible',
                    mensaje: 'Esta fecha ya está ocupada por otro evento.',
                    icono: <AlertTriangle className="w-16 h-16 text-orange-400" />,
                    mostrarConsulta: true
                }
            default:
                return {
                    titulo: 'No Disponible',
                    mensaje: 'Esta cotización no está disponible en este momento.',
                    icono: <AlertTriangle className="w-16 h-16 text-zinc-400" />,
                    mostrarConsulta: true
                }
        }
    }

    const { titulo, mensaje, icono, mostrarConsulta } = obtenerMensaje()

    // 📱 Crear mensaje descriptivo para WhatsApp
    const crearMensajeWhatsApp = () => {
        const fechaEventoTexto = fechaEvento
            ? fechaEvento.toLocaleDateString('es-MX', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            : 'fecha por definir'

        let mensajeDescriptivo = `Hola, necesito consultar disponibilidad para mi evento.

📅 *Fecha del evento:* ${fechaEventoTexto}
🎯 *Motivo de la consulta:* `

        switch (motivo) {
            case 'expirada':
                mensajeDescriptivo += `La cotización ha expirado y necesito renovarla.`
                break
            case 'fecha_limite':
                mensajeDescriptivo += `El evento requiere ${diasMinimos} días de anticipación mínima y el tiempo límite se ha agotado. ¿Es posible hacer una excepción?`
                break
            case 'fecha_ocupada':
                mensajeDescriptivo += `La fecha está ocupada. ¿Tienen fechas alternativas disponibles?`
                break
            default:
                mensajeDescriptivo += `La cotización no está disponible. Necesito asesoría.`
        }

        mensajeDescriptivo += `

¿Podrían ayudarme con alternativas o soluciones?`

        return encodeURIComponent(mensajeDescriptivo)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-xl shadow-2xl p-8 text-center">
                <div className="flex justify-center mb-6">
                    {icono}
                </div>

                <h1 className="text-2xl font-bold text-zinc-50 mb-4">
                    {titulo}
                </h1>

                <p className="text-zinc-300 mb-8 leading-relaxed">
                    {mensaje}
                </p>

                {fechaEvento && (
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-6">
                        <p className="text-sm text-zinc-400 mb-1">Fecha del evento:</p>
                        <p className="font-medium text-zinc-50">
                            {fechaEvento.toLocaleDateString('es-MX', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                )}

                <div className="space-y-3">
                    {/* Estado de error */}
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-3">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {mostrarConsulta && !enviado && (
                        <button
                            onClick={handleConsultarDisponibilidad}
                            disabled={enviando}
                            className="w-full inline-flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg transition-colors font-medium shadow-lg"
                        >
                            {enviando ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Enviando consulta...
                                </>
                            ) : (
                                <>
                                    <MessageCircle className="w-5 h-5 mr-2" />
                                    Consultar Disponibilidad
                                </>
                            )}
                        </button>
                    )}

                    {/* Estado de éxito */}
                    {enviado && (
                        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                            <div className="flex items-center justify-center mb-2">
                                <CheckCircle className="w-6 h-6 text-green-400" />
                            </div>
                            <p className="text-green-400 font-medium mb-1">¡Consulta enviada!</p>
                            <p className="text-zinc-300 text-sm">
                                Nuestro equipo revisará tu solicitud y te contactará pronto.
                            </p>
                        </div>
                    )}

                    <Link
                        href={`/evento/${eventoId}`}
                        className="w-full inline-flex items-center justify-center px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-50 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al evento
                    </Link>

                    <p className="text-sm text-zinc-500 mt-4">
                        Solicita el apoyo de un asesor para buscar alternativas
                    </p>
                </div>
            </div>
        </div>
    )
}
