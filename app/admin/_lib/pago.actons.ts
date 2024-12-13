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
            condicionesComercialesId: data.condicionesComercialesId,
            condicionesComercialesMetodoPagoId: data.condicionesComercialesMetodoPagoId,
            metodo_pago: data.metodo_pago,
            monto: data.monto,
            concepto: data.concepto,
            descripcion: data.descripcion,
            stripe_payment_id: data.stripe_payment_id,
            status: data.status
        }
    });
    return pago;
}


