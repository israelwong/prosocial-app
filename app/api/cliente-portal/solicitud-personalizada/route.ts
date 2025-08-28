import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/admin/_lib/prismaClient'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { eventoId, tipo, mensaje, metadata: metadataAdicional } = body

        // Validar datos requeridos
        if (!eventoId) {
            return NextResponse.json(
                { error: 'eventoId es requerido' },
                { status: 400 }
            )
        }

        // Obtener información del evento y cliente
        const evento = await prisma.evento.findUnique({
            where: { id: eventoId },
            include: {
                Cliente: true,
                EventoTipo: true
            }
        })

        if (!evento) {
            return NextResponse.json(
                { error: 'Evento no encontrado' },
                { status: 404 }
            )
        }

        // Crear notificación para el equipo administrativo
        const notificacion = await prisma.notificacion.create({
            data: {
                titulo: '📝 Solicitud de Paquete Personalizado',
                mensaje: `${evento.Cliente?.nombre || 'Cliente'} solicita cotización personalizada`,
                tipo: 'solicitud_personalizada',
                status: 'pendiente',
                metadata: {
                    eventoId: evento.id,
                    clienteId: evento.Cliente?.id,
                    clienteNombre: evento.Cliente?.nombre,
                    clienteEmail: evento.Cliente?.email,
                    clienteTelefono: evento.Cliente?.telefono,
                    eventoTipo: evento.EventoTipo?.nombre,
                    eventoFecha: evento.fecha_evento,
                    eventoSede: evento.sede,
                    tipoSolicitud: tipo || 'paquete_personalizado',
                    mensajePersonalizado: mensaje,
                    fechaSolicitud: new Date().toISOString(),
                    origen: 'vista_publica_paquetes',
                    // Información para el sistema de notificaciones
                    rutaDestino: metadataAdicional?.rutaDestino || `/admin/dashboard/seguimiento/${evento.id}`,
                    accionBitacora: metadataAdicional?.accionBitacora || {
                        habilitada: true,
                        mensaje: `📝 ${evento.Cliente?.nombre || 'Cliente'} solicitó cotización personalizada desde vista pública de paquetes`
                    }
                }
            }
        })

        console.log('🔔 Notificación de solicitud personalizada creada:', {
            notificacionId: notificacion.id,
            eventoId: evento.id,
            clienteNombre: evento.Cliente?.nombre,
            tipo: tipo
        })

        return NextResponse.json({
            success: true,
            message: 'Solicitud enviada exitosamente',
            notificacionId: notificacion.id
        })

    } catch (error) {
        console.error('❌ Error al procesar solicitud personalizada:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
