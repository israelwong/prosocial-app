'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../_lib/supabase'
import { crearNotificacion } from '../_lib/notificacion.actions'

interface UseNotificacionesRealtimeReturn {
    notificaciones: any[]
    nuevasNotificaciones: number
    recargarNotificaciones: () => void
    ocultarNotificacionOptimistic: (notificacionId: string) => void
}

export function useNotificacionesRealtime(): UseNotificacionesRealtimeReturn {
    const [notificaciones, setNotificaciones] = useState<any[]>([])
    const [nuevasNotificaciones, setNuevasNotificaciones] = useState(0)

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
                    table: 'Notificacion'
                    // ✅ Removido filtro para escuchar TODOS los cambios
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
                    // En caso de error, recargar notificaciones manualmente
                    setTimeout(() => {
                        console.log('🔄 Recargando notificaciones tras error')
                        recargarNotificaciones()
                    }, 2000)
                } else {
                    console.log('✅ Suscripción de notificaciones:', status)
                    if (status === 'SUBSCRIBED') {
                        console.log('🎯 Canal realtime activo y escuchando cambios en Notificacion')
                    }
                }
            })

        // Cleanup
        return () => {
            console.log('🧹 Limpiando suscripción de notificaciones')
            supabase.removeChannel(channel)
        }
    }, [recargarNotificaciones])

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
        recargarNotificaciones,
        ocultarNotificacionOptimistic
    }
}
