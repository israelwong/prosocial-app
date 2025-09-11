'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, X, Eye, ExternalLink, Clock, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react'
import { marcarComoLeida, ocultarNotificacion, obtenerNotificaciones } from '../_lib/actions/notificacion/notificacion.actions'
import { supabase } from '../_lib/supabase'
import { REALTIME_CONFIG, logRealtime } from '../_lib/realtime-control';

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
    const [loading, setLoading] = useState(true)
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
    const [nuevasNotificaciones, setNuevasNotificaciones] = useState(0)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Cargar notificaciones iniciales
    const cargarNotificaciones = useCallback(async () => {
        try {
            setLoading(true)
            const result = await obtenerNotificaciones()
            const notificacionesVisibles = result.filter((n: any) => n.status !== 'oculta')

            setNotificaciones(notificacionesVisibles || [])

            // Contar nuevas notificaciones
            const noLeidas = notificacionesVisibles.filter((n: any) => n.status !== 'leida')
            setNuevasNotificaciones(noLeidas.length)

            console.log('🔄 Notificaciones cargadas:', {
                total: notificacionesVisibles.length,
                noLeidas: noLeidas.length
            })
        } catch (error) {
            console.error('❌ Error al cargar notificaciones:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    // Cargar notificaciones iniciales
    useEffect(() => {
        cargarNotificaciones()
    }, [cargarNotificaciones])

    // Suscripción en tiempo real SOLO para nuevas notificaciones
    useEffect(() => {
        // Control centralizado de debug
        if (!REALTIME_CONFIG.DROPDOWN_NOTIFICACIONES) {
            logRealtime('DROPDOWN', 'Realtime DESHABILITADO para debug sistemático')
            return
        }

        logRealtime('DROPDOWN', 'Conectando suscripción de notificaciones (solo INSERT)...')

        const subscription = supabase
            .channel('realtime:Notificacion')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'Notificacion' },
                async (payload) => {
                    logRealtime('DROPDOWN', 'Nueva notificación detectada:', payload)
                    // Solo recargar para nuevas notificaciones
                    await cargarNotificaciones()
                }
            )
            .subscribe((status, err) => {
                if (err) {
                    console.error('❌ Error en la suscripción Notificacion:', err)
                    // Si hay error de schema mismatch, logearlo específicamente
                    if (err.message?.includes('mismatch between server and client bindings')) {
                        console.error('🚨 Schema mismatch detectado en dropdown Notificacion')
                    }
                } else {
                    logRealtime('DROPDOWN', `Estado de la suscripción: ${status}`)
                }
            })

        // Cleanup function para evitar memory leaks
        return () => {
            console.log('🧹 Desconectando suscripción de notificaciones...')
            subscription.unsubscribe()
        }
    }, [cargarNotificaciones])

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
            console.log('👁️ Marcando como leída:', notificacionId)

            // Optimistic update: marcar inmediatamente como leída
            const notifAnterior = notificaciones.find(n => n.id === notificacionId)
            if (notifAnterior && notifAnterior.status !== 'leida') {
                setNotificaciones(prev =>
                    prev.map(n =>
                        n.id === notificacionId
                            ? { ...n, status: 'leida', updatedAt: new Date() }
                            : n
                    )
                )
                setNuevasNotificaciones(prev => Math.max(0, prev - 1))
            }

            // Ejecutar la acción en background
            await marcarComoLeida(notificacionId)
            console.log('✅ Notificación marcada como leída correctamente')

        } catch (error) {
            console.error('❌ Error al marcar como leída:', error)
            // En caso de error, recargar notificaciones
            cargarNotificaciones()
        }
    }

    // Ocultar notificación - SOLO optimistic update, sin suscripción
    const handleOcultar = async (notificacionId: string) => {
        try {
            console.log('🗑️ Ocultando notificación:', notificacionId)

            // Obtener la notificación antes de removerla para saber si era no leída
            const notifAnterior = notificaciones.find(n => n.id === notificacionId)
            if (!notifAnterior) {
                console.warn('⚠️ Notificación no encontrada en el estado local:', notificacionId)
                return
            }

            // Optimistic update: remover inmediatamente del estado local
            setNotificaciones(prev => {
                const newList = prev.filter(n => n.id !== notificacionId)
                console.log(`📝 Notificaciones actualizadas: ${prev.length} -> ${newList.length}`)
                return newList
            })

            // Actualizar contador si era no leída
            if (notifAnterior.status !== 'leida') {
                setNuevasNotificaciones(prev => {
                    const newCount = Math.max(0, prev - 1)
                    console.log(`🔢 Contador actualizado: ${prev} -> ${newCount}`)
                    return newCount
                })
            }

            // Ejecutar la acción en background (sin await para no bloquear UI)
            ocultarNotificacion(notificacionId).then(() => {
                console.log('✅ Notificación ocultada correctamente en base de datos')
            }).catch(error => {
                console.error('❌ Error al ocultar notificación en BD:', error)
                // No hacer nada - mantener el optimistic update
            })

        } catch (error) {
            console.error('❌ Error al ocultar notificación:', error)
        }
    }

    // Función para obtener la ruta destino basada en el tipo y metadata
    const obtenerRutaDestino = (notificacion: Notificacion) => {
        if (!notificacion.metadata) return null

        const metadata = notificacion.metadata as any

        switch (notificacion.tipo) {
            case 'solicitud_paquete':
            case 'solicitud_personalizada':
                // Ambos tipos van a dashboard/eventos para gestión
                return metadata.eventoId
                    ? `/admin/dashboard/eventos/${metadata.eventoId}`
                    : null

            case 'consulta_disponibilidad':
                // Consultas de disponibilidad van al dashboard del evento
                return metadata.eventoId
                    ? `/admin/dashboard/eventos/${metadata.eventoId}`
                    : null

            case 'pago_confirmado':
            case 'pago_recibido':
                // Pagos van a seguimiento
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
    const getIconoTipo = (titulo: string, tipo: string) => {
        if (tipo === 'consulta_disponibilidad') return <MessageCircle className="w-4 h-4 text-orange-400" />
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
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-zinc-800 bg-green-400" />

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
                                {/* Indicador simple de realtime activo */}
                                <div className="flex items-center space-x-1 text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    <span>En vivo</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
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
                                {notificaciones.map((notificacion) => {
                                    const rutaDestino = obtenerRutaDestino(notificacion)

                                    return (
                                        <div
                                            key={notificacion.id}
                                            className={`p-4 transition-colors group cursor-pointer ${notificacion.status === 'leida' ? '' : 'bg-blue-900/10'
                                                } ${rutaDestino ? 'hover:bg-zinc-800/50' : ''}`}
                                            onClick={() => rutaDestino && handleNotificacionClick(notificacion)}
                                        >
                                            <div className="flex items-start space-x-3">
                                                {/* Icono */}
                                                <div className="flex-shrink-0 mt-1">
                                                    {getIconoTipo(notificacion.titulo, notificacion.tipo)}
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
                                                            {/* Botón dinámico según el tipo */}
                                                            {rutaDestino && (
                                                                <span className="text-xs text-blue-400 flex items-center space-x-1">
                                                                    <ExternalLink size={12} />
                                                                    <span>
                                                                        {(notificacion.tipo === 'solicitud_paquete' ||
                                                                            notificacion.tipo === 'solicitud_personalizada') ? 'Ver evento' :
                                                                            notificacion.tipo === 'consulta_disponibilidad' ? 'Ver consulta' :
                                                                                notificacion.tipo.includes('pago') ? 'Ver seguimiento' :
                                                                                    'Ver detalles'}
                                                                    </span>
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Acciones de la notificación */}
                                                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {notificacion.status !== 'leida' && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleMarcarLeida(notificacion.id)
                                                                    }}
                                                                    className="p-1 text-zinc-500 hover:text-blue-400 rounded"
                                                                    title="Marcar como leída"
                                                                >
                                                                    <Eye size={12} />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleOcultar(notificacion.id)
                                                                }}
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
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notificaciones.length > 0 && (
                        <div className="px-4 py-2 border-t border-zinc-700 bg-zinc-800/50">
                            <button
                                onClick={() => {
                                    cargarNotificaciones()
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
