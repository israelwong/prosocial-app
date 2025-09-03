'use client'
import { useEffect, useState, useCallback } from 'react'

interface UseNotificacionesPollingReturn {
    notificaciones: any[]
    nuevasNotificaciones: number
    ultimaActualizacion: Date | null
    cargando: boolean
    recargarNotificaciones: () => Promise<void>
    ocultarNotificacionOptimistic: (notificacionId: string) => void
}

export function useNotificacionesPolling(): UseNotificacionesPollingReturn {
    const [notificaciones, setNotificaciones] = useState<any[]>([])
    const [nuevasNotificaciones, setNuevasNotificaciones] = useState(0)
    const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null)
    const [cargando, setCargando] = useState(true)

    // Función para recargar notificaciones
    const recargarNotificaciones = useCallback(async () => {
        try {
            setCargando(true)
            const { obtenerNotificaciones } = await import('../_lib/actions/notificacion/notificacion.actions')
            const result = await obtenerNotificaciones()

            // Filtrar notificaciones ocultas
            const notificacionesVisibles = result.filter((n: any) => n.status !== 'oculta')

            setNotificaciones(notificacionesVisibles || [])
            setUltimaActualizacion(new Date())

            // Contar nuevas notificaciones
            const noLeidas = notificacionesVisibles.filter((n: any) => n.status !== 'leida')
            setNuevasNotificaciones(noLeidas.length)

            console.log('🔄 [POLLING] Notificaciones actualizadas:', {
                total: notificacionesVisibles.length,
                noLeidas: noLeidas.length,
                timestamp: new Date().toISOString()
            })
        } catch (error) {
            console.error('❌ Error al recargar notificaciones:', error)
        } finally {
            setCargando(false)
        }
    }, [])

    // Función para ocultar notificación (optimistic update)
    const ocultarNotificacionOptimistic = useCallback((notificacionId: string) => {
        const notifAnterior = notificaciones.find(n => n.id === notificacionId)

        // Remover inmediatamente del estado
        setNotificaciones(prev => prev.filter(n => n.id !== notificacionId))

        // Actualizar contador si era una notificación no leída
        if (notifAnterior && notifAnterior.status !== 'leida') {
            setNuevasNotificaciones(prev => Math.max(0, prev - 1))
        }
    }, [notificaciones])

    // Cargar notificaciones inicial
    useEffect(() => {
        recargarNotificaciones()
    }, [recargarNotificaciones])

    // Polling cada 30 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            console.log('⏰ [POLLING] Verificando notificaciones automáticamente...')
            recargarNotificaciones()
        }, 30000) // 30 segundos

        return () => clearInterval(interval)
    }, [recargarNotificaciones])

    return {
        notificaciones,
        nuevasNotificaciones,
        ultimaActualizacion,
        cargando,
        recargarNotificaciones,
        ocultarNotificacionOptimistic
    }
}
