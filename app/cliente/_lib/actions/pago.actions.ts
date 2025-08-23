/**
 * Acciones para manejo de pagos del cliente
 */

interface CotizacionPago {
    id: string
    total: number
    pagado: number
    evento: {
        id: string
        nombre: string
        fecha_evento: string
        lugar: string
        numero_invitados: number
    }
    cliente: {
        id: string
        nombre: string
        email: string
        telefono: string
    }
}

interface SesionPagoData {
    cotizacionId: string
    monto: number
    clienteEmail: string
    clienteNombre: string
    eventoNombre: string
}

export async function obtenerCotizacionPago(cotizacionId: string): Promise<{ success: boolean; cotizacion?: CotizacionPago; message?: string }> {
    try {
        const response = await fetch(`/api/cliente/pago/${cotizacionId}`)
        const result = await response.json()

        if (response.ok && result.success) {
            return {
                success: true,
                cotizacion: result.cotizacion
            }
        } else {
            return {
                success: false,
                message: result.message || 'Error al obtener información de pago'
            }
        }
    } catch (error) {
        console.error('Error en obtenerCotizacionPago:', error)
        return {
            success: false,
            message: 'Error de conexión'
        }
    }
}

export async function crearSesionPago(data: SesionPagoData): Promise<{ success: boolean; sessionUrl?: string; message?: string }> {
    try {
        const response = await fetch('/api/cliente/create-payment-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        const result = await response.json()

        if (response.ok && result.success) {
            return {
                success: true,
                sessionUrl: result.sessionUrl
            }
        } else {
            return {
                success: false,
                message: result.message || 'Error al crear sesión de pago'
            }
        }
    } catch (error) {
        console.error('Error en crearSesionPago:', error)
        return {
            success: false,
            message: 'Error de conexión'
        }
    }
}

export async function verificarPago(sessionId: string): Promise<{ success: boolean; pago?: any; message?: string }> {
    try {
        const response = await fetch(`/api/cliente/verify-payment?session_id=${sessionId}`)
        const result = await response.json()

        if (response.ok && result.success) {
            return {
                success: true,
                pago: result.pago
            }
        } else {
            return {
                success: false,
                message: result.message || 'Error al verificar pago'
            }
        }
    } catch (error) {
        console.error('Error en verificarPago:', error)
        return {
            success: false,
            message: 'Error de conexión'
        }
    }
}
