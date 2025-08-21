'use server'

import { PAGO_STATUS, type PagoStatus } from '@/app/admin/_lib/constants/status'
import prisma from '@/app/admin/_lib/prismaClient'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Schemas para validación
const PagoCreateSchema = z.object({
    cotizacionId: z.string().min(1, 'ID de cotización requerido'),
    clienteId: z.string().optional(), // Hacer opcional ya que podemos obtenerlo de la cotización
    monto: z.number().positive('El monto debe ser positivo'),
    metodoPago: z.enum(['tarjeta de crédito', 'tarjeta de debito', 'transferencia interbancaria', 'efectivo', 'cheque', 'oxxo']),
    concepto: z.string().optional(),
    descripcion: z.string().optional(),
    fechaPago: z.string().optional()
})

const PagoUpdateSchema = PagoCreateSchema.partial().extend({
    id: z.string().min(1, 'ID de pago requerido')
})

type PagoCreateForm = z.infer<typeof PagoCreateSchema>
type PagoUpdateForm = z.infer<typeof PagoUpdateSchema>

export async function crearPago(data: PagoCreateForm) {
    try {
        console.log('💰 Creando nuevo pago:', data)

        // Validar datos
        const validData = PagoCreateSchema.parse(data)

        // Obtener clienteId desde la cotización si no se proporciona
        let clienteId = validData.clienteId

        if (!clienteId) {
            const cotizacion = await prisma.cotizacion.findUnique({
                where: { id: validData.cotizacionId },
                include: {
                    Evento: {
                        select: { clienteId: true }
                    }
                }
            })

            if (!cotizacion?.Evento?.clienteId) {
                throw new Error('No se pudo obtener el ID del cliente desde la cotización')
            }

            clienteId = cotizacion.Evento.clienteId
        }

        // Obtener método de pago por defecto
        let metodoPagoId = null
        if (validData.metodoPago) {
            const metodoPago = await prisma.metodoPago.findFirst({
                where: { metodo_pago: validData.metodoPago }
            })
            metodoPagoId = metodoPago?.id || null
        }

        // Crear el pago
        const nuevoPago = await prisma.pago.create({
            data: {
                cotizacionId: validData.cotizacionId,
                clienteId,
                monto: validData.monto,
                metodo_pago: validData.metodoPago,
                metodoPagoId,
                concepto: validData.concepto || 'Pago registrado manualmente',
                descripcion: validData.descripcion,
                status: PAGO_STATUS.PAID,
                tipo_transaccion: 'income',
                categoria_transaccion: 'event_payment',
                createdAt: validData.fechaPago ? new Date(validData.fechaPago) : new Date()
            },
            include: {
                MetodoPago: true,
                Cliente: true,
                Cotizacion: {
                    include: {
                        Evento: true
                    }
                }
            }
        })

        console.log('✅ Pago creado exitosamente:', nuevoPago.id)

        // Revalidar las páginas relacionadas
        revalidatePath('/admin/dashboard/seguimiento')
        revalidatePath('/admin/dashboard/eventos')
        if (nuevoPago.Cotizacion?.Evento?.id) {
            revalidatePath(`/admin/dashboard/seguimiento/${nuevoPago.Cotizacion.Evento.id}`)
            revalidatePath(`/admin/dashboard/eventos/${nuevoPago.Cotizacion.Evento.id}`)
        }

        return {
            success: true,
            data: nuevoPago,
            message: 'Pago registrado exitosamente'
        }

    } catch (error) {
        console.error('❌ Error al crear pago:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido al crear pago'
        }
    }
}

