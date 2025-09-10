'use client'

import { limpiarConexionesRealtime, monitorearConexiones } from '@/lib/supabase-realtime'

// Función de limpieza que se ejecuta automáticamente
export function initRealtimeCleanup() {
    if (typeof window !== 'undefined') {
        // Ejecutar limpieza inicial
        setTimeout(() => {
            const isHealthy = monitorearConexiones()
            if (!isHealthy) {
                console.log('🧹 Limpieza inicial de conexiones Realtime...')
                limpiarConexionesRealtime()
            }
        }, 1000)

        // Configurar limpieza periódica
        const interval = setInterval(() => {
            const isHealthy = monitorearConexiones()
            if (!isHealthy) {
                console.log('🧹 Limpieza automática de conexiones Realtime...')
                limpiarConexionesRealtime()
            }
        }, 5 * 60 * 1000) // Cada 5 minutos

        // Limpieza al cerrar/recargar página
        const handleBeforeUnload = () => {
            limpiarConexionesRealtime()
        }

        window.addEventListener('beforeunload', handleBeforeUnload)

        // Retornar función de cleanup
        return () => {
            clearInterval(interval)
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }
}

// Auto-inicializar cuando se importe el módulo
if (typeof window !== 'undefined') {
    initRealtimeCleanup()
}
