import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/admin/_lib/prismaClient'

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

    // Verificar nuevamente la disponibilidad de fecha
    const fechaEventoDate = new Date(fechaEvento)
    const eventosEnFecha = await prisma.agenda.count({
      where: {
        fecha: {
          gte: new Date(fechaEventoDate.setHours(0, 0, 0, 0)),
          lt: new Date(fechaEventoDate.setHours(23, 59, 59, 999))
        },
        status: 'confirmada'
      }
    })

    if (eventosEnFecha > 0) {
      return NextResponse.json(
        { success: false, message: 'La fecha seleccionada ya no está disponible' },
        { status: 400 }
      )
    }

    // Crear o buscar cliente existente por teléfono
    let cliente = await prisma.cliente.findFirst({
      where: { telefono }
    })

    if (!cliente) {
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
          status: 'prospecto',
          canalId: canal.id
        }
      })
    } else {
      // Actualizar datos del cliente existente si es necesario
      await prisma.cliente.update({
        where: { id: cliente.id },
        data: {
          email: email || cliente.email,
          status: 'prospecto' // Actualizar a prospecto si estaba en otro estado
        }
      })
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
        status: 'nuevo',
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
        status: 'pendiente',
        descripcion: `${nombreEvento} - Evento desde landing page (${referencia || 'directo'})`,
        direccion: sede
      }
    })

    // Crear entrada en bitácora
    await prisma.eventoBitacora.create({
      data: {
        eventoId: evento.id,
        comentario: `Cliente contactó desde landing page${referencia ? ` (ref: ${referencia})` : ''}. Interesado en ${nombreEvento} para el ${new Date(fechaEvento).toLocaleDateString()}.`,
        importancia: 'alta',
        status: 'active'
      }
    })

    return NextResponse.json({
      success: true,
      eventoId: evento.id,
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
