import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/admin/_lib/prismaClient';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ eventoId: string }> }
) {
    try {
        const { eventoId } = await params;

        // Buscar el evento con estructura completa similar al admin
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
                                },
                                ServicioCategoria: {
                                    include: {
                                        seccionCategoria: {
                                            include: {
                                                Seccion: true
                                            }
                                        }
                                    }
                                }
                            },
                            // 🔧 ORDENAMIENTO CORREGIDO: Usar posición del Servicio original, NO de CotizacionServicio
                            orderBy: [
                                { Servicio: { posicion: 'asc' } },     // Posición del servicio original en el catálogo
                                { posicion: 'asc' }                    // Fallback: posición en cotización
                            ]
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

        // Mapear servicios con información completa de categoría y sección
        const servicios = cotizacion.Servicio.map(cotizacionServicio => {
            // Usar primero los snapshots, luego los datos relacionados como fallback
            const nombreServicio = cotizacionServicio.nombre_snapshot && cotizacionServicio.nombre_snapshot !== 'Servicio migrado'
                ? cotizacionServicio.nombre_snapshot
                : cotizacionServicio.Servicio?.nombre || 'Servicio sin nombre'

            // Obtener categoría usando relaciones correctas
            const categoriaNombre = cotizacionServicio.categoria_nombre_snapshot ||
                cotizacionServicio.Servicio?.ServicioCategoria?.nombre ||
                cotizacionServicio.ServicioCategoria?.nombre ||
                'Sin categoría'

            // Obtener sección usando relaciones correctas
            const seccionNombre = cotizacionServicio.seccion_nombre_snapshot ||
                cotizacionServicio.Servicio?.ServicioCategoria?.seccionCategoria?.Seccion?.nombre ||
                cotizacionServicio.ServicioCategoria?.seccionCategoria?.Seccion?.nombre ||
                'Servicios Generales'

            // Obtener posiciones para ordenamiento
            const seccionPosicion = cotizacionServicio.Servicio?.ServicioCategoria?.seccionCategoria?.Seccion?.posicion ||
                cotizacionServicio.ServicioCategoria?.seccionCategoria?.Seccion?.posicion || 0

            const categoriaPosicion = cotizacionServicio.Servicio?.ServicioCategoria?.posicion ||
                cotizacionServicio.ServicioCategoria?.posicion || 0

            return {
                id: cotizacionServicio.id,
                nombre: nombreServicio,
                cantidad: cotizacionServicio.cantidad || 1,
                precio_unitario: cotizacionServicio.precio_unitario_snapshot || cotizacionServicio.precioUnitario || 0,
                subtotal: cotizacionServicio.subtotal || 0,
                seccion: seccionNombre,
                categoria: categoriaNombre,
                seccionPosicion,
                categoriaPosicion,
                posicion: cotizacionServicio.posicion || 0
            }
        });

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
