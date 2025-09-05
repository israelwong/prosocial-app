'use client'
import { useState, useEffect, useCallback } from 'react'

// Tipo para los listeners de eventos
type EventListener = (data: any) => void

// Event Bus simple para comunicación entre componentes
class EventBus {
    private listeners: { [key: string]: EventListener[] } = {}

    on(event: string, listener: EventListener) {
        if (!this.listeners[event]) {
            this.listeners[event] = []
        }
        this.listeners[event].push(listener)
    }

    off(event: string, listener: EventListener) {
        if (!this.listeners[event]) return
        this.listeners[event] = this.listeners[event].filter(l => l !== listener)
    }

    emit(event: string, data?: any) {
        if (!this.listeners[event]) return
        this.listeners[event].forEach(listener => listener(data))
    }
}

// Instancia global del event bus
const eventBus = new EventBus()

// Hook para sincronización de tipo de evento
export const useEventoSync = (eventoId: string, eventoTipoIdInicial?: string | null) => {
    const [eventoTipoId, setEventoTipoId] = useState<string | null>(eventoTipoIdInicial || null)

    // Función para actualizar el tipo de evento
    const actualizarTipoEvento = useCallback(async (nuevoTipoId: string | null) => {
        try {
            // Actualizar estado local inmediatamente
            setEventoTipoId(nuevoTipoId)

            // Emitir evento para notificar a otros componentes
            eventBus.emit('eventoTipoChanged', {
                eventoId,
                nuevoTipoId,
                timestamp: new Date()
            })

            return { success: true }
        } catch (error) {
            console.error('Error actualizando tipo de evento:', error)
            return { success: false, error }
        }
    }, [eventoId])

    // Escuchar cambios de tipo de evento de otros componentes
    useEffect(() => {
        const handleTipoEventoChange = (data: { eventoId: string, nuevoTipoId: string | null }) => {
            // Solo actualizar si es para este evento
            if (data.eventoId === eventoId) {
                setEventoTipoId(data.nuevoTipoId)
            }
        }

        eventBus.on('eventoTipoChanged', handleTipoEventoChange)

        return () => {
            eventBus.off('eventoTipoChanged', handleTipoEventoChange)
        }
    }, [eventoId])

    return {
        eventoTipoId,
        actualizarTipoEvento
    }
}

// Hook para escuchar cambios de tipo de evento (para componentes que no actualizan)
export const useEventoTipoListener = (eventoId: string, onTipoEventoChange: (nuevoTipoId: string | null) => void) => {
    useEffect(() => {
        const handleTipoEventoChange = (data: { eventoId: string, nuevoTipoId: string | null }) => {
            if (data.eventoId === eventoId) {
                onTipoEventoChange(data.nuevoTipoId)
            }
        }

        eventBus.on('eventoTipoChanged', handleTipoEventoChange)

        return () => {
            eventBus.off('eventoTipoChanged', handleTipoEventoChange)
        }
    }, [eventoId, onTipoEventoChange])
}

export default eventBus
