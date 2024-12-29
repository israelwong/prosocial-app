'use server';
import { PrismaClient } from "@prisma/client";
import { Pago } from "@/app/admin/_lib/types";

const prisma = new PrismaClient();

export default async function obtenerPagos() {
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

export async function crearPago(data: Pago) {
    const pago = await prisma.pago.create({
        data: {
            cotizacionId: data.cotizacionId,
            clienteId: data.clienteId,
            condicionesComercialesId: data.condicionesComercialesId,
            condicionesComercialesMetodoPagoId: data.condicionesComercialesMetodoPagoId,
            metodo_pago: data.metodo_pago,
            monto: data.monto ?? 0,
            concepto: data.concepto,
            descripcion: data.descripcion,
            stripe_payment_id: data.stripe_payment_id ?? undefined,
            status: data.status ?? undefined
        }
    });
    return pago;
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
            status: 'Paid'
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

