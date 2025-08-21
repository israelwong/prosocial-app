import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/admin/_lib/prismaClient';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ cotizacionId: string }> }
) {
    try {
        const { cotizacionId } = await params;

        // Buscar la cotización con el evento y cliente
        const cotizacion = await prisma.cotizacion.findUnique({
            where: {
                id: cotizacionId,
                status: 'aprobada' // Solo cotizaciones aprobadas pueden tener pagos
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
                        status: 'succeeded'
                    },
                    select: {
                        monto: true
                    }
                }
            }
        });

        if (!cotizacion) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Cotización no encontrada o no está aprobada'
                },
                { status: 404 }
            );
        }

        const totalPagado = cotizacion.Pago?.reduce((sum: number, pago: any) => sum + pago.monto, 0) || 0;

        const cotizacionPago = {
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
            cliente: cotizacion.Evento.Cliente
        };

        return NextResponse.json({
            success: true,
            cotizacion: cotizacionPago
        });

    } catch (error) {
        console.error('Error al obtener cotización para pago:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error interno del servidor'
            },
            { status: 500 }
        );
    }
}
