'use server';

import prisma from '../../prismaClient';

export async function obtenerUsuarios() {
    try {
        const usuarios = await prisma.user.findMany({
            where: {
                status: 'active', // O el filtro que consideres apropiado
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
            },
            orderBy: {
                username: 'asc',
            },
        });
        return usuarios;
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        throw new Error('No se pudieron obtener los usuarios.');
    }
}
