'use server'
import { MetodoPago } from "./types"

// import { PrismaClient } from "@prisma/client"
// const prisma = new PrismaClient()
import prisma from './prismaClient';

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
            id
        }
    })
}

export async function crearMetodoPago(metodo: MetodoPago) {

    try {
        await prisma.metodoPago.create({
            data: {
                metodo_pago: metodo.metodo_pago ?? '',
                comision_porcentaje_base: metodo.comision_porcentaje_base ?? 0,
                comision_fija_monto: metodo.comision_fija_monto,
                num_msi: metodo.num_msi,
                comision_msi_porcentaje: metodo.comision_msi_porcentaje,
                status: metodo.status,
                payment_method: metodo.payment_method
            }
        })
        return { success: true }
    } catch (error) {
        console.error("Error creating payment method:", error)
        throw new Error("Failed to create payment method")
    }
}

export async function actualizarMetodoPago(metodo: MetodoPago) {
    try {

        console.log("Updating payment method:", metodo)
        const updatedMetodoPago = await prisma.metodoPago.update({
            where: { id: metodo.id },
            data: {
                metodo_pago: metodo.metodo_pago,
                comision_porcentaje_base: metodo.comision_porcentaje_base,
                comision_fija_monto: metodo.comision_fija_monto,
                num_msi: metodo.num_msi,
                comision_msi_porcentaje: metodo.comision_msi_porcentaje,
                status: metodo.status,
                payment_method: metodo.payment_method
            }
        })
        console.log("Updated payment method:", updatedMetodoPago)
        return updatedMetodoPago
    } catch (error) {
        console.error("Error updating payment method:", error)
        throw new Error("Failed to update payment method")
    }
}

export async function eliminarMetodoPago(id: string) {
    return await prisma.metodoPago.delete({ where: { id } })
}

export async function actualizarStatusMetodoPago(id: string, status: string) {
    return await prisma.metodoPago.update({ where: { id }, data: { status } })
}