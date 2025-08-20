import { useState } from 'react'

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

interface DatosEliminacion {
    entidad: EntidadInfo
    dependencias: DependenciaInfo[]
    advertencias?: string[]
    bloqueos?: string[]
}

export function useModalEliminacion() {
    const [isOpen, setIsOpen] = useState(false)
    const [datos, setDatos] = useState<DatosEliminacion | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const abrirModal = (datosEliminacion: DatosEliminacion) => {
        setDatos(datosEliminacion)
        setIsOpen(true)
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
                // Si hay dependencias que bloquean, actualizar el modal
                if (resultado.dependencias) {
                    const bloqueos = []
                    if (resultado.dependencias.nominasActivas > 0) {
                        bloqueos.push(`${resultado.dependencias.nominasActivas} nómina(s) activa(s) deben ser canceladas o transferidas primero`)
                    }
                    actualizarBloqueos(bloqueos)
                } else {
                    onError?.(resultado.error || 'Error desconocido')
                    cerrarModal()
                }
            }
        } catch (error) {
            onError?.(error)
            cerrarModal()
        } finally {
            setIsLoading(false)
        }
    }

    // Helpers para crear dependencias comunes
    const crearDependenciaServicio = (cantidad: number) => ({
        tipo: 'servicios incluidos',
        cantidad,
        accion: 'eliminar' as const,
        descripcion: 'Servicios y sus nóminas asociadas'
    })

    const crearDependenciaVisitas = () => ({
        tipo: 'historial de visitas',
        cantidad: 1,
        accion: 'eliminar' as const,
        descripcion: 'Registros de visualización'
    })

    const crearDependenciaCostos = () => ({
        tipo: 'costos adicionales',
        cantidad: 1,
        accion: 'eliminar' as const,
        descripcion: 'Si existen costos personalizados'
    })

    const crearDependenciaPagos = () => ({
        tipo: 'pagos relacionados',
        cantidad: 1,
        accion: 'desvincular' as const,
        descripcion: 'Se mantienen como registros históricos'
    })

    const crearDependenciaAgendas = () => ({
        tipo: 'agendas del evento',
        cantidad: 1,
        accion: 'preservar' as const,
        descripcion: 'Permanecen en el evento'
    })

    // Helper para crear advertencias comunes de cotizaciones
    const advertenciasCotizacion = [
        'Si hay nóminas activas asociadas, la eliminación será automáticamente bloqueada',
        'Los pagos se mantendrán pero se desvincularan de esta cotización',
        'Las agendas del evento no se ven afectadas por esta eliminación'
    ]

    return {
        isOpen,
        datos,
        isLoading,
        abrirModal,
        cerrarModal,
        actualizarBloqueos,
        ejecutarEliminacion,
        // Helpers
        crearDependenciaServicio,
        crearDependenciaVisitas,
        crearDependenciaCostos,
        crearDependenciaPagos,
        crearDependenciaAgendas,
        advertenciasCotizacion
    }
}

// Hook específico para cotizaciones
export function useEliminacionCotizacion() {
    const modal = useModalEliminacion()

    const prepararDatosCotizacion = (cotizacion: any) => {
        const dependencias = []

        // Agregar servicios si existen
        if (cotizacion.servicios && cotizacion.servicios.length > 0) {
            dependencias.push(modal.crearDependenciaServicio(cotizacion.servicios.length))
        }

        // Agregar dependencias estándar
        dependencias.push(
            modal.crearDependenciaVisitas(),
            modal.crearDependenciaCostos(),
            modal.crearDependenciaPagos(),
            modal.crearDependenciaAgendas()
        )

        return {
            entidad: {
                nombre: cotizacion.nombre,
                valor: `$${cotizacion.precio.toLocaleString('es-MX')}`,
                descripcion: `Status: ${cotizacion.status} • Visible para cliente: ${cotizacion.visible_cliente ? 'Sí' : 'No'}`
            },
            dependencias,
            advertencias: modal.advertenciasCotizacion,
            bloqueos: []
        }
    }

    return {
        ...modal,
        prepararDatosCotizacion
    }
}
