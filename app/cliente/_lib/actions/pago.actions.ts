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
        // Usar el endpoint de checkout existente que es más completo
        const response = await fetch('/api/checkout/create-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cotizacionId: data.cotizacionId,
                monto: data.monto,
                montoFinal: data.monto,
                nombreCliente: data.clienteNombre,
                emailCliente: data.clienteEmail,
                concepto: `Pago para ${data.eventoNombre}`,
                descripcion: `Abono de ${new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN'
                }).format(data.monto)} para el evento ${data.eventoNombre}`,
                paymentMethod: 'card', // Por defecto tarjeta
                isClientPortal: true, // Identificar que viene del portal cliente
                returnUrl: `${window.location.origin}/cliente/pago/success?session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: `${window.location.origin}/cliente/pago/${data.cotizacionId}`
            })
        })

        const result = await response.json()

        if (response.ok && result.url) {
            return {
                success: true,
                sessionUrl: result.url
            }
        } else {
            return {
                success: false,
                message: result.error || 'Error al crear sesión de pago'
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
