'use server';
import { User } from '../../types';
import bcrypt from 'bcrypt';
import prisma from '../../prismaClient';

export async function obtenerUsuarios() {
    return await prisma.user.findMany({
        orderBy: {
            createdAt: 'asc'
        }
    });
}

export async function obtenerUsuario(id: string) {
    return await prisma.user.findUnique({
        where: {
            id
        }
    });
}

export async function crearUsuario(data: User) {

    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                telefono: data.telefono
            }
        });

        if (existingUser) {
            return {
                success: false,
                message: 'El teléfono ya está asociado a otro usuario, actualiza los datos y vuelve a intentarlo',
                data: null
            };
        }

        const hashedPassword = await bcrypt.hash(data.password || '', 10);
        const newUser = await prisma.user.create({
            data: {
                username: data.username,
                email: data.email || '',
                password: hashedPassword,
                role: data.role,
                telefono: data.telefono,
                status: data.status,
            }
        });

        return {
            success: true,
            message: 'Usuario creado exitosamente',
            data: newUser
        };
    } catch (error) {
        console.log('Error al crear el usuario:', error);
        return {
            success: false,
            message: `Error al crear el usuario: ${(error as Error).message}`,
            data: null
        };
    }
}

export async function actualizarUsuario(nuevoPassword: string, data: User) {

    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                telefono: data.telefono
            }
        });

        if (existingUser && existingUser.id !== data.id) {
            return {
                success: false,
                message: 'El correo o teléfono ya están asociados a otro usuario, actualiza los datos y vuelve a intentarlo',
                data: null
            };
        }

        const hashedPassword = await bcrypt.hash(nuevoPassword || '', 10);

        const updateData: { username: string | null; email: string; role: string | undefined; telefono: string | null | undefined; status: string | undefined; password?: string } = {
            username: data.username,
            email: data.email || '',
            role: data.role,
            telefono: data.telefono,
            status: data.status,
        };

        if (nuevoPassword !== '') {
            updateData.password = hashedPassword;
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: data.id
            },
            data: updateData
        });

        return {
            success: true,
            message: 'Usuario actualizado exitosamente',
            data: updatedUser
        };
    } catch (error) {
        console.log('Error al actualizar el usuario:', error);
        return {
            success: false,
            message: 'Error al actualizar el usuario',
            data: null
        };
    }

}

export async function eliminarUsuario(id: string) {
    try {
        const deletedUser = await prisma.user.delete({
            where: {
                id
            }
        });

        return {
            success: true,
            message: 'Usuario eliminado exitosamente',
            data: deletedUser
        };
    } catch (error) {
        console.log('Error al eliminar el usuario:', error);
        return {
            success: false,
            message: 'Error al eliminar el usuario',
            data: null
        };
    }
}