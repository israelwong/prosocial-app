'use server'
import { Paquete, PaqueteServicio } from "./types";
import prisma from './prismaClient';

export async function obtenerPaquetesPorTipoEvento(eventoTipoId: string) {
    return await prisma.paquete.findMany({
        where: { eventoTipoId },
        orderBy: {
            posicion: 'asc'
        }
    });
}

export async function obtenerPaquete(id: string) {
    return await prisma.paquete.findUnique({
        where: { id }
    });
}

export async function crearPaquete(paquete: Paquete) {
    return await prisma.paquete.create({
        data: {
            eventoTipoId: paquete.eventoTipoId,
            nombre: paquete.nombre
        }
    });
}

export async function actualizarPaquete(paquete: Paquete) {

    await prisma.paquete.update({
        where: { id: paquete.id },
        data: {
            nombre: paquete.nombre,
            costo: paquete.costo,
            gasto: paquete.gasto,
            utilidad: paquete.utilidad,
            precio: paquete.precio,
            eventoTipoId: paquete.eventoTipoId
        }
    });

    const verificarItemsExistentesPaqueteServicio = await prisma.paqueteServicio.findMany({
        where: { paqueteId: paquete.id }
    });

    if (verificarItemsExistentesPaqueteServicio.length > 0) {
        await prisma.paqueteServicio.deleteMany({
            where: { paqueteId: paquete.id }
        });
    }

    const createPromises = paquete.servicios?.map(async (servicio: PaqueteServicio) => {
        // Verificar que el servicio existe
        const servicioExistente = await prisma.servicio.findUnique({
            where: { id: servicio.servicioId }
        });

        if (!servicioExistente) {
            throw new Error(`El servicio con ID ${servicio.servicioId} no existe.`);
        }

        return prisma.paqueteServicio.create({
            data: {
                paqueteId: paquete.id!,
                servicioId: servicio.servicioId,
                cantidad: servicio.cantidad,
                servicioCategoriaId: servicio.servicioCategoriaId,
                visible_cliente: servicio.visible_cliente ?? false,
                posicion: servicio.posicion ?? 0
            }
        });
    });

    if (createPromises) {
        await Promise.all(createPromises);
    }

    return { success: true };
}


export async function obtenerServiciosPorPaquete(paqueteId: string) {
    return await prisma.paqueteServicio.findMany({
        where: { paqueteId }
    });
}

export async function eliminarPaquete(id: string) {

    //eliminar todos los servicios se paqueteservicio where paqueteId = id
    await prisma.paqueteServicio.deleteMany({
        where: { paqueteId: id }
    });

    return await prisma.paquete.delete({
        where: { id }
    });
}

export async function clonarPaquete(id: string) {
    const paquete = await prisma.paquete.findUnique({
        where: { id }
    });

    if (!paquete) {
        throw new Error('El paquete no existe.');
    }

    const nuevoPaquete = await prisma.paquete.create({
        data: {
            eventoTipoId: paquete.eventoTipoId,
            nombre: `${paquete.nombre} (Copia)`,
            costo: paquete.costo,
            gasto: paquete.gasto,
            utilidad: paquete.utilidad,
            precio: paquete.precio,
        }
    });

    const servicios = await prisma.paqueteServicio.findMany({
        where: { paqueteId: paquete.id }
    });

    const createPromises = servicios.map(async (servicio) => {
        return prisma.paqueteServicio.create({
            data: {
                paqueteId: nuevoPaquete.id,
                servicioId: servicio.servicioId,
                cantidad: servicio.cantidad,
                servicioCategoriaId: servicio.servicioCategoriaId,
                visible_cliente: servicio.visible_cliente,
                posicion: servicio.posicion
            }
        });
    });

    await Promise.all(createPromises);

    return nuevoPaquete;
}

export async function actualizarOrdenPaquetes(paquetes: Paquete[]) {

    paquetes.forEach(async (paquete) => {
        console.log(paquete.nombre, paquete.posicion)
        await prisma.paquete.update({
            where: { id: paquete.id },
            data: {
                posicion: paquete.posicion
            }
        });
    });

}