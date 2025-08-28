'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../_lib/supabase'
import { crearNotificacion } from '../_lib/notificacion.actions'

interface UseNotificacionesRealtimeReturn {
    notificaciones: any[]
    nuevasNotificaciones: number
    conexionRealtime: 'connecting' | 'connected' | 'disconnected'
    recargarNotificaciones: () => void
    ocultarNotificacionOptimistic: (notificacionId: string) => void
}

export function useNotificacionesRealtime(): UseNotificacionesRealtimeReturn {
    const [notificaciones, setNotificaciones] = useState<any[]>([])
    const [nuevasNotificaciones, setNuevasNotificaciones] = useState(0)
    const [conexionRealtime, setConexionRealtime] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
    const [reintentos, setReintentos] = useState(0)
    const [ultimaActualizacion, setUltimaActualizacion] = useState<Date>(new Date())
    const maxReintentos = 5

    // Función para recargar notificaciones
    const recargarNotificaciones = useCallback(async () => {
        try {
            const { obtenerNotificaciones } = await import('../_lib/notificacion.actions')
            const result = await obtenerNotificaciones()

            // ✅ Filtrar notificaciones ocultas por seguridad extra
            const notificacionesVisibles = result.filter((n: any) => n.status !== 'oculta')

            // Actualizar última vez que se recargaron
            setUltimaActualizacion(new Date())
            setNotificaciones(notificacionesVisibles || [])

            // Contar nuevas notificaciones (pendientes/no leídas)
            const noLeidas = notificacionesVisibles.filter((n: any) => n.status !== 'leida')
            setNuevasNotificaciones(noLeidas.length)

            console.log('🔄 Notificaciones recargadas:', {
                total: notificacionesVisibles.length,
                noLeidas: noLeidas.length,
                timestamp: new Date().toISOString()
            })
        } catch (error) {
            console.error('Error al recargar notificaciones:', error)
        }
    }, [])

    // Sistema de polling de respaldo
    useEffect(() => {
        let pollingInterval: NodeJS.Timeout

        // Si el realtime no está conectado, usar polling cada 30 segundos
        if (conexionRealtime !== 'connected') {
            console.log('🔄 Iniciando polling de respaldo para notificaciones')
            pollingInterval = setInterval(() => {
                console.log('📡 Polling: Verificando nuevas notificaciones...')
                recargarNotificaciones()
            }, 30000) // 30 segundos
        }

        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval)
            }
        }
    }, [conexionRealtime, recargarNotificaciones])

    // Configurar suscripción realtime con reconexión automática
    const configurarSuscripcion = useCallback(() => {
        console.log('🔔 Configurando suscripción realtime de notificaciones')
        setConexionRealtime('connecting')

        // Cargar notificaciones iniciales
        recargarNotificaciones()

        // Configurar canal realtime con el mismo patrón que funciona en CotizacionVisita
        const channel = supabase
            .channel('realtime:Notificacion')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'Notificacion' },
                async (payload) => {
                    console.log('🔔 [REALTIME DEBUG] Evento recibido:', {
                        eventType: payload.eventType,
                        timestamp: new Date().toISOString(),
                        newData: payload.new && (payload.new as any)?.id ? {
                            id: (payload.new as any).id,
                            titulo: (payload.new as any).titulo,
                            tipo: (payload.new as any).tipo,
                            status: (payload.new as any).status
                        } : null,
                        oldData: payload.old && (payload.old as any)?.id ? {
                            id: (payload.old as any).id,
                            status: (payload.old as any).status
                        } : null
                    })

                    try {
                        switch (payload.eventType) {
                            case 'INSERT':
                                // Nueva notificación creada
                                const nuevaNotificacion = payload.new
                                if (nuevaNotificacion && nuevaNotificacion.id && nuevaNotificacion.status !== 'oculta') {
                                    console.log('✅ Nueva notificación recibida:', nuevaNotificacion.titulo)

                                    setNotificaciones(prev => {
                                        // Evitar duplicados
                                        const existe = prev.find(n => n.id === nuevaNotificacion.id)
                                        if (existe) return prev

                                        return [nuevaNotificacion, ...prev]
                                    })

                                    setNuevasNotificaciones(prev => prev + 1)

                                    // Mostrar notificación del navegador
                                    if ('Notification' in window && Notification.permission === 'granted') {
                                        new Notification(nuevaNotificacion.titulo, {
                                            body: nuevaNotificacion.mensaje,
                                            icon: '/favicon.ico',
                                            tag: `notif-${nuevaNotificacion.id}`,
                                            requireInteraction: true
                                        })
                                    }
                                }
                                break

                            case 'UPDATE':
                                // Notificación actualizada (cambio de status)
                                const notifActualizada = payload.new
                                console.log('📝 UPDATE detectado:', notifActualizada)

                                if (notifActualizada && notifActualizada.id) {
                                    // ✅ Si la notificación fue ocultada, removerla del estado
                                    if (notifActualizada.status === 'oculta') {
                                        console.log('🗑️ Notificación ocultada via realtime:', notifActualizada.id)
                                        setNotificaciones(prev => {
                                            const filtered = prev.filter(n => n.id !== notifActualizada.id)
                                            console.log(`📊 Notificaciones antes: ${prev.length}, después: ${filtered.length}`)
                                            return filtered
                                        })

                                        // Decrementar contador si era una notificación no leída
                                        const notifAnterior = notificaciones.find(n => n.id === notifActualizada.id)
                                        if (notifAnterior && notifAnterior.status !== 'leida') {
                                            console.log('📉 Decrementando contador de nuevas notificaciones')
                                            setNuevasNotificaciones(prev => Math.max(0, prev - 1))
                                        }
                                    } else {
                                        console.log('📝 Actualizando notificación:', notifActualizada.id)
                                        // Actualizar la notificación en el estado
                                        setNotificaciones(prev =>
                                            prev.map(n =>
                                                n.id === notifActualizada.id
                                                    ? { ...n, ...notifActualizada }
                                                    : n
                                            )
                                        )
                                        // Recalcular contador de nuevas
                                        setTimeout(() => recargarNotificaciones(), 500)
                                    }
                                }
                                break

                            case 'DELETE':
                                // Notificación eliminada u ocultada
                                const notifEliminada = payload.old
                                if (notifEliminada && notifEliminada.id) {
                                    setNotificaciones(prev =>
                                        prev.filter(n => n.id !== notifEliminada.id)
                                    )
                                    setNuevasNotificaciones(prev => Math.max(0, prev - 1))
                                }
                                break
                        }
                    } catch (error) {
                        console.error('❌ Error procesando evento realtime:', error)
                        // Fallback: recargar notificaciones
                        recargarNotificaciones()
                    }
                }
            )
            .subscribe((status, err) => {
                console.log(`🔔 [REALTIME] Estado: ${status}`, err ? `Error: ${err.message}` : '')

                if (err) {
                    console.error('❌ Error en suscripción de notificaciones:', err)
                    setConexionRealtime('disconnected')

                    // Reintentar conexión con backoff exponencial
                    if (reintentos < maxReintentos) {
                        const tiempoEspera = Math.min(1000 * Math.pow(2, reintentos), 30000)
                        console.log(`🔄 Reintentando conexión en ${tiempoEspera / 1000}s (intento ${reintentos + 1}/${maxReintentos})`)

                        setTimeout(() => {
                            setReintentos(prev => prev + 1)
                            configurarSuscripcion()
                        }, tiempoEspera)
                    } else {
                        console.log('💥 Máximo número de reintentos alcanzado. Usando polling de respaldo.')
                        // Activar polling de respaldo más frecuente
                        setConexionRealtime('disconnected')
                    }
                } else {
                    if (status === 'SUBSCRIBED') {
                        console.log('🎯 Canal realtime conectado exitosamente')
                        setConexionRealtime('connected')
                        setReintentos(0) // Reset reintentos en conexión exitosa
                    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                        console.log(`⚠️ Problema de conexión: ${status}`)
                        setConexionRealtime('disconnected')

                        // Reintentar después de un tiempo
                        setTimeout(() => {
                            console.log('🔄 Reintentando por timeout/error...')
                            configurarSuscripcion()
                        }, 5000)
                    } else if (status === 'CLOSED') {
                        setConexionRealtime('disconnected')
                    }
                }
            })

        return channel
    }, [recargarNotificaciones, reintentos])

    // Configurar suscripción realtime
    useEffect(() => {
        const channel = configurarSuscripcion()

        // Cleanup
        return () => {
            console.log('🧹 Limpiando suscripción de notificaciones')
            if (channel) {
                supabase.removeChannel(channel)
            }
        }
    }, [configurarSuscripcion])

    // Función para ocultar notificación inmediatamente (optimistic update)
    const ocultarNotificacionOptimistic = useCallback((notificacionId: string) => {
        console.log('🗑️ Optimistic update: Ocultando notificación inmediatamente', notificacionId)

        // Encontrar la notificación antes de removerla para actualizar contador
        const notifAnterior = notificaciones.find(n => n.id === notificacionId)

        // Remover inmediatamente del estado
        setNotificaciones(prev => prev.filter(n => n.id !== notificacionId))

        // Actualizar contador si era una notificación no leída
        if (notifAnterior && notifAnterior.status !== 'leida') {
            setNuevasNotificaciones(prev => Math.max(0, prev - 1))
        }
    }, [notificaciones])

    // Solicitar permisos de notificación del navegador
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log('🔔 Permisos de notificación:', permission)
            })
        }
    }, [])

    return {
        notificaciones,
        nuevasNotificaciones,
        conexionRealtime,
        recargarNotificaciones,
        ocultarNotificacionOptimistic
    }
}
