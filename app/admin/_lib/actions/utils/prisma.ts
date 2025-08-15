import { randomUUID } from 'crypto';

/**
 * Genera un ID único para uso en Prisma
 */
export function generarId(): string {
    return randomUUID();
}

/**
 * Obtiene la fecha actual para el campo updatedAt
 */
export function obtenerFechaActual(): Date {
    return new Date();
}

/**
 * Utilidad para crear datos con campos obligatorios de Prisma
 */
export function crearDatosPrisma<T extends Record<string, any>>(data: T) {
    return {
        id: generarId(),
        updatedAt: obtenerFechaActual(),
        ...data
    };
}
