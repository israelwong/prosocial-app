'use server'

import { PAGO_STATUS, COTIZACION_STATUS, EVENTO_STATUS, AGENDA_STATUS, type PagoStatus } from '@/app/admin/_lib/constants/status'
import { EVENTO_ETAPAS } from '@/app/admin/_lib/constants/evento-etapas'
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

        // Ejecutar en transacción para garantizar consistencia
        const resultado = await prisma.$transaction(async (tx) => {
            // 1. Obtener información completa del pago
            const pagoActual = await tx.pago.findUnique({
                where: { id: pagoId },
                include: {
                    MetodoPago: true,
                    Cliente: true,
                    Cotizacion: {
                        include: {
                            Evento: {
                                include: {
                                    Agenda: true,
                                    EventoEtapa: true
                                }
                            }
                        }
                    }
                }
            })

            if (!pagoActual) {
                throw new Error('Pago no encontrado')
            }

            // 2. Actualizar el estado del pago
            const pagoActualizado = await tx.pago.update({
                where: { id: pagoId },
                data: { status: nuevoStatus },
                include: {
                    MetodoPago: true,
                    Cliente: true,
                    Cotizacion: {
                        include: {
                            Evento: {
                                include: {
                                    Agenda: true,
                                    EventoEtapa: true
                                }
                            }
                        }
                    }
                }
            })

            let cambiosAdicionales = {
                cotizacionActualizada: false,
                eventoActualizado: false,
                eventoEtapaActualizada: false,
                agendaActualizada: false
            }

            // 3. Si es autorización de pago SPEI (pending → paid), aplicar flujo de autorización
            if (pagoActual.status === PAGO_STATUS.PENDING && nuevoStatus === PAGO_STATUS.PAID) {
                const cotizacion = pagoActualizado.Cotizacion
                const evento = cotizacion?.Evento

                console.log('🔥 Aplicando flujo de autorización manual por pago SPEI')

                // 3a. Actualizar cotización si está en pendiente
                if (cotizacion && cotizacion.status === COTIZACION_STATUS.PENDIENTE) {
                    await tx.cotizacion.update({
                        where: { id: cotizacion.id },
                        data: { 
                            status: COTIZACION_STATUS.APROBADA,
                            updatedAt: new Date()
                        }
                    })
                    cambiosAdicionales.cotizacionActualizada = true
                    console.log('✅ Cotización actualizada a APROBADA')
                }

                // 3b. Actualizar evento si está en pendiente
                if (evento && evento.status === EVENTO_STATUS.PENDIENTE) {
                    await tx.evento.update({
                        where: { id: evento.id },
                        data: { 
                            status: EVENTO_STATUS.APROBADO,
                            updatedAt: new Date()
                        }
                    })
                    cambiosAdicionales.eventoActualizado = true
                    console.log('✅ Evento actualizado a APROBADO')
                }

                // 3c. Si el evento está en etapa "NUEVO", moverlo a "APROBADO" y asegurar creación en agenda
                if (evento && evento.eventoEtapaId === EVENTO_ETAPAS.NUEVO) {
                    // Cambiar etapa del evento a APROBADO
                    await tx.evento.update({
                        where: { id: evento.id },
                        data: { 
                            eventoEtapaId: EVENTO_ETAPAS.APROBADO,
                            updatedAt: new Date()
                        }
                    })
                    cambiosAdicionales.eventoEtapaActualizada = true
                    console.log('✅ Evento movido de etapa NUEVO a APROBADO')

                    // Asegurar que el evento esté en agenda como confirmado
                    if (evento.Agenda && evento.Agenda.length > 0) {
                        // Actualizar agenda existente a confirmado
                        const agenda = evento.Agenda[0]
                        if (agenda.status !== AGENDA_STATUS.CONFIRMADO) {
                            await tx.agenda.update({
                                where: { id: agenda.id },
                                data: { 
                                    status: AGENDA_STATUS.CONFIRMADO,
                                    updatedAt: new Date()
                                }
                            })
                            cambiosAdicionales.agendaActualizada = true
                            console.log('✅ Agenda existente actualizada a CONFIRMADO')
                        }
                    } else {
                        // Crear nueva entrada en agenda como confirmada
                        await tx.agenda.create({
                            data: {
                                eventoId: evento.id,
                                fecha: evento.fecha_evento,
                                concepto: `Evento autorizado por pago - ${pagoActualizado.Cliente?.nombre || 'Cliente'}`,
                                status: AGENDA_STATUS.CONFIRMADO,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            }
                        })
                        cambiosAdicionales.agendaActualizada = true
                        console.log('✅ Evento NUEVO creado en agenda como CONFIRMADO')
                    }
                } else if (evento?.Agenda && evento.Agenda.length > 0) {
                    // 3d. Para eventos que ya no están en etapa "NUEVO", solo actualizar agenda si está pendiente
                    const agenda = evento.Agenda[0]
                    if (agenda.status === AGENDA_STATUS.PENDIENTE) {
                        await tx.agenda.update({
                            where: { id: agenda.id },
                            data: { 
                                status: AGENDA_STATUS.CONFIRMADO,
                                updatedAt: new Date()
                            }
                        })
                        cambiosAdicionales.agendaActualizada = true
                        console.log('✅ Agenda actualizada a CONFIRMADO')
                    }
                } else if (evento) {
                    // 3e. Si no existe agenda para cualquier evento, crear una confirmada
                    await tx.agenda.create({
                        data: {
                            eventoId: evento.id,
                            fecha: evento.fecha_evento,
                            concepto: `Evento - ${pagoActualizado.Cliente?.nombre || 'Cliente'}`,
                            status: AGENDA_STATUS.CONFIRMADO,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }
                    })
                    cambiosAdicionales.agendaActualizada = true
                    console.log('✅ Agenda creada como CONFIRMADO')
                }

                // 3f. Crear entrada en bitácora
                if (evento) {
                    let comentarioBitacora = `Pago SPEI autorizado por ${pagoActualizado.monto.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}. `
                    
                    const cambios = []
                    if (cambiosAdicionales.cotizacionActualizada) cambios.push('cotización aprobada')
                    if (cambiosAdicionales.eventoActualizado) cambios.push('evento aprobado')
                    if (cambiosAdicionales.eventoEtapaActualizada) cambios.push('movido a etapa APROBADO')
                    if (cambiosAdicionales.agendaActualizada) cambios.push('agenda confirmada')
                    
                    if (cambios.length > 0) {
                        comentarioBitacora += `Sistema aplicó autorización automática: ${cambios.join(', ')}.`
                    }

                    await tx.eventoBitacora.create({
                        data: {
                            eventoId: evento.id,
                            comentario: comentarioBitacora,
                            importancia: '2',
                            status: 'active',
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }
                    })
                    console.log('✅ Entrada de bitácora creada')
                }
            }

            return { pagoActualizado, cambiosAdicionales }
        })

        console.log('✅ Status de pago actualizado exitosamente:', {
            pagoId,
            nuevoStatus,
            cambiosAdicionales: resultado.cambiosAdicionales
        })

        // Revalidar las páginas relacionadas
        revalidatePath('/admin/dashboard/seguimiento')
        revalidatePath('/admin/dashboard/eventos')
        revalidatePath('/admin/dashboard/finanzas/pagos')
        if (resultado.pagoActualizado.Cotizacion?.Evento?.id) {
            const eventoId = resultado.pagoActualizado.Cotizacion.Evento.id
            revalidatePath(`/admin/dashboard/seguimiento/${eventoId}`)
            revalidatePath(`/admin/dashboard/eventos/${eventoId}`)
        }

        // Mensaje de éxito con detalles de cambios
        let mensaje = `Status de pago cambiado a ${nuevoStatus} exitosamente`
        const cambios = resultado.cambiosAdicionales
        
        if (cambios.cotizacionActualizada || cambios.eventoActualizado || cambios.eventoEtapaActualizada || cambios.agendaActualizada) {
            const detalles = []
            if (cambios.cotizacionActualizada) detalles.push('cotización aprobada')
            if (cambios.eventoActualizado) detalles.push('evento aprobado')
            if (cambios.eventoEtapaActualizada) detalles.push('movido a etapa APROBADO')
            if (cambios.agendaActualizada) detalles.push('agenda confirmada')
            
            mensaje += `. Autorización automática aplicada: ${detalles.join(', ')}`
        }

        return {
            success: true,
            data: resultado.pagoActualizado,
            message: mensaje,
            cambiosAdicionales: resultado.cambiosAdicionales
        }

    } catch (error) {
        console.error('❌ Error al cambiar status del pago:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido al cambiar status'
        }
    }
}
