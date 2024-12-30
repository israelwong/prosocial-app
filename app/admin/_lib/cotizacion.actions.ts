'use server'
import { PrismaClient } from '@prisma/client'
import { Cotizacion, CotizacionServicio } from './types'
const prisma = new PrismaClient()

export async function obtenerCotizacionesPorEvento(eventoId: string) {

    return await prisma.cotizacion.findMany({
        where: {
            eventoId
        }
        , orderBy: {
            createdAt: 'desc'
        }
    })
}

export async function obtenerCotizacion(cotizacionId: string) {
    return await prisma.cotizacion.findUnique({
        where: {
            id: cotizacionId
        }
    })
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

        return { success: true }
    } catch {
        return { error: 'Error creating cotizacion' }
    }
}

export async function actualizarCotizacion(data: Cotizacion) {

    try {
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
        })

        if (data.servicios) {
            await prisma.cotizacionServicio.deleteMany({
                where: {
                    cotizacionId: data.id
                }
            })

            for (const servicio of data.servicios) {
                await prisma.cotizacionServicio.create({
                    data: {
                        id: servicio.id,
                        cotizacionId: data.id ?? '',
                        servicioId: servicio.id ?? '',
                        cantidad: servicio.cantidad,
                        posicion: servicio.posicion,
                        servicioCategoriaId: servicio.servicioCategoriaId ?? '',
                    }
                })
            }
        }

        return { success: true }
    } catch (error: unknown) {
        if (error instanceof Error) {
            return { error: 'Error updating cotizacion ' + error.message }
        }
        return { error: 'Error updating cotizacion' }
    }
}

export async function eliminarCotizacion(cotizacionId: string) {

    try {
        await prisma.cotizacionServicio.deleteMany({
            where: {
                cotizacionId
            }
        })

        await prisma.cotizacion.delete({
            where: {
                id: cotizacionId
            }
        })

        return { success: true }
    } catch {
        return { error: 'Error deleting cotizacion' }
    }
}

export async function obtenerCotizacionServicios(cotizacionId: string) {
    return await prisma.cotizacionServicio.findMany({
        where: {
            cotizacionId
        }
    })
}

export async function actualizarCotizacionServicio(data: CotizacionServicio) {
    // try {
    //     await prisma.cotizacionServicio.update({
    //         where: {
    //             id: data.id
    //         },
    //         data: {
    //             cantidad: data.cantidad,
    //             posicion: data.posicion
    //         }
    //     })

    //     return { success: true }
    // } catch {
    //     return { error: 'Error updating cotizacion servicio' }
    // }
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

    if (!cliente) {
        return { error: 'Client not found' };
    }

    return {
        cotizacion,
        evento,
        eventoTipo,
        cliente
    }
}
