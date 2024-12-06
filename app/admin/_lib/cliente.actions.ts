'use server'
import { PrismaClient } from "@prisma/client";
import { crearEvento } from "./evento.actions";
import { Cliente } from "./types";
const prisma = new PrismaClient();

export async function obtenerClientes() {
    return await prisma.cliente.findMany();
}

export async function obtenerCliente(id: string) {
    return await prisma.cliente.findUnique({
        where: {
            id: id
        }
    });
}

export async function obtenerClientePorEtapa(etapa: string) {
    return await prisma.cliente.findMany({
        where: {
            etapa: etapa
        },
        orderBy: [
            {
                updatedAt: 'desc'
            },
            {
                createdAt: 'asc'
            }
        ]
    });
}


export async function crearCliente(cliente: Cliente) {

    // Verificar si el teléfono ya existe
    const clienteExistente = await prisma.cliente.findUnique({
        where: {
            telefono: cliente.telefono ?? ''
        }
    });

    if (clienteExistente) {
        return { success: false, message: 'El teléfono ya existe', cliente: clienteExistente.id };
    }

    const result = await prisma.cliente.create({
        data: {
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            email: cliente.email ?? null,
        }
    });

    if (!result) {
        return { success: false, message: 'No se pudo crear el cliente' };
    }

    // Crear evento
    const guardarEventoResponse = await crearEvento({
        clienteId: result.id,
        eventoTipoId: cliente.eventoTipoId ?? '',
        nombre: cliente.nombreEvento ?? '',
        fecha_evento: cliente.fechaCelebracion ? new Date(cliente.fechaCelebracion) : new Date(),
    });

    if (!guardarEventoResponse) {
        return { success: false, message: 'No se pudo crear el evento' };
    }

    return { success: true, clienteId: result.id };

}

export async function actualizarCliente(cliente: Cliente) {
    return await prisma.cliente.update({
        where: {
            id: cliente.id
        },
        data: {
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            email: cliente.email,
            direccion: cliente.direccion,
            etapa: cliente.etapa,
        }
    });
}

export async function eliminarCliente(id: string) {
    return await prisma.cliente.delete({
        where: {
            id: id
        }
    });
}