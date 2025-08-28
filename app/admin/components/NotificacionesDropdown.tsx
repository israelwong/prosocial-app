'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Bell, X, Eye, ExternalLink, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { marcarComoLeida, ocultarNotificacion } from '../_lib/notificacion.actions'
import { useNotificacionesRealtime } from '../hooks/useNotificacionesRealtime'
import { useNotificacionesPolling } from '../hooks/useNotificacionesPolling'

interface Notificacion {
    id: string
    userId: string | null
    titulo: string
    mensaje: string
    tipo: string
    metadata: any
    status: string
    cotizacionId: string | null
    createdAt: Date
    updatedAt: Date
}

interface NotificacionesDropdownProps {
    userId?: string
}

export default function NotificacionesDropdown({ userId }: NotificacionesDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // 🔔 Intentar usar realtime, pero tener polling como respaldo
    const realtime = useNotificacionesRealtime()
    const polling = useNotificacionesPolling()
    
    // Usar realtime si está conectado, sino usar polling
    const {
        notificaciones,
        nuevasNotificaciones,
        recargarNotificaciones,
        ocultarNotificacionOptimistic
    } = realtime.conexionRealtime === 'connected' ? realtime : polling

    const conexionRealtime = realtime.conexionRealtime

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Marcar notificación como leída
    const handleMarcarLeida = async (notificacionId: string) => {
        try {
            await marcarComoLeida(notificacionId)
            // El realtime se encargará de actualizar el estado automáticamente
        } catch (error) {
            console.error('Error al marcar como leída:', error)
        }
    }

    // Ocultar notificación
    const handleOcultar = async (notificacionId: string) => {
        try {
            console.log('🗑️ Ocultando notificación:', notificacionId)

            // ✅ OPTIMISTIC UPDATE: Ocultar inmediatamente en la UI
            ocultarNotificacionOptimistic(notificacionId)

            // Ejecutar la acción en background - el realtime confirmará el cambio
            await ocultarNotificacion(notificacionId)
            console.log('✅ Notificación ocultada correctamente en BD')

        } catch (error) {
            console.error('❌ Error al ocultar notificación:', error)
            // En caso de error, recargar notificaciones para revertir el optimistic update
            recargarNotificaciones()
        }
    }

    // Función para obtener la ruta destino basada en el tipo y metadata
    const obtenerRutaDestino = (notificacion: Notificacion) => {
        if (!notificacion.metadata) return null

        const metadata = notificacion.metadata as any

        switch (notificacion.tipo) {
            case 'solicitud_paquete':
                return metadata.eventoId
                    ? `/admin/dashboard/eventos/${metadata.eventoId}`
                    : null

            case 'pago_confirmado':
            case 'pago_recibido':
                return metadata.eventoId
                    ? `/admin/dashboard/seguimiento/${metadata.eventoId}`
                    : null

            default:
                return metadata.rutaDestino || null
        }
    }

    // Función para agregar nota a bitácora automáticamente
    const procesarAccionBitacora = async (notificacion: Notificacion) => {
        if (!notificacion.metadata) return

        const metadata = notificacion.metadata as any

        if (metadata.accionBitacora?.habilitada && metadata.eventoId) {
            try {
                console.log(`📝 Agregando nota a bitácora del evento ${metadata.eventoId}:`, metadata.accionBitacora.mensaje)

                const response = await fetch('/api/admin/eventos/bitacora', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        eventoId: metadata.eventoId,
                        mensaje: metadata.accionBitacora.mensaje,
                        importancia: '2'
                    })
                })

                if (response.ok) {
                    console.log('✅ Nota agregada a bitácora exitosamente')
                } else {
                    console.error('❌ Error al agregar nota a bitácora:', response.statusText)
                }
            } catch (error) {
                console.error('Error al agregar nota a bitácora:', error)
            }
        }
    }

    // Manejar click en notificación
    const handleNotificacionClick = async (notificacion: Notificacion) => {
        // Marcar como leída si no lo está
        if (notificacion.status !== 'leida') {
            await handleMarcarLeida(notificacion.id)
        }

        // Procesar acción de bitácora si está configurada
        await procesarAccionBitacora(notificacion)

        // Obtener ruta destino y navegar
        const rutaDestino = obtenerRutaDestino(notificacion)
        if (rutaDestino) {
            // Cerrar dropdown
            setIsOpen(false)
            // Navegar a la ruta destino
            window.location.href = rutaDestino
        } else {
            console.log('No se encontró ruta destino para la notificación:', notificacion.tipo)
            setIsOpen(false)
        }
    }

    // Formatear fecha
    const formatearFecha = (fecha: Date | string) => {
        const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha
        const ahora = new Date()
        const diferencia = ahora.getTime() - fechaObj.getTime()
        const minutos = Math.floor(diferencia / (1000 * 60))
        const horas = Math.floor(diferencia / (1000 * 60 * 60))
        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))

        if (minutos < 1) return 'Ahora'
        if (minutos < 60) return `${minutos}m`
        if (horas < 24) return `${horas}h`
        if (dias < 7) return `${dias}d`
        return fechaObj.toLocaleDateString('es-MX', {
            month: 'short',
            day: 'numeric'
        })
    }

    // Obtener icono según tipo de notificación
    const getIconoTipo = (titulo: string) => {
        if (titulo.includes('Pago') || titulo.includes('💰')) return <CheckCircle className="w-4 h-4 text-green-400" />
        if (titulo.includes('Nueva') || titulo.includes('📝')) return <AlertCircle className="w-4 h-4 text-blue-400" />
        if (titulo.includes('Recordatorio')) return <Clock className="w-4 h-4 text-yellow-400" />
        return <Bell className="w-4 h-4 text-zinc-400" />
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Botón de notificaciones */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className='relative p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 rounded-lg transition-all duration-200'
            >
                <Bell size={20} />

                {/* Indicador de conexión realtime */}
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-zinc-800 ${conexionRealtime === 'connected' ? 'bg-green-400' :
                        conexionRealtime === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                            'bg-red-400'
                    }`} />

                {nuevasNotificaciones > 0 && (
                    <span className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse z-10'>
                        {nuevasNotificaciones > 9 ? '9+' : nuevasNotificaciones}
                    </span>
                )}
            </button>

            {/* Dropdown de notificaciones */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-zinc-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <h3 className="text-sm font-semibold text-white">
                                    Notificaciones ({notificaciones.length})
                                </h3>
                                {/* Indicador de conexión realtime */}
                                <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${conexionRealtime === 'connected' ? 'bg-green-500/20 text-green-400' :
                                        conexionRealtime === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${conexionRealtime === 'connected' ? 'bg-green-400' :
                                            conexionRealtime === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                                                'bg-blue-400 animate-pulse'
                                        }`} />
                                    <span>
                                        {conexionRealtime === 'connected' ? 'En vivo' :
                                            conexionRealtime === 'connecting' ? 'Conectando...' :
                                                'Polling'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {/* Botón de recarga manual */}
                                <button
                                    onClick={() => {
                                        console.log('🔄 Recarga manual de notificaciones')
                                        recargarNotificaciones()
                                    }}
                                    className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded border border-zinc-600 transition-colors"
                                    title="Recargar notificaciones"
                                >
                                    ⟳
                                </button>
                                
                                {nuevasNotificaciones > 0 && (
                                    <span className="text-xs text-zinc-400">
                                        {nuevasNotificaciones} nuevas
                                    </span>
                                )}
                                {/* Botón de reconexión si está desconectado */}
                                {conexionRealtime === 'disconnected' && (
                                    <button
                                        onClick={() => {
                                            console.log('🔄 Reconectando manualmente...')
                                            recargarNotificaciones()
                                        }}
                                        className="text-xs text-red-400 hover:text-red-300 px-2 py-1 bg-red-500/10 rounded border border-red-500/20 hover:bg-red-500/20 transition-colors"
                                        title="Reconectar"
                                    >
                                        Reconectar
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-zinc-400 hover:text-white"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Lista de notificaciones */}
                    <div className="max-h-80 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-zinc-400">
                                <div className="animate-spin w-5 h-5 border-2 border-zinc-600 border-t-blue-500 rounded-full mx-auto"></div>
                                <p className="mt-2 text-sm">Cargando...</p>
                            </div>
                        ) : notificaciones.length === 0 ? (
                            <div className="p-6 text-center text-zinc-400">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No hay notificaciones</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-700">
                                {notificaciones.map((notificacion) => (
                                    <div
                                        key={notificacion.id}
                                        className={`p-4 hover:bg-zinc-800/50 transition-colors group ${notificacion.status === 'leida' ? '' : 'bg-blue-900/10'
                                            }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            {/* Icono */}
                                            <div className="flex-shrink-0 mt-1">
                                                {getIconoTipo(notificacion.titulo)}
                                            </div>

                                            {/* Contenido */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className={`text-sm font-medium ${notificacion.status === 'leida'
                                                            ? 'text-zinc-300'
                                                            : 'text-white'
                                                            }`}>
                                                            {notificacion.titulo}
                                                        </p>
                                                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                                                            {notificacion.mensaje}
                                                        </p>
                                                    </div>

                                                    {/* Tiempo */}
                                                    <span className="text-xs text-zinc-500 ml-2 flex-shrink-0">
                                                        {formatearFecha(notificacion.createdAt)}
                                                    </span>
                                                </div>

                                                {/* Acciones */}
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex items-center space-x-2">
                                                        {/* Botón ir a evento */}
                                                        {(notificacion as any).eventoId && (
                                                            <Link
                                                                href={`/admin/dashboard/seguimiento/${(notificacion as any).eventoId}`}
                                                                onClick={() => handleNotificacionClick(notificacion)}
                                                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                                                            >
                                                                <ExternalLink size={12} />
                                                                <span>Ver evento</span>
                                                            </Link>
                                                        )}
                                                    </div>

                                                    {/* Acciones de la notificación */}
                                                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {notificacion.status !== 'leida' && (
                                                            <button
                                                                onClick={() => handleMarcarLeida(notificacion.id)}
                                                                className="p-1 text-zinc-500 hover:text-blue-400 rounded"
                                                                title="Marcar como leída"
                                                            >
                                                                <Eye size={12} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleOcultar(notificacion.id)}
                                                            className="p-1 text-zinc-500 hover:text-red-400 rounded"
                                                            title="Ocultar notificación"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notificaciones.length > 0 && (
                        <div className="px-4 py-2 border-t border-zinc-700 bg-zinc-800/50">
                            <button
                                onClick={() => {
                                    recargarNotificaciones()
                                    setIsOpen(false)
                                }}
                                className="text-xs text-zinc-400 hover:text-white w-full text-center py-1"
                            >
                                Actualizar notificaciones
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}