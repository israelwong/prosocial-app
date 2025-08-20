import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/admin/_lib/prismaClient';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventoId: string } }
) {
  try {
    const eventoId = params.eventoId;

    // Buscar el evento con sus servicios y pagos
    const evento = await prisma.evento.findUnique({
      where: {
        id: eventoId
      },
      include: {
        Cotizacion: {
          where: {
            status: {
              in: ['aprobada', 'enviada']
            }
          },
          include: {
            Servicio: {
              include: {
                Servicio: {
                  select: {
                    nombre: true
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
          },
          take: 1
        }
      }
    });

    if (!evento || !evento.Cotizacion[0]) {
      return NextResponse.json(
        {
          success: false,
          message: 'Evento no encontrado'
        },
        { status: 404 }
      );
    }

    const cotizacion = evento.Cotizacion[0];
    const totalPagado = cotizacion.Pago?.reduce((sum: number, pago: any) => sum + pago.monto, 0) || 0;

    // Mapear servicios
    const servicios = cotizacion.Servicio.map(servicioCotizacion => ({
      id: servicioCotizacion.id,
      nombre: servicioCotizacion.Servicio?.nombre || 'Servicio',
      cantidad: servicioCotizacion.cantidad || 1,
      precio_unitario: servicioCotizacion.precioUnitario || 0,
      subtotal: servicioCotizacion.subtotal || 0
    }));

    const eventoDetalle = {
      id: evento.id,
      nombre: evento.nombre,
      fecha_evento: evento.fecha_evento,
      hora_evento: evento.fecha_evento, // Temporal hasta que tengamos campo hora_evento
      numero_invitados: 0, // Temporal hasta que tengamos este campo
      lugar: evento.sede || evento.direccion || '',
      cotizacion: {
        id: cotizacion.id,
        status: cotizacion.status,
        total: cotizacion.precio,
        pagado: totalPagado,
        descripcion: cotizacion.descripcion,
        servicios
      }
    };

    return NextResponse.json({
      success: true,
      evento: eventoDetalle
    });

  } catch (error) {
    console.error('Error al obtener evento:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}
