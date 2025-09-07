import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/admin/_lib/prismaClient'
import { AGENDA_STATUS, CLIENTE_STATUS, EVENTO_STATUS } from '@/app/admin/_lib/constants/status'

export async function POST(request: NextRequest) {
    try {
        const {
            fechaEvento,
            tipoEventoId,
            nombreEvento,
            sede,
            nombreCliente,
            telefono,
            email,
            canalAdquisicion,
            referencia
        } = await request.json()

        // Validar campos requeridos
        if (!fechaEvento || !tipoEventoId || !nombreEvento || !sede || !nombreCliente || !telefono || !email) {
            return NextResponse.json(
                { success: false, message: 'Todos los campos son requeridos' },
                { status: 400 }
            )
        }

        // Verificar nuevamente la disponibilidad de fecha usando las constantes correctas
        const fechaEventoDate = new Date(fechaEvento)
        const eventosEnFecha = await prisma.agenda.count({
            where: {
                fecha: {
                    gte: new Date(fechaEventoDate.setHours(0, 0, 0, 0)),
                    lt: new Date(fechaEventoDate.setHours(23, 59, 59, 999))
                },
                status: {
                    in: [AGENDA_STATUS.CONFIRMADO, AGENDA_STATUS.COMPLETADO]
                }
            }
        })

        if (eventosEnFecha > 0) {
            return NextResponse.json(
                { success: false, message: 'La fecha seleccionada ya no está disponible' },
                { status: 400 }
            )
        }

        // Validación inteligente de cliente existente
        let cliente = await prisma.cliente.findFirst({
            where: { telefono }
        })

        let clienteLog = {
            esClienteExistente: false,
            accionRealizada: '',
            emailCambiado: false,
            statusAnterior: null as string | null
        }

        if (!cliente) {
            // Cliente nuevo - crear normalmente
            // Obtener canal "Landing Page" o crear uno
            let canal = await prisma.canal.findFirst({
                where: { nombre: 'Landing Page' }
            })

            if (!canal) {
                canal = await prisma.canal.create({
                    data: {
                        nombre: 'Landing Page',
                        posicion: 1
                    }
                })
            }

            // Crear nuevo cliente
            cliente = await prisma.cliente.create({
                data: {
                    nombre: nombreCliente,
                    telefono,
                    email,
                    status: CLIENTE_STATUS.PROSPECTO,
                    canalId: canal.id
                }
            })

            clienteLog.accionRealizada = 'Cliente nuevo creado'
        } else {
            // Cliente existente - validación inteligente
            clienteLog.esClienteExistente = true
            clienteLog.statusAnterior = cliente.status

            // Verificar consistencia de datos
            const datosActualizados: any = {}

            // Actualizar nombre si es diferente (posible mejora de datos)
            if (nombreCliente !== cliente.nombre) {
                datosActualizados.nombre = nombreCliente
                clienteLog.accionRealizada += 'Nombre actualizado. '
            }

            // Manejar email de forma inteligente
            if (email && email !== cliente.email) {
                if (!cliente.email) {
                    // El cliente no tenía email, agregamos el nuevo
                    datosActualizados.email = email
                    clienteLog.accionRealizada += 'Email agregado. '
                } else if (cliente.email !== email) {
                    // El cliente tenía un email diferente - posible error o cambio legítimo
                    // Por seguridad, mantenemos el original pero loggeamos la discrepancia
                    console.log(`⚠️ Cliente ${cliente.id} intentó cambiar email de ${cliente.email} a ${email}`)
                    clienteLog.emailCambiado = true
                    clienteLog.accionRealizada += 'Discrepancia de email detectada. '
                }
            }

            // Actualizar status a prospecto si estaba en otro estado (reactivación)
            if (cliente.status !== CLIENTE_STATUS.PROSPECTO) {
                datosActualizados.status = CLIENTE_STATUS.PROSPECTO
                clienteLog.accionRealizada += `Status cambiado de ${cliente.status} a prospecto. `
            }

            // Aplicar actualizaciones si hay cambios
            if (Object.keys(datosActualizados).length > 0) {
                await prisma.cliente.update({
                    where: { id: cliente.id },
                    data: datosActualizados
                })
            }

            if (!clienteLog.accionRealizada) {
                clienteLog.accionRealizada = 'Cliente existente reutilizado sin cambios'
            }
        }

        // Obtener la etapa "Nuevo" o la primera etapa disponible
        const etapaNuevo = await prisma.eventoEtapa.findFirst({
            where: { nombre: 'Nuevo' },
            orderBy: { posicion: 'asc' }
        }) || await prisma.eventoEtapa.findFirst({
            orderBy: { posicion: 'asc' }
        })

        // Crear el evento
        const evento = await prisma.evento.create({
            data: {
                clienteId: cliente.id,
                eventoTipoId: tipoEventoId,
                nombre: nombreEvento,
                fecha_evento: new Date(fechaEvento),
                sede,
                status: EVENTO_STATUS.PENDIENTE,
                eventoEtapaId: etapaNuevo?.id || null,
                // Campos adicionales para tracking
                updatedAt: new Date()
            }
        })

        // Crear entrada en agenda con status pendiente
        await prisma.agenda.create({
            data: {
                eventoId: evento.id,
                fecha: new Date(fechaEvento),
                status: AGENDA_STATUS.PENDIENTE,
                descripcion: `${nombreEvento} - Evento desde landing page (${referencia || 'directo'})`,
                direccion: sede
            }
        })

        // Crear entrada en bitácora con información de validación
        const comentarioBitacora = [
            `Cliente contactó desde landing page${referencia ? ` (ref: ${referencia})` : ''}.`,
            `Interesado en ${nombreEvento} para el ${new Date(fechaEvento).toLocaleDateString()}.`,
            clienteLog.esClienteExistente
                ? `📋 Cliente existente: ${clienteLog.accionRealizada}`
                : `🆕 Cliente nuevo creado.`
        ].join(' ')

        await prisma.eventoBitacora.create({
            data: {
                eventoId: evento.id,
                comentario: comentarioBitacora,
                importancia: clienteLog.emailCambiado ? 'alta' : 'media',
                status: 'active'
            }
        })

        // Log adicional para casos que requieren atención
        if (clienteLog.emailCambiado) {
            console.log(`🔍 Validación requerida - Cliente ${cliente.id} (${telefono}) con discrepancia de email`)
        }

        return NextResponse.json({
            success: true,
            eventoId: evento.id,
            clienteExistente: clienteLog.esClienteExistente,
            message: 'Evento creado exitosamente'
        })

    } catch (error) {
        console.error('Error creando evento desde landing:', error)
        return NextResponse.json(
            { success: false, message: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
