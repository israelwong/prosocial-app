'use server'
import prisma from './prismaClient';

export async function obtenerEventoBitacora(eventoId: string) {
    try {
        const bitacora = await prisma.eventoBitacora.findMany({
            where: {
                eventoId
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        return bitacora;
    } catch (error) {
        console.error('Error obteniendo bitácora:', error);
        throw new Error('No se pudo obtener la bitácora del evento');
    }
}

// Función para verificar la estructura de datos
export async function verificarEstructuraBitacora(eventoId: string) {
    try {
        const bitacora = await prisma.eventoBitacora.findMany({
            where: { eventoId },
            select: {
                id: true,
                comentario: true,
                importancia: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        console.log('🔍 Verificación estructura bitácora:', {
            total: bitacora.length,
            ejemplos: bitacora.map(item => ({
                id: item.id.substring(0, 8) + '...',
                comentario: item.comentario.substring(0, 50) + '...',
                importancia: item.importancia,
                tipo_importancia: typeof item.importancia
            }))
        });

        return bitacora;
    } catch (error) {
        console.error('Error verificando estructura:', error);
        return [];
    }
}

export async function obtenerBitacora(bitacoraId: string) {
    const bitacora = await prisma.eventoBitacora.findUnique({
        where: {
            id: bitacoraId
        }
    });
    return bitacora;
}

// FUNCIÓN MIGRADA A: @/app/admin/_lib/actions/evento/bitacora.actions.ts
// export async function crearBitacoraEvento(eventoId: string, anotacion: string, importancia: string = 'informativo') {
//     try {
//         const bitacora = await prisma.eventoBitacora.create({
//             data: {
//                 eventoId,
//                 comentario: anotacion,
//                 importancia: importancia
//             }
//         });
//         return bitacora;
//     } catch (error) {
//         console.error('Error creando bitácora:', error);
//         throw new Error('No se pudo crear la entrada de bitácora');
//     }
// }

export async function eliminarBitacoraEvento(bitacoraId: string) {
    try {
        const bitacora = await prisma.eventoBitacora.delete({
            where: {
                id: bitacoraId
            }
        });
        return bitacora;
    } catch (error) {
        console.error('Error eliminando bitácora:', error);
        throw new Error('No se pudo eliminar la entrada de bitácora');
    }
}

export async function actualizarBitacoraEvento(bitacoraId: string, anotacion: string, importancia?: string) {
    try {
        const updateData: any = {
            comentario: anotacion
        };

        if (importancia) {
            updateData.importancia = importancia;
        }

        const bitacora = await prisma.eventoBitacora.update({
            where: {
                id: bitacoraId
            },
            data: updateData
        });
        return bitacora;
    } catch (error) {
        console.error('Error actualizando bitácora:', error);
        throw new Error('No se pudo actualizar la entrada de bitácora');
    }
}