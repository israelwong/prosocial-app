'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

interface UseAutoRefreshOptions {
    intervalMs?: number
    enabled?: boolean
}

/**
 * Hook para auto-refresh del dashboard
 * Revalida los datos del servidor cada X segundos
 */
export function useAutoRefresh({
    intervalMs = 30000, // 30 segundos por defecto
    enabled = true
}: UseAutoRefreshOptions = {}) {
    const router = useRouter()

    const refresh = useCallback(() => {
        // Refresh de la página completa para revalidar server components
        router.refresh()
    }, [router])

    useEffect(() => {
        if (!enabled) return

        const interval = setInterval(() => {
            refresh()
        }, intervalMs)

        return () => clearInterval(interval)
    }, [intervalMs, enabled, refresh])

    return { refresh }
}

/**
 * Hook para detectar cambios de visibilidad de la página
 * Útil para pausar/reanudar el refresh cuando el usuario no está viendo la página
 */
export function usePageVisibility() {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden)
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [])

    return isVisible
}
