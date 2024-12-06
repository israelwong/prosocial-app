'use server'
import { PrismaClient } from '@prisma/client'
import { CondicionesComerciales } from './types'

const prisma = new PrismaClient()

export async function obtenerCondicionesComerciales() {
    return await prisma.condicionesComerciales.findMany()
}

export async function obtenerCondicionesComercialesActivas() {
    return await prisma.condicionesComerciales.findMany({
        where: {
            status: 'active'
        }
    })
}

export async function obtenerCondicionComercial(id: string) {
    return await prisma.condicionesComerciales.findUnique({
        where: {
            id: id
        }
    })
}

export async function crearCondicionComercial(condicionesComerciales: CondicionesComerciales) {

    try {
        const result = await prisma.condicionesComerciales.create({
            data: {
                nombre: condicionesComerciales.nombre ?? '',
                descripcion: condicionesComerciales.descripcion,
                descuento: condicionesComerciales.descuento,
            }
        });

        if (result.id && condicionesComerciales.metodosPago && condicionesComerciales.metodosPago.length > 0) {
            for (const metodo of condicionesComerciales.metodosPago) {
                if (metodo.id) {
                    try {
                        await prisma.condicionesComercialesMetodoPago.create({
                            data: {
                                condicionesComercialesId: result.id!,
                                metodoPagoId: metodo.id
                            }
                        });
                    } catch (error) {
                        console.error(`Error al guardar el metodo de pago con id ${metodo.id}:`, error);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error al crear condiciones comerciales:', error);
        throw error;
    }
}

export async function actualizarCondicionComercial(condicionesComerciales: CondicionesComerciales) {

    await prisma.condicionesComerciales.update({
        where: {
            id: condicionesComerciales.id
        },
        data: {
            nombre: condicionesComerciales.nombre,
            descripcion: condicionesComerciales.descripcion,
            descuento: condicionesComerciales.descuento,
            status: condicionesComerciales.status
        }
    })

    await prisma.condicionesComercialesMetodoPago.deleteMany({
        where: {
            condicionesComercialesId: condicionesComerciales.id
        }
    })

    if (condicionesComerciales.metodosPago && condicionesComerciales.metodosPago.length > 0) {
        condicionesComerciales.metodosPago.forEach(async (metodo) => {
            if (metodo.id) {
                await prisma.condicionesComercialesMetodoPago.create({
                    data: {
                        condicionesComercialesId: condicionesComerciales.id!,
                        metodoPagoId: metodo.id,
                        orden: metodo.orden
                    }
                })
            }
        })
    }
    return true
}

export async function obtenerCondicionesComercialesMetodosPago(condicionesComercialesId: string) {
    return await prisma.condicionesComercialesMetodoPago.findMany({
        where: {
            condicionesComercialesId
        }
    })

}

export async function eliminarCondicionComercial(id: string) {
    await prisma.condicionesComercialesMetodoPago.deleteMany({
        where: {
            condicionesComercialesId: id
        }
    })

    await prisma.condicionesComerciales.delete({
        where: {
            id
        }
    })
}