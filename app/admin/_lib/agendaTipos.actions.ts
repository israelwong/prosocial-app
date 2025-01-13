'use server'
import prisma from './prismaClient';
// import { AgendaTipo } from './types';

export async function obtenerAgendaTipos() {
    return await prisma.agendaTipo.findMany();
}