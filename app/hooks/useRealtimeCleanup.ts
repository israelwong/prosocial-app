'use client'
import { useEffect } from 'react'
import { limpiarConexionesRealtime, monitorearConexiones } from '@/lib/supabase-realtime'

/**
 * Hook para limpiar conexiones Realtime automáticamente
 * Útil para prevenir acumulación de conexiones en el dashboard
 */
export function useRealtimeCleanup() {
    useEffect(() => {
        // Verificar conexiones al montar
        const isHealthy = monitorearConexiones()

        if (!isHealthy) {
            console.log('🧹 Limpiando conexiones Realtime en el montaje...')
            limpiarConexionesRealtime()
        }

        // Limpieza periódica cada 5 minutos
        const interval = setInterval(() => {
            const isHealthy = monitorearConexiones()
            if (!isHealthy) {
                console.log('🧹 Limpieza automática de conexiones Realtime...')
                limpiarConexionesRealtime()
            }
        }, 5 * 60 * 1000) // 5 minutos

        // Cleanup al desmontar
        return () => {
            clearInterval(interval)
            // Opcional: limpiar al desmontar
            // limpiarConexionesRealtime()
        }
    }, [])
}

/**
 * Hook más agresivo para componentes críticos como dashboard
 */
export function useRealtimeCleanupAggressive() {
    useEffect(() => {
        // Limpiar todas las conexiones al montar el dashboard
        console.log('🧹 Limpieza agresiva de conexiones Realtime para dashboard...')
        const cleaned = limpiarConexionesRealtime()

        if (cleaned > 0) {
            console.log(`✅ Se limpiaron ${cleaned} conexiones huérfanas`)
        }

        // Cleanup al desmontar
        return () => {
            // Para el dashboard, mantener limpio al salir
            limpiarConexionesRealtime()
        }
    }, [])
}
