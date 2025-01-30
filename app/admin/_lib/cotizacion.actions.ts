'use server'
import { Cotizacion } from './types'
import prisma from './prismaClient';

export async function obtenerCotizacionesPorEvento(eventoId: string) {

    const cotizaciones = await prisma.cotizacion.findMany({
        where: {
            eventoId,
        },
        orderBy: {
            createdAt: 'asc'
        }
    });

    const cotizacionesWithVisitaCount = await Promise.all(cotizaciones.map(async (cotizacion) => {
        const visitas = await prisma.cotizacionVisita.count({
            where: {
                cotizacionId: cotizacion.id
            }
        });
        return {
            ...cotizacion,
            visitas
        };
    }));

    return cotizacionesWithVisitaCount;
}

export async function obtenerCotizacion(cotizacionId: string) {
    const cotizacion = await prisma.cotizacion.findUnique({
        where: {
            id: cotizacionId
        }
    });

    const eventoTipo = await prisma.eventoTipo.findUnique({
        where: {
            id: cotizacion?.eventoTipoId
        },
        select: {
            nombre: true
        }
    });

    if (!cotizacion) {
        return null;
    }

    const visitas = await prisma.cotizacionVisita.count({
        where: {
            cotizacionId: cotizacion.id
        }
    });

    return {
        ...cotizacion,
        eventoTipo,
        visitas
    };
}

export async function crearCotizacion(data: Cotizacion) {

    try {
        const response = await prisma.cotizacion.create({
            data: {
                eventoTipoId: data.eventoTipoId,
                eventoId: data.eventoId,
                nombre: data.nombre,
                precio: data.precio,
                condicionesComercialesId: data.condicionesComercialesId,
                condicionesComercialesMetodoPagoId: data.condicionesComercialesMetodoPagoId,
                status: 'pendiente',
            }
        })

        if (response.id) {
            if (data.servicios) {
                for (const servicio of data.servicios) {
                    await prisma.cotizacionServicio.create({
                        data: {
                            cotizacionId: response.id!,
                            servicioId: servicio.id ?? '',
                            cantidad: servicio.cantidad,
                            posicion: servicio.posicion,
                            servicioCategoriaId: servicio.servicioCategoriaId ?? '',
                        }
                    })
                }
            }
        }

        return { success: true, cotizacionId: response.id };
    } catch {
        return { error: 'Error creating cotizacion' }
    }
}

export async function crearCotizacionAutorizada(data: Cotizacion) {

    try {
        const response = await prisma.cotizacion.create({
            data: {
                eventoTipoId: data.eventoTipoId,
                eventoId: data.eventoId,
                nombre: data.nombre,
                precio: data.precio,
                condicionesComercialesId: data.condicionesComercialesId,
                condicionesComercialesMetodoPagoId: data.condicionesComercialesMetodoPagoId,
                status: 'aprobada',
            }
        })

        if (response.id) {
            if (data.servicios) {
                for (const servicio of data.servicios) {
                    await prisma.cotizacionServicio.create({
                        data: {
                            cotizacionId: response.id!,
                            servicioId: servicio.id ?? '',
                            cantidad: servicio.cantidad,
                            posicion: servicio.posicion,
                            servicioCategoriaId: servicio.servicioCategoriaId ?? '',
                        }
                    })
                }
            }
        }

        return { success: true, cotizacionId: response.id };
    } catch {
        return { error: 'Error creating cotizacion' }
    }
}

//! Actualizar cotización
export async function actualizarCotizacion(data: Cotizacion) {

    try {
        // console.log('Updating cotizacion with id:', data.id);
        await prisma.cotizacion.update({
            where: {
                id: data.id
            },
            data: {
                eventoTipoId: data.eventoTipoId,
                eventoId: data.eventoId,
                nombre: data.nombre,
                precio: data.precio,
                condicionesComercialesId: data.condicionesComercialesId || null,
                condicionesComercialesMetodoPagoId: data.condicionesComercialesMetodoPagoId || null,
                status: data.status,
            }
        });
        // console.log('Cotizacion updated successfully');

        if (data.servicios) {
            // console.log('Deleting existing cotizacionServicios for cotizacionId:', data.id);
            await prisma.cotizacionServicio.deleteMany({
                where: {
                    cotizacionId: data.id
                }
            });

            // console.log('Creating new cotizacionServicios');
            for (const servicio of data.servicios) {
                try {
                    await prisma.cotizacionServicio.create({
                        data: {
                            cotizacionId: data.id ?? '',
                            servicioId: servicio.id ?? '',
                            cantidad: servicio.cantidad,
                            posicion: servicio.posicion,
                            servicioCategoriaId: servicio.servicioCategoriaId ?? '',
                            userId: servicio.userId || undefined
                        }
                    });
                    // console.log('Created cotizacionServicio for servicioId:', servicio.id);
                } catch (error: unknown) {
                    if (error instanceof Error) {
                        console.error('Error creating cotizacionServicio for servicioId:', servicio.id, error.message);
                    } else {
                        console.error('Unknown error creating cotizacionServicio for servicioId:', servicio.id);
                    }
                }
            }
        }

        return { success: true };
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error updating cotizacion:', error.message);
            return { error: 'Error updating cotizacion ' + error.message };
        }
        console.error('Unknown error updating cotizacion');
        return { error: 'Error updating cotizacion' };
    }
}

