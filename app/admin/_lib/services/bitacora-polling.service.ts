// =====================================================
// SISTEMA DE POLLING INTELIGENTE PARA EventoBitacora
// =====================================================
// Alternativa a Realtime que funciona de manera más confiable

import { useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'

// Types
import type { EventoBitacora } from '@/app/admin/_lib/types'

// Actions
import { obtenerEventoBitacora } from '@/app/admin/_lib/actions/bitacora/bitacora.actions'

type UpdateCallback = (bitacora: EventoBitacora[]) => void

interface PollingConfig {
    eventoId: string
    onUpdate: (bitacoras: any[]) => void
    intervalMs?: number // default: 15 segundos
    enableLogs?: boolean
}

export class BitacoraPollingService {
    private intervalId: NodeJS.Timeout | null = null
    private lastCount = 0
    private config: PollingConfig

    constructor(config: PollingConfig) {
        this.config = {
            intervalMs: 15000, // 15 segundos por defecto
            enableLogs: true,
            ...config
        }
    }

    start() {
        if (this.intervalId) {
            this.stop() // Detener si ya está corriendo
        }

        this.log('🔄 Iniciando polling inteligente para bitácora')

        // Verificación inicial
        this.checkForUpdates()

        // Configurar polling
        this.intervalId = setInterval(() => {
            this.checkForUpdates()
        }, this.config.intervalMs)
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId)
            this.intervalId = null
            this.log('⏹️ Polling de bitácora detenido')
        }
    }

    private async checkForUpdates() {
        try {
            const bitacoras = await obtenerEventoBitacora(this.config.eventoId)

            // Solo actualizar si hay cambios
            if (bitacoras.length !== this.lastCount) {
                this.log(`📝 Cambios detectados: ${this.lastCount} → ${bitacoras.length} entradas`)
                this.lastCount = bitacoras.length
                this.config.onUpdate(bitacoras)
            } else {
                this.log('📊 Sin cambios en bitácora')
            }
        } catch (error) {
            console.error('❌ Error en polling de bitácora:', error)
        }
    }

    private log(message: string) {
        if (this.config.enableLogs) {
            console.log(`[BitacoraPolling] ${message}`)
        }
    }
}

// Hook personalizado para usar el servicio
export function useBitacoraPolling(eventoId: string, onUpdate: (bitacoras: any[]) => void) {
    const serviceRef = useRef<BitacoraPollingService | null>(null)

    useEffect(() => {
        serviceRef.current = new BitacoraPollingService({
            eventoId,
            onUpdate,
            intervalMs: 15000 // 15 segundos
        })

        serviceRef.current.start()

        return () => {
            serviceRef.current?.stop()
        }
    }, [eventoId, onUpdate])

    return {
        stop: () => serviceRef.current?.stop(),
        start: () => serviceRef.current?.start()
    }
}