export async function actualizarPago(data: PagoUpdateForm) {
    try {
        console.log('📝 Actualizando pago:', data.id)

        // Validar datos
        const validData = PagoUpdateSchema.parse(data)
        const { id, ...updateData } = validData

        // Preparar datos de actualización
        const dataToUpdate: any = {}

        if (updateData.monto !== undefined) dataToUpdate.monto = updateData.monto
        if (updateData.metodoPago !== undefined) dataToUpdate.metodo_pago = updateData.metodoPago
        if (updateData.concepto !== undefined) dataToUpdate.concepto = updateData.concepto
        if (updateData.descripcion !== undefined) dataToUpdate.descripcion = updateData.descripcion
        if (updateData.fechaPago !== undefined) dataToUpdate.createdAt = new Date(updateData.fechaPago)

        // Actualizar método de pago si cambió
        if (updateData.metodoPago) {
            const metodoPago = await prisma.metodoPago.findFirst({
                where: { metodo_pago: updateData.metodoPago }
            })
            dataToUpdate.metodoPagoId = metodoPago?.id || null
        }

        // Actualizar el pago
        const pagoActualizado = await prisma.pago.update({
            where: { id },
            data: dataToUpdate,
            include: {
                MetodoPago: true,
                Cliente: true,
                Cotizacion: {
                    include: {
                        Evento: true
                    }
                }
            }
        })

        console.log('✅ Pago actualizado exitosamente')

        // Revalidar las páginas relacionadas
        revalidatePath('/admin/dashboard/seguimiento')
        revalidatePath('/admin/dashboard/eventos')
        if (pagoActualizado.Cotizacion?.Evento?.id) {
            revalidatePath(`/admin/dashboard/seguimiento/${pagoActualizado.Cotizacion.Evento.id}`)
            revalidatePath(`/admin/dashboard/eventos/${pagoActualizado.Cotizacion.Evento.id}`)
        }

        return {
            success: true,
            data: pagoActualizado,
            message: 'Pago actualizado exitosamente'
        }

    } catch (error) {
        console.error('❌ Error al actualizar pago:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido al actualizar pago'
        }
    }
}

export async function eliminarPago(pagoId: string) {
    try {
        console.log('🗑️ Eliminando pago:', pagoId)

        // Obtener información del pago antes de eliminarlo
        const pagoExistente = await prisma.pago.findUnique({
            where: { id: pagoId },
            include: {
                Cotizacion: {
                    include: {
                        Evento: true
                    }
                }
            }
        })

        if (!pagoExistente) {
            return {
                success: false,
                error: 'Pago no encontrado'
            }
        }

        // Eliminar el pago
        await prisma.pago.delete({
            where: { id: pagoId }
        })

        console.log('✅ Pago eliminado exitosamente')

        // Revalidar las páginas relacionadas
        revalidatePath('/admin/dashboard/seguimiento')
        revalidatePath('/admin/dashboard/eventos')
        if (pagoExistente.Cotizacion?.Evento?.id) {
            revalidatePath(`/admin/dashboard/seguimiento/${pagoExistente.Cotizacion.Evento.id}`)
            revalidatePath(`/admin/dashboard/eventos/${pagoExistente.Cotizacion.Evento.id}`)
        }

        return {
            success: true,
            message: 'Pago eliminado exitosamente'
        }

    } catch (error) {
        console.error('❌ Error al eliminar pago:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido al eliminar pago'
        }
    }
}

export async function cambiarStatusPago(pagoId: string, nuevoStatus: PagoStatus) {
    try {
        console.log('🔄 Cambiando status del pago:', pagoId, 'a', nuevoStatus)

        const pagoActualizado = await prisma.pago.update({
            where: { id: pagoId },
            data: { status: nuevoStatus },
            include: {
                MetodoPago: true,
                Cliente: true,
                Cotizacion: {
                    include: {
                        Evento: true
                    }
                }
            }
        })

        console.log('✅ Status de pago actualizado exitosamente')

        // Revalidar las páginas relacionadas
        revalidatePath('/admin/dashboard/seguimiento')
        revalidatePath('/admin/dashboard/eventos')
        if (pagoActualizado.Cotizacion?.Evento?.id) {
            revalidatePath(`/admin/dashboard/seguimiento/${pagoActualizado.Cotizacion.Evento.id}`)
            revalidatePath(`/admin/dashboard/eventos/${pagoActualizado.Cotizacion.Evento.id}`)
        }

        return {
            success: true,
            data: pagoActualizado,
            message: `Status cambiado a ${nuevoStatus} exitosamente`
        }

    } catch (error) {
        console.error('❌ Error al cambiar status del pago:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido al cambiar status'
        }
    }
}
