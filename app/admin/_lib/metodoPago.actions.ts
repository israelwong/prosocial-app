'use server'
import { PrismaClient } from "@prisma/client"
import { MetodoPago } from "./types"

const prisma = new PrismaClient()

export async function obtenerMetodosPago() {
    return await prisma.metodoPago.findMany({
        orderBy: {
            orden: 'asc'
        }
    })
}

export async function obtenerMetodoPago(id: string) {
    return await prisma.metodoPago.findFirst({
        where: {
            id,
            status: 'active'
        }
    })
}

export async function crearMetodoPago(metodo: MetodoPago) {

    await prisma.metodoPago.create({
        data: {
            metodo_pago: metodo.metodo_pago ?? '',
            comision_porcentaje_base: metodo.comision_porcentaje_base,
            comision_fija_monto: metodo.comision_fija_monto,
            num_msi: metodo.num_msi,
            comision_msi_porcentaje: metodo.comision_msi_porcentaje
        }
    })
    return { success: true }
}

export async function actualizarMetodoPago(metodo: MetodoPago) {
    return await prisma.metodoPago.update({
        where: { id: metodo.id },
        data: {
            metodo_pago: metodo.metodo_pago,
            comision_porcentaje_base: metodo.comision_porcentaje_base,
            comision_fija_monto: metodo.comision_fija_monto,
            num_msi: metodo.num_msi,
            comision_msi_porcentaje: metodo.comision_msi_porcentaje
        }
    })
}

export async function eliminarMetodoPago(id: string) {
    return await prisma.metodoPago.delete({ where: { id } })
}

export async function actualizarStatusMetodoPago(id: string, status: string) {
    return await prisma.metodoPago.update({ where: { id }, data: { status } })
}