'use server';
import { Pago } from "@/app/admin/_lib/types";
import prisma from './prismaClient';

export async function obtenerPagos() {
    const pagos = await prisma.pago.findMany();
    return pagos;
}

export async function obtenerPago(id: string) {
    const pago = await prisma.pago.findUnique({
        where: {
            id: id
        }
    });
    return pago;
}

export async function obtenerPagosCotizacion(cotizacionId: string) {
    const pagos = await prisma.pago.findMany({
        where: {
            cotizacionId: cotizacionId
        },
        orderBy: {
            createdAt: 'asc'
        }
    });
    return pagos;
}

export async function crearPago(data: Pago) {
    try {
        const pago = await prisma.pago.create({
            data: {
                cotizacionId: data.cotizacionId,
                clienteId: data.clienteId,
                condicionesComercialesId: data.condicionesComercialesId ?? null,
                condicionesComercialesMetodoPagoId: data.condicionesComercialesMetodoPagoId ?? null,
                metodoPagoId: data.metodoPagoId ?? undefined,
                metodo_pago: data.metodo_pago,
                monto: data.monto ?? 0,
                concepto: data.concepto,
                descripcion: data.descripcion ?? undefined,
                stripe_payment_id: data.stripe_payment_id ?? undefined,
                status: data.status ?? 'pending',
            }
        });
        return { id: pago.id, success: true, pago };
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(error);
        }
        return { success: false, error: (error as Error).message };
    }
}

export async function eliminarPago(id: string) {
    try {
        await prisma.pago.delete({
            where: {
                id: id
            }
        });
        return { success: true };
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(error);
        }
        return { success: false, error: (error as Error).message };
    }
}

export async function actualizarPago(data: Pago) {
    try {
        const pago = await prisma.pago.update({
            where: {
                id: data.id
            },
            data: {
                metodoPagoId: data.metodoPagoId ?? undefined,
                condicionesComercialesMetodoPagoId: data.condicionesComercialesMetodoPagoId ?? null,
                metodo_pago: data.metodo_pago,
                monto: data.monto ?? 0,
                concepto: data.concepto,
                stripe_payment_id: data.stripe_payment_id ?? undefined,
                status: data.status ?? 'pending',
            }
        });
        return { success: true, pago };
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(error);
        }
        return { success: false, error: (error as Error).message };
    }
}

export async function obtenerPagoSesionStripe(stripe_session_id: string) {
    const pago = await prisma.pago.findUnique({
        where: {
            stripe_session_id
        }
    });

    const cliente = await prisma.cliente.findUnique({
        where: {
            id: pago?.clienteId ?? undefined
        }
    });

    return { pago, cliente };
}

export async function obtenerDetallesPago(pagoId: string) {
    const pago = await prisma.pago.findUnique({
        where: {
            id: pagoId
        }
    });

    const pagosCotizacion = await prisma.pago.findMany({
        where: {
            cotizacionId: pago?.cotizacionId ?? undefined,
            status: 'paid'
        }
    });

    const cliente = await prisma.cliente.findUnique({
        where: {
            id: pago?.clienteId ?? undefined
        }
    });

    const cotizacion = await prisma.cotizacion.findUnique({
        where: {
            id: pago?.cotizacionId ?? undefined
        }
    });

    const evento = await prisma.evento.findUnique({
        where: {
            id: cotizacion?.eventoId ?? undefined
        }
    });


    const detallesPago = { pago, pagosCotizacion, cotizacion, evento, cliente };
    return detallesPago;
}

export async function obtenerBalancePagosEvento(eventoId: string) {

    // const evento = await prisma.evento.findUnique({
    //     where: {
    //         id: eventoId,
    //         status: 'aprobado'
    //     }
    // })

    const cotizacion = await prisma.cotizacion.findFirst({
        where: {
            eventoId,
            status: 'aprobada'
        }
    });

    const pagos = await prisma.pago.findMany({
        where: {
            cotizacionId: cotizacion?.id
        }
    });

    const totalPagado = pagos.reduce((acc, pago) => {
        return acc + pago.monto;
    }, 0);

    const precio = cotizacion?.precio ?? 0;

    const balance = cotizacion && precio !== undefined ? precio - totalPagado : undefined;

    return { precio, totalPagado, balance };

}

export async function ontenerDetallesPago(pagoId: string) {
    const pago = await prisma.pago.findUnique({
        where: {
            id: pagoId
        }
    });

    const cliente = await prisma.cliente.findUnique({
        where: {
            id: pago?.clienteId ?? undefined
        }
    });

    const cotizacion = await prisma.cotizacion.findUnique({
        where: {
            id: pago?.cotizacionId ?? undefined
        }
    });

    const evento = await prisma.evento.findUnique({
        where: {
            id: cotizacion?.eventoId ?? undefined
        }
    });

    const detallesPago = {
        pago,
        cliente,
        cotizacion,
        evento
    };
    return detallesPago;
}