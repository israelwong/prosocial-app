'use server';

import prisma from '@/app/admin/_lib/prismaClient';
import {
    crearEtapaSchema,
    actualizarEtapaSchema,
    eliminarEtapaSchema,
    reordenarEtapasSchema,
    type CrearEtapaType,
    type ActualizarEtapaType,
    type EliminarEtapaType,
    type ReordenarEtapasType,
    type EtapaPipelineType
} from './pipeline.schemas';

/**
 * Obtiene todas las etapas del pipeline con el conteo de eventos
 */
export async function obtenerEtapasPipeline() {
    try {
        const etapas = await prisma.eventoEtapa.findMany({
            orderBy: {
                posicion: 'asc'
            },
            include: {
                _count: {
                    select: {
                        Evento: true
                    }
                }
            }
        });

        const etapasConConteo: EtapaPipelineType[] = etapas.map((etapa: any) => ({
            id: etapa.id,
            nombre: etapa.nombre,
            posicion: etapa.posicion,
            eventoCount: etapa._count.Evento,
            createdAt: etapa.createdAt,
            updatedAt: etapa.updatedAt
        }));

        return {
            success: true,
            data: etapasConConteo
        };
    } catch (error) {
        console.error('Error al obtener etapas del pipeline:', error);
        return {
            success: false,
            error: 'Error al obtener las etapas del pipeline'
        };
    }
}

/**
 * Crea una nueva etapa del pipeline
 */
export async function crearEtapaPipeline(data: CrearEtapaType) {
    try {
        const validatedData = crearEtapaSchema.parse(data);

        // Verificar si ya existe una etapa con el mismo nombre
        const etapaExistente = await prisma.eventoEtapa.findFirst({
            where: {
                nombre: validatedData.nombre
            }
        });

        if (etapaExistente) {
            return {
                success: false,
                error: 'Ya existe una etapa con ese nombre'
            };
        }

        const nuevaEtapa = await prisma.eventoEtapa.create({
            data: {
                nombre: validatedData.nombre,
                posicion: validatedData.posicion
            }
        });

        return {
            success: true,
            data: nuevaEtapa,
            message: 'Etapa creada correctamente'
        };
    } catch (error) {
        console.error('Error al crear etapa del pipeline:', error);
        return {
            success: false,
            error: 'Error al crear la etapa'
        };
    }
}

/**
 * Actualiza una etapa del pipeline
 */
export async function actualizarEtapaPipeline(data: ActualizarEtapaType) {
    try {
        const validatedData = actualizarEtapaSchema.parse(data);

        // Verificar que la etapa existe
        const etapaExistente = await prisma.eventoEtapa.findUnique({
            where: { id: validatedData.id }
        });

        if (!etapaExistente) {
            return {
                success: false,
                error: 'La etapa no existe'
            };
        }

        // Si se está cambiando el nombre, verificar que no exista otra etapa con el mismo nombre
        if (validatedData.nombre && validatedData.nombre !== etapaExistente.nombre) {
            const nombreExistente = await prisma.eventoEtapa.findFirst({
                where: {
                    nombre: validatedData.nombre,
                    id: { not: validatedData.id }
                }
            });

            if (nombreExistente) {
                return {
                    success: false,
                    error: 'Ya existe una etapa con ese nombre'
                };
            }
        }

        const etapaActualizada = await prisma.eventoEtapa.update({
            where: { id: validatedData.id },
            data: {
                ...(validatedData.nombre && { nombre: validatedData.nombre }),
                ...(validatedData.posicion !== undefined && { posicion: validatedData.posicion })
            }
        });

        return {
            success: true,
            data: etapaActualizada,
            message: 'Etapa actualizada correctamente'
        };
    } catch (error) {
        console.error('Error al actualizar etapa del pipeline:', error);
        return {
            success: false,
            error: 'Error al actualizar la etapa'
        };
    }
}

/**
 * Elimina una etapa del pipeline
 */
export async function eliminarEtapaPipeline(data: EliminarEtapaType) {
    try {
        const validatedData = eliminarEtapaSchema.parse(data);

        // Verificar que la etapa existe
        const etapa = await prisma.eventoEtapa.findUnique({
            where: { id: validatedData.id },
            include: {
                _count: {
                    select: {
                        Evento: true
                    }
                }
            }
        });

        if (!etapa) {
            return {
                success: false,
                error: 'La etapa no existe'
            };
        }

        // Verificar que no tenga eventos asociados
        if (etapa._count.Evento > 0) {
            return {
                success: false,
                error: `No se puede eliminar la etapa porque tiene ${etapa._count.Evento} evento(s) asociado(s)`
            };
        }

        await prisma.eventoEtapa.delete({
            where: { id: validatedData.id }
        });

        return {
            success: true,
            message: 'Etapa eliminada correctamente'
        };
    } catch (error) {
        console.error('Error al eliminar etapa del pipeline:', error);
        return {
            success: false,
            error: 'Error al eliminar la etapa'
        };
    }
}

/**
 * Reordena las etapas del pipeline
 */
export async function reordenarEtapasPipeline(data: ReordenarEtapasType) {
    try {
        const validatedData = reordenarEtapasSchema.parse(data);

        // Actualizar las posiciones en una transacción
        await prisma.$transaction(
            validatedData.etapas.map(etapa =>
                prisma.eventoEtapa.update({
                    where: { id: etapa.id },
                    data: { posicion: etapa.posicion }
                })
            )
        );

        return {
            success: true,
            message: 'Etapas reordenadas correctamente'
        };
    } catch (error) {
        console.error('Error al reordenar etapas del pipeline:', error);
        return {
            success: false,
            error: 'Error al reordenar las etapas'
        };
    }
}
