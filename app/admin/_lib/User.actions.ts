'use server';

import { PrismaClient } from "@prisma/client";
import { User } from './types';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function obtenerUsuarios() {
    return await prisma.user.findMany();
}

export async function obtenerUsuario(id: string) {
    return await prisma.user.findUnique({
        where: {
            id
        }
    });
}

export async function crearUsuario(data: User) {

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return await prisma.user.create({
        data: {
            username: data.username,
            email: data.email,
            password: hashedPassword,
            role: data.role,
            status: data.status
        }
    });
}

export async function actualizarUsuario(id: string, data: User) {
    return await prisma.user.update({
        where: {
            id
        },
        data: {
            username: data.username,
            email: data.email,
            role: data.role,
            status: data.status
        }
    });
}

export async function eliminarUsuario(id: string) {
    return await prisma.user.delete({
        where: {
            id
        }
    });
}