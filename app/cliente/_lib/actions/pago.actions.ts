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

interface DatosPagoCliente {
    cotizacionId: string
    clienteId: string
    monto: number
    metodoPago: string
    datosTarjeta?: {
        numero: string
        fechaExpiracion: string
        cvv: string
        nombre: string
    }
}

interface PagoGeneralCliente {
    id: string
    monto: number
    fecha_pago: Date
    metodo_pago: string
    status: string
    cotizacion: {
        id: string
        evento: {
            id: string
            nombre: string
            fecha_evento: Date
        }
    }
}

/**
 * Obtiene información de cotización para pagos (Server Action)
 */
export async function obtenerCotizacionPago(cotizacionId: string, clienteId?: string): Promise<{ success: boolean; cotizacion?: CotizacionPago; message?: string }> {
    try {
        let validClienteId = clienteId

        // Si no se proporciona clienteId, intentar obtenerlo de las cookies
        if (!validClienteId) {
            const cookieStore = await cookies()
            validClienteId = cookieStore.get('clienteId')?.value
        }

        if (!validClienteId) {
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
                    clienteId: validClienteId // Validar que pertenece al cliente autenticado
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
                        OR: [
                            { status: 'paid' },
                            { status: 'completado' },
                            { status: 'succeeded' } // Para compatibilidad con Stripe
                        ]
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

/**
 * Obtiene todos los pagos de un evento específico (Server Action)
 */
export async function obtenerPagosEvento(eventoId: string, clienteId?: string): Promise<{ success: boolean; pagos?: any[]; message?: string }> {
    try {
        let validClienteId = clienteId

        // Si no se proporciona clienteId, intentar obtenerlo de las cookies
        if (!validClienteId) {
            const cookieStore = await cookies()
            validClienteId = cookieStore.get('clienteId')?.value
        }

        if (!validClienteId) {
            return {
                success: false,
                message: 'Cliente no autenticado'
            }
        }

        // Verificar que el evento pertenece al cliente
        const evento = await prisma.evento.findFirst({
            where: {
                id: eventoId,
                clienteId: validClienteId
            },
            include: {
                Cotizacion: {
                    include: {
                        Pago: {
                            orderBy: {
                                createdAt: 'desc'
                            }
                        }
                    }
                }
            }
        })

        if (!evento) {
            return {
                success: false,
                message: 'Evento no encontrado'
            }
        }

        // Extraer todos los pagos de todas las cotizaciones del evento
        const pagos = evento.Cotizacion.flatMap(cotizacion =>
            cotizacion.Pago.map(pago => ({
                id: pago.id,
                monto: pago.monto,
                comisionStripe: (pago as any).comisionStripe || 0, // 🆕 Incluir comisión Stripe
                metodo_pago: pago.metodo_pago,
                status: pago.status,
                createdAt: pago.createdAt,
                stripe_payment_id: pago.stripe_payment_id,
                concepto: pago.concepto,
                descripcion: pago.descripcion,
                cotizacion: {
                    id: cotizacion.id,
                    precio: cotizacion.precio
                }
            }))
        )

        return {
            success: true,
            pagos: pagos
        }

    } catch (error) {
        console.error('Error al obtener pagos del evento:', error)
        return {
            success: false,
            message: 'Error interno del servidor'
        }
    }
}

/**
 * Crea un nuevo pago del cliente (Server Action)
 */
export async function crearPagoCliente(data: DatosPagoCliente): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
        // Validación opcional con cookies (para compatibilidad)
        const cookieStore = await cookies()
        const clienteIdCookie = cookieStore.get('clienteId')?.value

        // Si hay cookie, validar que coincida con el clienteId del parámetro
        if (clienteIdCookie && clienteIdCookie !== data.clienteId) {
            return {
                success: false,
                message: 'Datos de autenticación inconsistentes'
            }
        }

        // Si no hay cookie pero sí hay clienteId en los datos, proceder
        if (!clienteIdCookie && !data.clienteId) {
            return {
                success: false,
                message: 'Cliente no autenticado'
            }
        }

        // Verificar que la cotización pertenece al cliente
        const cotizacion = await prisma.cotizacion.findFirst({
            where: {
                id: data.cotizacionId,
                status: 'aprobada',
                Evento: {
                    clienteId: data.clienteId
                }
            },
            include: {
                Evento: {
                    select: {
                        nombre: true
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

        // Calcular el saldo pendiente
        const pagosCompletados = await prisma.pago.findMany({
            where: {
                cotizacionId: cotizacion.id,
                status: 'completado'
            }
        })

        const totalPagado = pagosCompletados.reduce((sum, pago) => sum + pago.monto, 0)
        const saldoPendiente = cotizacion.precio - totalPagado

        if (data.monto > saldoPendiente) {
            return {
                success: false,
                message: `El monto excede el saldo pendiente de ${new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN'
                }).format(saldoPendiente)}`
            }
        }

        // Simular procesamiento de pago
        // En un entorno real, aquí se procesaría con Stripe, PayPal, etc.
        const statusPago = Math.random() > 0.1 ? 'completado' : 'fallido' // 90% éxito

        const nuevoPago = await prisma.pago.create({
            data: {
                cotizacionId: cotizacion.id,
                clienteId: data.clienteId,
                monto: data.monto,
                metodo_pago: data.metodoPago,
                concepto: `Pago para evento ${cotizacion.Evento.nombre}`,
                descripcion: `Abono de ${new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN'
                }).format(data.monto)}`,
                status: statusPago,
                stripe_payment_id: `pi_${Date.now()}`, // ID simulado
                tipo_transaccion: 'ingreso',
                categoria_transaccion: 'abono'
            }
        })

        return {
            success: true,
            data: {
                id: nuevoPago.id,
                status: statusPago,
                monto: data.monto,
                fechaPago: nuevoPago.createdAt
            }
        }

    } catch (error) {
        console.error('Error al crear pago del cliente:', error)
        return {
            success: false,
            message: 'Error interno del servidor'
        }
    }
}

/**
 * Obtiene todos los pagos de una cotización específica (Server Action)
 */
export async function obtenerPagosCotizacion(cotizacionId: string, clienteId?: string): Promise<{ success: boolean; pagos?: any[]; message?: string }> {
    try {
        let validClienteId = clienteId

        // Si no se proporciona clienteId, intentar obtenerlo de las cookies
        if (!validClienteId) {
            const cookieStore = await cookies()
            validClienteId = cookieStore.get('clienteId')?.value
        }

        if (!validClienteId) {
            return {
                success: false,
                message: 'Cliente no autenticado'
            }
        }

        // Verificar que la cotización pertenece al cliente
        const cotizacion = await prisma.cotizacion.findFirst({
            where: {
                id: cotizacionId,
                Evento: {
                    clienteId: validClienteId
                }
            },
            include: {
                Pago: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        })

        if (!cotizacion) {
            return {
                success: false,
                message: 'Cotización no encontrada'
            }
        }

        // Formatear los pagos
        const pagos = cotizacion.Pago.map(pago => ({
            id: pago.id,
            monto: pago.monto,
            metodo_pago: pago.metodo_pago,
            status: pago.status,
            createdAt: pago.createdAt,
            stripe_payment_id: pago.stripe_payment_id,
            concepto: pago.concepto,
            descripcion: pago.descripcion
        }))

        return {
            success: true,
            pagos: pagos
        }

    } catch (error) {
        console.error('Error al obtener pagos de la cotización:', error)
        return {
            success: false,
            message: 'Error interno del servidor'
        }
    }
}

/**
 * Obtener todos los pagos del cliente
 */
export async function obtenerTodosPagosCliente(clienteId?: string): Promise<{
    success: boolean
    pagos?: PagoGeneralCliente[]
    message?: string
}> {
    try {
        // Verificar autenticación
        const cookieStore = await cookies()
        const clienteIdCookie = cookieStore.get('clienteId')?.value
        const finalClienteId = clienteId || clienteIdCookie

        if (!finalClienteId) {
            return {
                success: false,
                message: 'Cliente no autenticado'
            }
        }

        // Obtener todos los pagos del cliente a través de sus cotizaciones
        const pagos = await prisma.pago.findMany({
            where: {
                Cotizacion: {
                    Evento: {
                        clienteId: finalClienteId
                    }
                },
                status: {
                    in: ['paid', 'completado', 'succeeded']
                }
            },
            include: {
                Cotizacion: {
                    select: {
                        id: true,
                        Evento: {
                            select: {
                                id: true,
                                nombre: true,
                                fecha_evento: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Formatear los pagos
        const pagosFormateados = pagos.map(pago => ({
            id: pago.id,
            monto: pago.monto,
            fecha_pago: pago.createdAt,
            metodo_pago: pago.metodo_pago,
            status: pago.status,
            cotizacion: {
                id: pago.Cotizacion?.id || '',
                evento: {
                    id: pago.Cotizacion?.Evento?.id || '',
                    nombre: pago.Cotizacion?.Evento?.nombre || '',
                    fecha_evento: pago.Cotizacion?.Evento?.fecha_evento || new Date()
                }
            }
        }))

        return {
            success: true,
            pagos: pagosFormateados
        }

    } catch (error) {
        console.error('Error al obtener todos los pagos del cliente:', error)
        return {
            success: false,
            message: 'Error interno del servidor'
        }
    }
}

/**
 * Obtener métodos de pago disponibles con sus comisiones
 */
export async function obtenerMetodosPago() {
    try {
        console.log('🔍 Obteniendo métodos de pago con comisiones...')

        const metodosPago = await prisma.metodoPago.findMany({
            where: {
                status: 'active'
            },
            select: {
                id: true,
                metodo_pago: true,
                comision_porcentaje_base: true,
                comision_fija_monto: true,
                num_msi: true,
                comision_msi_porcentaje: true,
                payment_method: true
            },
            orderBy: {
                orden: 'asc'
            }
        })

        console.log('✅ Métodos de pago obtenidos:', metodosPago.length)

        return {
            success: true,
            data: metodosPago
        }

    } catch (error) {
        console.error('❌ Error al obtener métodos de pago:', error)
        return {
            success: false,
            message: 'Error al obtener métodos de pago',
            data: []
        }
    }
}
