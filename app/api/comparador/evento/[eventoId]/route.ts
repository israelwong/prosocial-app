import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
    request: Request,
    { params }: { params: Promise<{ eventoId: string }> }
) {
    try {
        const { eventoId } = await params

        // Obtener evento básico
        const evento = await prisma.evento.findUnique({
            where: { id: eventoId },
            include: {
                Cliente: true,
                EventoTipo: true
            }
        }) as any

        if (!evento) {
            return NextResponse.json(
                { error: 'Evento no encontrado' },
                { status: 404 }
            )
        }

        // Obtener cotizaciones por separado
        const cotizaciones = await prisma.cotizacion.findMany({
            where: {
                eventoId: eventoId,
                status: {
                    in: ['pendiente', 'aprobada', 'en_revision']
                }
            },
            include: {
                Servicio: {
                    include: {
                        Servicio: {
                            include: {
                                ServicioCategoria: {
                                    include: {
                                        seccionCategoria: {
                                            include: {
                                                Seccion: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        }) as any

        // Formatear las cotizaciones para el comparador
        const cotizacionesFormateadas = cotizaciones.map((cotizacion: any) => ({
            id: cotizacion.id,
            nombre: cotizacion.nombre,
            precio: cotizacion.precio || 0,
            servicios: cotizacion.Servicio.map((servicio: any) => ({
                id: servicio.id,
                cantidad: servicio.cantidad,
                Servicio: servicio.Servicio
            })),
            cliente: {
                nombre: evento.Cliente?.nombre || '',
                email: evento.Cliente?.email || '',
                telefono: evento.Cliente?.telefono || null
            },
            evento: {
                id: evento.id,
                nombre: evento.nombre,
                eventoTipo: {
                    id: evento.EventoTipo?.id || '',
                    nombre: evento.EventoTipo?.nombre || ''
                }
            }
        }))

        const response = {
            id: evento.id,
            nombre: evento.nombre,
            eventoTipoId: evento.eventoTipoId,
            eventoTipo: evento.EventoTipo,
            cliente: evento.Cliente,
            cotizaciones: cotizacionesFormateadas
        }

        return NextResponse.json(response)

    } catch (error) {
        console.error('Error al obtener datos del evento:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
