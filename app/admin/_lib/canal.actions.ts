'use server'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function obtenerCanales() {
    return await prisma.canal.findMany();
}