import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/admin/_lib/prismaClient'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ cotizacionId: string }> }
) {
    try {
        const { cotizacionId } = await params

        const cotizacion = await prisma.cotizacion.findUnique({
            where: { id: cotizacionId },
            include: {
                Evento: {
                    include: {
                        Cliente: {
                            select: {
                                nombre: true,
                                email: true,
                                telefono: true
                            }
                        },
                        EventoTipo: {
                            select: {
                                id: true,
                                nombre: true
                            }
                        }
                    }
                },
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
            }
        })

        if (!cotizacion) {
            return NextResponse.json(
                { error: 'Cotización no encontrada' },
                { status: 404 }
            )
        }

        // Formatear respuesta
        const cotizacionFormateada = {
            id: cotizacion.id,
            nombre: cotizacion.nombre,
            precio: cotizacion.precio,
            servicios: cotizacion.Servicio,
            cliente: {
                nombre: cotizacion.Evento?.Cliente?.nombre || '',
                email: cotizacion.Evento?.Cliente?.email || '',
                telefono: cotizacion.Evento?.Cliente?.telefono || ''
            },
            evento: {
                id: cotizacion.Evento?.id || '',
                nombre: cotizacion.Evento?.nombre || '',
                eventoTipoId: cotizacion.Evento?.EventoTipo?.id || '',
                eventoTipo: cotizacion.Evento?.EventoTipo?.nombre || ''
            }
        }

        return NextResponse.json(cotizacionFormateada)

    } catch (error) {
        console.error('Error al obtener cotización:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
