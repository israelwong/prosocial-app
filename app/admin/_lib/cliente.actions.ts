'use server'
import { PrismaClient } from "@prisma/client";
import { Cliente } from "./types";
const prisma = new PrismaClient();

export async function obtenerClientes() {
    return await prisma.cliente.findMany({
        orderBy: {
            nombre: 'asc'
        }
    });
}

export async function obtenerCliente(id: string) {
    return await prisma.cliente.findUnique({
        where: {
            id: id
        }
    });
}

export async function obtenerClientePorStatus(status: string) {
    return await prisma.cliente.findMany({
        where: {
            status: status
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
    } else {
        const result = await prisma.cliente.create({
            data: {
                nombre: cliente.nombre,
                telefono: cliente.telefono,
                email: cliente.email ?? null,
                direccion: cliente.direccion ?? null,
                status: cliente.status ?? 'Prospecto',
                userId: cliente.userId ?? null,
                canalId: cliente.canalId ?? null,
            }
        });

        if (!result) {
            return { success: false, message: 'No se pudo crear el cliente' };
        }

        return { success: true, clienteId: result.id };
    }

}

export async function actualizarCliente(cliente: Cliente) {
    try {
        const updatedCliente = await prisma.cliente.update({
            where: {
                id: cliente.id
            },
            data: {
                nombre: cliente.nombre,
                telefono: cliente.telefono,
                email: cliente.email,
                direccion: cliente.direccion,
                status: cliente.status,
            }
        });
        return { success: true, cliente: updatedCliente };
    } catch (error) {
        return { success: false, message: 'No se pudo actualizar el cliente', error: (error as Error).message };
    }
}

export async function eliminarCliente(id: string) {
    return await prisma.cliente.delete({
        where: {
            id: id
        }
    });
}