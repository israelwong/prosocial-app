'use client'
import { useRealtimeCleanupAggressive } from '@/app/hooks/useRealtimeCleanup'

/**
 * Componente para limpiar conexiones Realtime en el dashboard
 * Se usa para prevenir el error DatabaseLackOfConnections
 */
export function DashboardRealtimeCleanup() {
    useRealtimeCleanupAggressive()
    return null // Este componente no renderiza nada, solo ejecuta la limpieza
}
