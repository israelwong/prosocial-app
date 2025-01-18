'use server'
import prisma from './prismaClient';

export async function conteo() {

    const seguimiento = await prisma.evento.count({
        where: {
            OR: [
                { status: 'seguimiento' },
                { status: 'nuevo' }
            ]
        }
    });

    const aprobados = await prisma.evento.count({
        where: {
            status: 'aprobado',
        }
    });


    return { seguimiento, aprobados };
}
