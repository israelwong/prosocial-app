import { useState } from 'react'
import { verificarDependenciasEvento } from '@/app/admin/_lib/actions/evento/evento.actions'

interface DependenciaInfo {
    tipo: string
    cantidad: number
    accion: 'eliminar' | 'desvincular' | 'preservar'
    descripcion?: string
}

interface EntidadInfo {
    nombre: string
    valor?: string
    descripcion?: string
}

interface DatosEliminacionEvento {
    entidad: EntidadInfo
    dependencias: DependenciaInfo[]
    advertencias?: string[]
    bloqueos?: string[]
}

export function useModalEliminacionEvento() {
    const [isOpen, setIsOpen] = useState(false)
    const [datos, setDatos] = useState<DatosEliminacionEvento | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const abrirModal = async (eventoId: string, nombreEvento: string) => {
        setIsLoading(true)

        try {
            const verificacion = await verificarDependenciasEvento(eventoId)

            if (verificacion.error) {
                throw new Error(verificacion.error)
            }

            // Crear lista de dependencias basada en los conteos
            const dependenciasList: string[] = []
            if (verificacion.dependencias.cotizaciones > 0) {
                dependenciasList.push(`${verificacion.dependencias.cotizaciones} cotización(es)`)
            }
            if (verificacion.dependencias.agenda > 0) {
                dependenciasList.push(`${verificacion.dependencias.agenda} agenda(s)`)
            }
            if (verificacion.dependencias.bitacora > 0) {
                dependenciasList.push(`${verificacion.dependencias.bitacora} entrada(s) de bitácora`)
            }

            const datosEliminacion: DatosEliminacionEvento = {
                entidad: {
                    nombre: 'Evento',
                    valor: nombreEvento,
                    descripcion: 'Esta acción eliminará permanentemente el evento y sus datos asociados'
                },
                dependencias: dependenciasList.map(dep => ({
                    tipo: dep,
                    cantidad: 1,
                    accion: 'eliminar' as const,
                    descripcion: `Se eliminará: ${dep}`
                })),
                advertencias: verificacion.tieneDependencias
                    ? ['Este evento tiene dependencias que también serán eliminadas']
                    : [],
                bloqueos: []
            }

            setDatos(datosEliminacion)
            setIsOpen(true)
        } catch (error) {
            console.error('Error verificando dependencias del evento:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const cerrarModal = () => {
        setIsOpen(false)
        setDatos(null)
        setIsLoading(false)
    }

    const actualizarBloqueos = (bloqueos: string[]) => {
        if (datos) {
            setDatos(prev => prev ? { ...prev, bloqueos } : null)
        }
    }

    const ejecutarEliminacion = async (
        accionEliminacion: () => Promise<any>,
        onSuccess?: (resultado: any) => void,
        onError?: (error: any) => void
    ) => {
        setIsLoading(true)

        try {
            const resultado = await accionEliminacion()

            if (resultado.success) {
                onSuccess?.(resultado)
                cerrarModal()
            } else {
                onError?.(resultado.message || 'Error al eliminar')
            }
        } catch (error) {
            console.error('Error ejecutando eliminación:', error)
            onError?.(error)
        } finally {
            setIsLoading(false)
        }
    }

    return {
        isOpen,
        datos,
        isLoading,
        abrirModal,
        cerrarModal,
        actualizarBloqueos,
        ejecutarEliminacion
    }
}
