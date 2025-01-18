'use server'
import prisma from './prismaClient';

export async function obtenerCanales() {
    return await prisma.canal.findMany();
}