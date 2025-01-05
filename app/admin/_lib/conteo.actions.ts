'use server'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function conteo() {

    const seguimiento = await prisma.evento.count({
        where: {
            OR: [
                { status: 'seguimiento' },
                { status: 'nuevo' }
            ]
        }
    });

    const gestionar = await prisma.evento.count({
        where: {
            status: 'aprobado',
        }
    });


    return { seguimiento, gestionar };
}