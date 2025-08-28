import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/admin/_lib/prismaClient'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        let { paqueteId, cotizacionId, eventoId, clienteId } = body

        console.log('📝 Nueva solicitud de paquete recibida:', {
            paqueteId,
            cotizacionId,
            eventoId,
            clienteId
        })

        // Validar datos requeridos - ahora cotizacionId es opcional si hay eventoId
        if (!paqueteId || !clienteId || (!cotizacionId && !eventoId)) {
            return NextResponse.json(
                { error: 'Datos requeridos: paqueteId, clienteId y (cotizacionId o eventoId)' },
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

        // Obtener información del evento y cliente
        let cotizacion = null
        let evento = null
        let cliente = null

        if (cotizacionId) {
            // Si hay cotizacionId, obtener por cotización
            cotizacion = await prisma.cotizacion.findUnique({
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

            evento = cotizacion.Evento
            cliente = cotizacion.Evento?.Cliente
        } else if (eventoId) {
            // Si no hay cotización pero sí eventoId, obtener por evento
            evento = await prisma.evento.findUnique({
                where: { id: eventoId },
                include: {
                    Cliente: true,
                    Cotizacion: {
                        orderBy: {
                            createdAt: 'desc'
                        },
                        take: 1
                    }
                }
            })

            if (!evento) {
                return NextResponse.json(
                    { error: 'Evento no encontrado' },
                    { status: 404 }
                )
            }

            cliente = evento.Cliente
            
            // Si el evento tiene cotizaciones, usar la más reciente
            if (evento.Cotizacion && evento.Cotizacion.length > 0) {
                cotizacionId = evento.Cotizacion[0].id
            } else {
                // Si no hay cotización, crear una básica para este evento
                const nuevaCotizacion = await prisma.cotizacion.create({
                    data: {
                        eventoId: evento.id,
                        eventoTipoId: evento.eventoTipoId || paquete.eventoTipoId,
                        nombre: `Cotización para ${evento.nombre}`,
                        precio: 0,
                        status: 'borrador'
                    }
                })
                cotizacionId = nuevaCotizacion.id
            }
        }

        if (!cliente) {
            return NextResponse.json(
                { error: 'Cliente no encontrado' },
                { status: 404 }
            )
        }

        // Asegurar que cotizacionId no sea undefined
        if (!cotizacionId) {
            console.error('❌ cotizacionId es undefined después del procesamiento')
            return NextResponse.json(
                { error: 'No se pudo obtener o crear cotización para el evento' },
                { status: 500 }
            )
        }

        console.log('✅ Datos validados:', {
            paqueteId,
            cotizacionId,
            eventoId,
            clienteNombre: cliente?.nombre,
            paqueteNombre: paquete.nombre
        })

        // Crear la solicitud de paquete
        const solicitud = await prisma.solicitudPaquete.create({
            data: {
                paqueteId: paqueteId,
                cotizacionId: cotizacionId, // Ahora validado que no sea undefined
                clienteNombre: cliente?.nombre || 'Cliente',
                clienteEmail: cliente?.email || clienteId,
                clienteTelefono: cliente?.telefono,
                mensaje: `Solicitud desde el comparador de paquetes`,
                // Datos del paquete (snapshot)
                paqueteNombre: paquete.nombre,
                precioPaquete: paquete.precio || 0,
                diferenciaPrecio: null, // Se calculará después si es necesario
                // Datos del evento
                eventoFecha: evento?.fecha_evento,
                eventoLugar: evento?.sede,
                estado: 'pendiente'
            }
        })

        console.log('✅ Solicitud de paquete creada:', solicitud.id)

        // Crear notificación para el administrador
        try {
            // Preparar metadata estructurada
            const metadata = {
                eventoId: evento?.id,
                paqueteId: paquete.id,
                clienteId: cliente?.id,
                paqueteNombre: paquete.nombre,
                clienteNombre: cliente?.nombre,
                rutaDestino: `/admin/dashboard/eventos/${evento?.id}`,
                accionBitacora: {
                    habilitada: true,
                    mensaje: `Cliente ${cliente?.nombre} solicitó el paquete: ${paquete.nombre}`
                }
            }

            // Ahora usar directamente prisma con las nuevas propiedades
            const notificacion = await prisma.notificacion.create({
                data: {
                    titulo: `Nueva solicitud de paquete: ${paquete.nombre}`,
                    mensaje: `${cliente?.nombre || 'Cliente'} ha solicitado el paquete "${paquete.nombre}" para ${paquete.EventoTipo?.nombre || 'su evento'}`,
                    tipo: 'solicitud_paquete',
                    metadata: metadata,
                    status: 'active',
                    cotizacionId: cotizacion?.id || null
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
