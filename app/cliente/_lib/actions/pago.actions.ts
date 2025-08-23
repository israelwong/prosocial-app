/**
 * Server Actions para pagos del cliente
 */

'use server'

import { cookies } from 'next/headers'
import prisma from '@/app/admin/_lib/prismaClient'

interface CotizacionPago {
    id: string
    total: number
    pagado: number
    evento: {
        id: string
        nombre: string
        fecha_evento: Date
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

/**
 * Obtiene información de cotización para pagos (Server Action)
 */
export async function obtenerCotizacionPago(cotizacionId: string): Promise<{ success: boolean; cotizacion?: CotizacionPago; message?: string }> {
    try {
        const cookieStore = await cookies()
        const clienteId = cookieStore.get('clienteId')?.value

        if (!clienteId) {
            return {
                success: false,
                message: 'Cliente no autenticado'
            }
        }

        // Buscar la cotización con validación de cliente
        const cotizacion = await prisma.cotizacion.findFirst({
            where: {
                id: cotizacionId,
                status: 'aprobada', // Solo cotizaciones aprobadas pueden tener pagos
                Evento: {
                    clienteId: clienteId // Validar que pertenece al cliente autenticado
                }
            },
            include: {
                Evento: {
                    include: {
                        Cliente: {
                            select: {
                                id: true,
                                nombre: true,
                                email: true,
                                telefono: true
                            }
                        }
                    }
                },
                Pago: {
                    where: {
                        status: 'succeeded'
                    },
                    select: {
                        monto: true
                    }
                }
            }
        })

        if (!cotizacion) {
            return {
                success: false,
                message: 'Cotización no encontrada o no está aprobada'
            }
        }

        const totalPagado = cotizacion.Pago?.reduce((sum: number, pago: any) => sum + pago.monto, 0) || 0

        const cotizacionPago: CotizacionPago = {
            id: cotizacion.id,
            total: cotizacion.precio,
            pagado: totalPagado,
            evento: {
                id: cotizacion.Evento.id,
                nombre: cotizacion.Evento.nombre || 'Evento',
                fecha_evento: cotizacion.Evento.fecha_evento,
                lugar: cotizacion.Evento.sede || cotizacion.Evento.direccion || '',
                numero_invitados: 0 // Temporal hasta que tengamos este campo
            },
            cliente: {
                id: cotizacion.Evento.Cliente.id,
                nombre: cotizacion.Evento.Cliente.nombre || '',
                email: cotizacion.Evento.Cliente.email || '',
                telefono: cotizacion.Evento.Cliente.telefono || ''
            }
        }

        return {
            success: true,
            cotizacion: cotizacionPago
        }
    } catch (error) {
        console.error('Error al obtener cotización para pago:', error)
        return {
            success: false,
            message: 'Error interno del servidor'
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