export async function actualizarCotizacionStatus(cotizacionId: string, status: string) {
    try {
        await prisma.cotizacion.update({
            where: {
                id: cotizacionId
            },
            data: {
                status
            }
        });
        return { success: true };
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error updating cotizacion status:', error.message);
            return { error: 'Error updating cotizacion status ' + error.message };
        }
        console.error('Unknown error updating cotizacion status');
        return { error: 'Error updating cotizacion status' };
    }
}

export async function eliminarCotizacion(cotizacionId: string) {

    try {
        console.log('Deleting cotizacionServicios for cotizacionId:', cotizacionId);
        await prisma.cotizacionServicio.deleteMany({
            where: {
                cotizacionId
            }
        });

        console.log('Deleting cotizacionVisitas for cotizacionId:', cotizacionId);
        await prisma.cotizacionVisita.deleteMany({
            where: {
                cotizacionId
            }
        });

        console.log('Deleting pagos for cotizacionId:', cotizacionId);
        await prisma.pago.deleteMany({
            where: {
                cotizacionId
            }
        });

        console.log('Deleting cotizacion with id:', cotizacionId);
        await prisma.cotizacion.delete({
            where: {
                id: cotizacionId
            }
        });

        return { success: true }
    } catch {
        return { error: 'Error deleting cotizacion' }
    }
}

export async function obtenerCotizacionServicios(cotizacionId: string) {
    return await prisma.cotizacionServicio.findMany({
        where: {
            cotizacionId
        },
        orderBy: {
            posicion: 'asc'
        }
    })
}

export async function obtenerCotizacionServicio(cotizacionServicioId: string) {
    return await prisma.cotizacionServicio.findUnique({
        where: {
            id: cotizacionServicioId
        }
    })
}

export async function asignarResponsableCotizacionServicio(userid: string, cotizacionServicioId: string, userId: string) {
    try {
        await prisma.cotizacionServicio.update({
            where: {
                id: cotizacionServicioId
            },
            data: {
                userId
            }
        })
        return { success: true }
    } catch {
        return { error: 'Error assigning responsable' }
    }
}

export async function cotizacionDetalle(id: string) {

    const cotizacion = await prisma.cotizacion.findUnique({
        where: { id },
        select: {
            eventoId: true,
            eventoTipoId: true,
            nombre: true,
            precio: true,
            condicionesComercialesId: true,
            condicionesComercialesMetodoPagoId: true,
            status: true,
            expiresAt: true,
        }
    });

    const evento = await prisma.evento.findUnique({
        where: { id: cotizacion?.eventoId },
        select: {
            id: true,
            clienteId: true,
            eventoTipoId: true,
            nombre: true,
            fecha_evento: true
        }
    });

    if (!evento) {
        return { error: 'Event not found' };
    }

    const eventoTipo = evento.eventoTipoId ? await prisma.eventoTipo.findUnique({
        where: { id: evento.eventoTipoId },
        select: { nombre: true }
    }) : null;

    const cliente = await prisma.cliente.findUnique({
        where: { id: evento.clienteId },
        select: { id: true, nombre: true, email: true, telefono: true }
    });

    const cotizacionServicio = await prisma.cotizacionServicio.findMany({
        where: { cotizacionId: id },
        select: {
            id: true,
            servicioId: true,
            cantidad: true,
            posicion: true,
            servicioCategoriaId: true,
        }
    });

    const ServicioCategoria = await prisma.servicioCategoria.findMany({
        orderBy: {
            posicion: 'asc'
        }
    });

    const servicios = await prisma.servicio.findMany({
        select: {
            id: true,
            nombre: true,
            precio_publico: true,
            servicioCategoriaId: true
        }
    });

    const configuracion = await prisma.configuracion.findFirst({
        where: {
            status: 'active'
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    const condicionesComerciales = await prisma.condicionesComerciales.findMany({
        where: {
            status: 'active'
        },
        orderBy: {
            orden: 'asc'
        }
    })

    return {
        cotizacion,
        evento,
        eventoTipo,
        cliente,
        servicios,
        ServicioCategoria,
        cotizacionServicio,
        configuracion,
        condicionesComerciales

    };
}

export async function clonarCotizacion(cotizacionId: string) {
    const cotizacion = await prisma.cotizacion.findUnique({
        where: { id: cotizacionId }
    });

    if (!cotizacion) {
        return { error: 'Cotizacion not found' };
    }

    const cotizacionServicios = await prisma.cotizacionServicio.findMany({
        where: { cotizacionId }
    });

    const existingCotizaciones = await prisma.cotizacion.findMany({
        where: {
            nombre: {
                startsWith: cotizacion.nombre
            }
        }
    });

    const copyNumber = existingCotizaciones.length + 1;
    const newCotizacionNombre = `${cotizacion.nombre} - (copia ${copyNumber})`;

    const newCotizacion = await prisma.cotizacion.create({
        data: {
            eventoId: cotizacion.eventoId,
            eventoTipoId: cotizacion.eventoTipoId,
            nombre: newCotizacionNombre,
            precio: cotizacion.precio,
            status: 'pendiente',
        }
    });

    for (const cotizacionServicio of cotizacionServicios) {
        await prisma.cotizacionServicio.create({
            data: {
                cotizacionId: newCotizacion.id,
                servicioId: cotizacionServicio.servicioId,
                cantidad: cotizacionServicio.cantidad,
                posicion: cotizacionServicio.posicion,
                servicioCategoriaId: cotizacionServicio.servicioCategoriaId,
            }
        });
    }

    return {
        success: true, cotizacionId: newCotizacion.id
    };
}