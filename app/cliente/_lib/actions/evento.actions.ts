/**
 * Acciones para manejo de eventos del cliente
 */

interface Evento {
    id: string
    nombre: string
    fecha_evento: string
    hora_evento: string
    numero_invitados: number
    lugar: string
    cotizacion: {
        id: string
        status: string
        total: number
        pagado: number
    }
}

interface EventoDetalle extends Evento {
    cotizacion: {
        id: string
        status: string
        total: number
        pagado: number
        descripcion?: string
        servicios: Array<{
            id: string
            nombre: string
            cantidad: number
            precio_unitario?: number
            subtotal?: number
            seccion?: string
            categoria?: string
            seccionPosicion?: number
            categoriaPosicion?: number
            posicion?: number
        }>
    }
}

export async function obtenerEventosCliente(clienteId: string): Promise<{ success: boolean; eventos?: Evento[]; message?: string }> {
    try {
        const response = await fetch(`/api/cliente/eventos/${clienteId}`)
        const result = await response.json()

        if (response.ok && result.success) {
            return {
                success: true,
                eventos: result.eventos
            }
        } else {
            return {
                success: false,
                message: result.message || 'Error al obtener eventos'
            }
        }
    } catch (error) {
        console.error('Error en obtenerEventosCliente:', error)
        return {
            success: false,
            message: 'Error de conexión'
        }
    }
}

export async function obtenerEventoDetalle(eventoId: string): Promise<{ success: boolean; evento?: EventoDetalle; message?: string }> {
    try {
        const response = await fetch(`/api/cliente/evento/${eventoId}`)
        const result = await response.json()

        if (response.ok && result.success) {
            return {
                success: true,
                evento: result.evento
            }
        } else {
            return {
                success: false,
                message: result.message || 'Error al obtener evento'
            }
        }
    } catch (error) {
        console.error('Error en obtenerEventoDetalle:', error)
        return {
            success: false,
            message: 'Error de conexión'
        }
    }
}
