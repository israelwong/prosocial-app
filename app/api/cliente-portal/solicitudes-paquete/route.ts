import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/admin/_lib/prismaClient'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { paqueteId, cotizacionId, clienteId } = body

        console.log('📝 Nueva solicitud de paquete recibida:', {
            paqueteId,
            cotizacionId,
            clienteId
        })

        // Validar datos requeridos
        if (!paqueteId || !cotizacionId || !clienteId) {
            return NextResponse.json(
                { error: 'Datos requeridos: paqueteId, cotizacionId, clienteId' },
                { status: 400 }
            )
        }

        // Obtener información del paquete
        const paquete = await prisma.paquete.findUnique({
            where: { id: paqueteId },
            include: {
                EventoTipo: true
            }
        })

        if (!paquete) {
            return NextResponse.json(
                { error: 'Paquete no encontrado' },
                { status: 404 }
            )
        }

        // Obtener información de la cotización y cliente
        const cotizacion = await prisma.cotizacion.findUnique({
            where: { id: cotizacionId },
            include: {
                Evento: {
                    include: {
                        Cliente: true
                    }
                }
            }
        })

        if (!cotizacion) {
            return NextResponse.json(
                { error: 'Cotización no encontrada' },
                { status: 404 }
            )
        }

        // Crear la solicitud de paquete
        const solicitud = await prisma.solicitudPaquete.create({
            data: {
                paqueteId: paqueteId,
                cotizacionId: cotizacionId,
                clienteNombre: cotizacion.Evento?.Cliente?.nombre || 'Cliente',
                clienteEmail: cotizacion.Evento?.Cliente?.email || clienteId,
                clienteTelefono: cotizacion.Evento?.Cliente?.telefono,
                mensaje: `Solicitud desde el comparador de paquetes`,
                paqueteNombre: paquete.nombre,
                precioPaquete: paquete.precio || 0,
                diferenciaPrecio: (paquete.precio || 0) - (cotizacion.precio || 0),
                eventoFecha: cotizacion.Evento?.fecha_evento,
                eventoLugar: cotizacion.Evento?.sede,
                estado: 'pendiente',
                fechaSolicitud: new Date()
            }
        })

        console.log('✅ Solicitud de paquete creada:', solicitud.id)

        // Crear notificación para el administrador
        try {
            const notificacion = await prisma.notificacion.create({
                data: {
                    titulo: `Nueva solicitud de paquete: ${paquete.nombre}`,
                    mensaje: `${cotizacion.Evento?.Cliente?.nombre || 'Cliente'} ha solicitado información sobre el paquete "${paquete.nombre}" para ${paquete.EventoTipo?.nombre || 'su evento'}`,
                    status: 'active',
                    cotizacionId: cotizacion.id
                }
            })

            console.log('🔔 Notificación creada para administrador:', notificacion.id)
        } catch (notifError) {
            console.error('⚠️ Error al crear notificación:', notifError)
            // No fallar la solicitud si hay error en la notificación
        }

        return NextResponse.json({
            success: true,
            message: 'Solicitud de paquete enviada correctamente',
            solicitudId: solicitud.id
        })

    } catch (error) {
        console.error('❌ Error al procesar solicitud de paquete:', error)
        return NextResponse.json(
            {
                error: 'Error interno del servidor',
                details: error instanceof Error ? error.message : 'Error desconocido'
            },
            { status: 500 }
        )
    }
}
