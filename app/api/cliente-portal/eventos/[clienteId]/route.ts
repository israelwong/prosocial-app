import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/admin/_lib/prismaClient';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clienteId: string }> }
) {
  try {
    const { clienteId } = await params;

    // Buscar eventos del cliente con cotizaciones aprobadas
        const eventos = await prisma.evento.findMany({
            where: {
                clienteId: clienteId,
                Cotizacion: {
                    some: {
                        status: {
                            in: ['aprobada', 'enviada']
                        }
                    }
                }
            },
            include: {
                Cotizacion: {
                    where: {
                        status: {
                            in: ['aprobada', 'enviada']
                        }
                    },
                    select: {
                        id: true,
                        status: true,
                        precio: true,
                        Pago: {
                            where: {
                                status: 'succeeded'
                            },
                            select: {
                                monto: true
                            }
                        }
                    },
                    take: 1
                }
            },
            orderBy: {
                fecha_evento: 'asc'
            }
        });

        // Transformar los datos para incluir total y pagado
        const eventosConPagos = eventos.map(evento => {
            const cotizacion = evento.Cotizacion?.[0];
            const totalPagado = cotizacion?.Pago?.reduce((sum: number, pago: any) => sum + pago.monto, 0) || 0;

            return {
                id: evento.id,
                nombre: evento.nombre,
                fecha_evento: evento.fecha_evento,
                hora_evento: evento.fecha_evento, // Temporal hasta que tengamos campo hora_evento
                numero_invitados: 0, // Temporal hasta que tengamos este campo
                lugar: evento.sede || evento.direccion || '',
                cotizacion: {
                    id: cotizacion?.id,
                    status: cotizacion?.status,
                    total: cotizacion?.precio || 0,
                    pagado: totalPagado
                }
            };
        });

        return NextResponse.json({
            success: true,
            eventos: eventosConPagos
        });

    } catch (error) {
        console.error('Error al obtener eventos:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error interno del servidor'
            },
            { status: 500 }
        );
    }
}
