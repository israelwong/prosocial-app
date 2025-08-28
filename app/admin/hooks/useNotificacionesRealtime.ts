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
    const maxReintentos = 5

    // Función para recargar notificaciones
    const recargarNotificaciones = useCallback(async () => {
        try {
            const { obtenerNotificaciones } = await import('../_lib/notificacion.actions')
            const result = await obtenerNotificaciones()

            // ✅ Filtrar notificaciones ocultas por seguridad extra
            const notificacionesVisibles = result.filter((n: any) => n.status !== 'oculta')
            setNotificaciones(notificacionesVisibles || [])

            // Contar nuevas notificaciones (pendientes/no leídas)
            const noLeidas = notificacionesVisibles.filter((n: any) => n.status !== 'leida')
            setNuevasNotificaciones(noLeidas.length)
        } catch (error) {
            console.error('Error al recargar notificaciones:', error)
        }
    }, [])

    // Configurar suscripción realtime con reconexión automática
    const configurarSuscripcion = useCallback(() => {
        console.log('🔔 Configurando suscripción realtime de notificaciones')
        setConexionRealtime('connecting')

        // Cargar notificaciones iniciales
        recargarNotificaciones()

        // Configurar canal realtime con configuración mejorada
        const channel = supabase
            .channel(`notificaciones-realtime-${Date.now()}`, {
                config: {
                    presence: {
                        key: 'admin-notifications'
                    },
                    broadcast: {
                        self: false // Evitar duplicados
                    }
                }
            })
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'Notificacion'
                },
                async (payload) => {
                    console.log('🔔 Evento realtime en notificaciones:', payload.eventType, payload.new || payload.old)

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
                if (err) {
                    console.error('❌ Error en suscripción de notificaciones:', err)
                    setConexionRealtime('disconnected')

                    // Reintentar conexión con backoff exponencial
                    if (reintentos < maxReintentos) {
                        const tiempoEspera = Math.min(1000 * Math.pow(2, reintentos), 30000) // Max 30 segundos
                        console.log(`🔄 Reintentando conexión en ${tiempoEspera / 1000}s (intento ${reintentos + 1}/${maxReintentos})`)

                        setTimeout(() => {
                            setReintentos(prev => prev + 1)
                            configurarSuscripcion()
                        }, tiempoEspera)
                    } else {
                        console.log('💥 Máximo número de reintentos alcanzado. Recarga manual necesaria.')
                    }
                } else {
                    console.log('✅ Suscripción de notificaciones:', status)
                    if (status === 'SUBSCRIBED') {
                        console.log('🎯 Canal realtime activo y escuchando cambios en Notificacion')
                        setConexionRealtime('connected')
                        setReintentos(0) // Reset reintentos en conexión exitosa
                    } else if (status === 'CHANNEL_ERROR') {
                        setConexionRealtime('disconnected')
                    } else if (status === 'TIMED_OUT') {
                        setConexionRealtime('disconnected')
                        // Reintentar conexión
                        setTimeout(() => configurarSuscripcion(), 3000)
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
