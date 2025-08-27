'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../_lib/supabase'
import { crearNotificacion } from '../_lib/notificacion.actions'

interface UseNotificacionesRealtimeReturn {
    notificaciones: any[]
    nuevasNotificaciones: number
    recargarNotificaciones: () => void
}

export function useNotificacionesRealtime(): UseNotificacionesRealtimeReturn {
    const [notificaciones, setNotificaciones] = useState<any[]>([])
    const [nuevasNotificaciones, setNuevasNotificaciones] = useState(0)

    // Función para recargar notificaciones
    const recargarNotificaciones = useCallback(async () => {
        try {
            const { obtenerNotificaciones } = await import('../_lib/notificacion.actions')
            const result = await obtenerNotificaciones()
            setNotificaciones(result || [])

            // Contar nuevas notificaciones
            const noLeidas = result.filter((n: any) => n.status !== 'leida')
            setNuevasNotificaciones(noLeidas.length)
        } catch (error) {
            console.error('Error al recargar notificaciones:', error)
        }
    }, [])

    // Configurar suscripción realtime
    useEffect(() => {
        console.log('🔔 Configurando suscripción realtime de notificaciones')

        // Cargar notificaciones iniciales
        recargarNotificaciones()

        // Configurar canal realtime con configuración mejorada
        const channel = supabase
            .channel('notificaciones-changes', {
                config: {
                    presence: {
                        key: 'notifications'
                    },
                    broadcast: {
                        self: true
                    }
                }
            })
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'Notificacion',
                    filter: 'status=neq.oculta'
                },
                async (payload) => {
                    console.log('🔔 Evento realtime en notificaciones:', payload.eventType, payload)

                    try {
                        switch (payload.eventType) {
                            case 'INSERT':
                                // Nueva notificación creada
                                const nuevaNotificacion = payload.new
                                if (nuevaNotificacion && nuevaNotificacion.id) {
                                    setNotificaciones(prev => [nuevaNotificacion, ...prev])
                                    setNuevasNotificaciones(prev => prev + 1)

                                    // Mostrar notificación toast (opcional)
                                    if ('Notification' in window && Notification.permission === 'granted') {
                                        new Notification(nuevaNotificacion.titulo, {
                                            body: nuevaNotificacion.mensaje,
                                            icon: '/favicon.ico',
                                            tag: `notif-${nuevaNotificacion.id}`
                                        })
                                    }
                                }
                                break

                            case 'UPDATE':
                                // Notificación actualizada (cambio de status)
                                const notifActualizada = payload.new
                                if (notifActualizada && notifActualizada.id) {
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
                    // En caso de error, recargar notificaciones manualmente
                    setTimeout(() => {
                        console.log('🔄 Recargando notificaciones tras error')
                        recargarNotificaciones()
                    }, 2000)
                } else {
                    console.log('✅ Suscripción de notificaciones:', status)
                }
            })

        // Cleanup
        return () => {
            console.log('🧹 Limpiando suscripción de notificaciones')
            supabase.removeChannel(channel)
        }
    }, [recargarNotificaciones])

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
        recargarNotificaciones
    }
}
