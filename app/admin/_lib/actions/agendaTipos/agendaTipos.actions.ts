'use server'
import prisma from '../../prismaClient';

export async function obtenerAgendaTipos() {
    return await prisma.agendaTipo.findMany();
}