'use server'
import prisma from "./prismaClient";

export async function registrarVisita(cotizacionId: string) {
    await prisma.cotizacionVisita.create({
        data: {
            cotizacionId
        }
    })
}