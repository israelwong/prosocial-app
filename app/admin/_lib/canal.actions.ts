'use server'
import prisma from './prismaClient';
// const prisma = new PrismaClient();

export async function obtenerCanales() {
    return await prisma.canal.findMany();
}