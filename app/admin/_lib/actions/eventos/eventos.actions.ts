'use server'
import prisma from '../../prismaClient';
import { EventosConDetallesArraySchema, EventoConDetalles } from '../../schemas/evento.schemas';

/**
 * Obtiene los eventos que pertenecen a una o más etapas específicas,
 * incluyendo detalles de las relaciones (Cliente, EventoTipo, EventoEtapa).
 * Los datos son validados contra el esquema de Zod.
 *
 * @param etapaIds - Un array de IDs de las etapas de evento.
 * @returns Una promesa que resuelve a un array de eventos con detalles.
 */
export async function getEventosConDetallesPorEtapa(etapaIds: string[]): Promise<EventoConDetalles[]> {
    try {
        const eventos = await prisma.evento.findMany({
            where: {
                eventoEtapaId: {
                    in: etapaIds,
                },
                status: 'active', // Filtramos solo por eventos activos como buena práctica
            },
            include: {
                Cliente: {
                    select: { nombre: true },
                },
                EventoTipo: {
                    select: { nombre: true },
                },
                EventoEtapa: {
                    select: { nombre: true, posicion: true },
                },
            },
            orderBy: {
                fecha_evento: 'asc', // Ordenamos por la fecha más próxima
            },
        });

        // Validar los datos con Zod antes de retornarlos
        const validatedEventos = EventosConDetallesArraySchema.safeParse(eventos);

        if (!validatedEventos.success) {
            console.error('Error de validación de Zod:', validatedEventos.error.flatten().fieldErrors);
            throw new Error('Los datos de los eventos no pasaron la validación.');
        }

        return validatedEventos.data;
    } catch (error) {
        console.error('Error al obtener eventos con detalles:', error);
        // Podríamos retornar un array vacío o relanzar el error dependiendo del caso de uso
        return [];
    }
}
