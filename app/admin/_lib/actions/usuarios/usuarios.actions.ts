// Ruta: app/admin/_lib/actions/usuarios/usuarios.actions.ts

'use server';

import prisma from '@/app/admin/_lib/prismaClient';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { UserCreateSchema, UserUpdateSchema } from './usuarios.schemas';
import bcrypt from 'bcrypt';

const basePath = '/admin/configurar/usuarios';

export async function obtenerUsuarios() {
    return await prisma.user.findMany({
        orderBy: [
            { role: 'asc' },
            { username: 'asc' }
        ]
    });
}

export async function obtenerUsuario(id: string) {
    return await prisma.user.findUnique({ where: { id } });
}

export async function crearUsuario(data: unknown) {
    const validationResult = UserCreateSchema.safeParse(data);
    if (!validationResult.success) {
        return { success: false, error: validationResult.error.flatten().fieldErrors };
    }

    const { password, ...userData } = validationResult.data;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: { ...userData, password: hashedPassword },
        });
    } catch (error) {
        return { success: false, message: "El nombre de usuario o teléfono ya existe." };
    }

    revalidatePath(basePath);
    redirect(basePath);
}

export async function actualizarUsuario(data: unknown) {
    const validationResult = UserUpdateSchema.safeParse(data);
    if (!validationResult.success) {
        return { success: false, error: validationResult.error.flatten().fieldErrors };
    }

    const { id, password, ...userData } = validationResult.data;
    if (!id) return { success: false, message: "ID no proporcionado." };

    try {
        const dataToUpdate: any = { ...userData };
        if (password) {
            dataToUpdate.password = await bcrypt.hash(password, 10);
        }

        await prisma.user.update({
            where: { id },
            data: dataToUpdate,
        });
    } catch (error) {
        return { success: false, message: "No se pudo actualizar el usuario." };
    }

    revalidatePath(basePath);
    revalidatePath(`${basePath}/${id}`);
    redirect(basePath);
}

export async function eliminarUsuario(id: string) {
    try {
        await prisma.user.delete({ where: { id } });
    } catch (error) {
        return { success: false, message: "No se pudo eliminar el usuario." };
    }
    revalidatePath(basePath);
    redirect(basePath);
}
