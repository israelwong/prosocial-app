// Ruta: app/admin/_lib/actions/paquetes/paquetes.actions.ts

'use server';

import prisma from '@/app/admin/_lib/prismaClient';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { PaqueteSchema } from './paquetes.schemas';

const basePath = '/admin/configurar/paquetes';

export async function obtenerPaquetesParaCliente() {
    return await prisma.eventoTipo.findMany({
        include: {
            Paquete: {
                where: { status: 'active' },
                orderBy: { posicion: 'asc' },
                include: {
                    PaqueteServicio: {
                        include: {
                            Servicio: {
                                include: {
                                    ServicioCategoria: {
                                        include: {
                                            seccionCategoria: {
                                                include: {
                                                    Seccion: true
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            ServicioCategoria: {
                                include: {
                                    seccionCategoria: {
                                        include: {
                                            Seccion: true
                                        }
                                    }
                                }
                            }
                        },
                        where: {
                            status: 'active',
                            visible_cliente: true
                        },
                        orderBy: [
                            { ServicioCategoria: { seccionCategoria: { Seccion: { posicion: 'asc' } } } },
                            { ServicioCategoria: { posicion: 'asc' } },
                            { Servicio: { posicion: 'asc' } }
                        ]
                    }
                }
            },
        },
        orderBy: { posicion: 'asc' },
    });
}

/**
 * Verificar si hay paquetes disponibles para un tipo de evento específico
 * Función optimizada que solo verifica la existencia sin cargar todos los datos
 */
export async function verificarPaquetesDisponiblesPorTipoEvento(eventoTipoId: string): Promise<boolean> {
    if (!eventoTipoId) {
        return false;
    }

    const count = await prisma.paquete.count({
        where: {
            eventoTipoId: eventoTipoId,
            status: 'active'
        }
    });

    return count > 0;
}

export async function obtenerPaqueteDetalleParaCliente(paqueteId: string) {
    const paquete = await prisma.paquete.findUnique({
        where: {
            id: paqueteId,
            status: 'active'
        },
        include: {
            EventoTipo: true,
            PaqueteServicio: {
                include: {
                    Servicio: {
                        include: {
                            ServicioCategoria: {
                                include: {
                                    seccionCategoria: {
                                        include: {
                                            Seccion: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    ServicioCategoria: {
                        include: {
                            seccionCategoria: {
                                include: {
                                    Seccion: true
                                }
                            }
                        }
                    }
                },
                where: {
                    status: 'active',
                    visible_cliente: true
                },
                orderBy: [
                    { posicion: 'asc' }
                ]
            }
        }
    });

    if (!paquete) {
        throw new Error('Paquete no encontrado');
    }

    // Función para obtener la posición de la sección de forma segura
    const getSeccionPosicion = (ps: any) => {
        // Intentar obtener desde Servicio.ServicioCategoria
        if (ps.Servicio?.ServicioCategoria?.seccionCategoria?.Seccion?.posicion !== undefined) {
            return ps.Servicio.ServicioCategoria.seccionCategoria.Seccion.posicion;
        }
        // Intentar obtener desde ServicioCategoria directa
        if (ps.ServicioCategoria?.seccionCategoria?.Seccion?.posicion !== undefined) {
            return ps.ServicioCategoria.seccionCategoria.Seccion.posicion;
        }
        return 999; // Default si no encuentra
    };

    // Función para obtener la posición de la categoría
    const getCategoriaPosicion = (ps: any) => {
        if (ps.Servicio?.ServicioCategoria?.posicion !== undefined) {
            return ps.Servicio.ServicioCategoria.posicion;
        }
        if (ps.ServicioCategoria?.posicion !== undefined) {
            return ps.ServicioCategoria.posicion;
        }
        return 999;
    };

    // Ordenar manualmente por jerarquía: Sección -> Categoría -> Servicio
    paquete.PaqueteServicio.sort((a, b) => {
        // 1. Comparar por sección
        const seccionA = getSeccionPosicion(a);
        const seccionB = getSeccionPosicion(b);

        if (seccionA !== seccionB) {
            return seccionA - seccionB;
        }

        // 2. Comparar por categoría
        const categoriaA = getCategoriaPosicion(a);
        const categoriaB = getCategoriaPosicion(b);

        if (categoriaA !== categoriaB) {
            return categoriaA - categoriaB;
        }

        // 3. Comparar por posición del servicio en el paquete
        return (a.posicion || 999) - (b.posicion || 999);
    });

    console.log('🔍 PAQUETE ORDENADO POR JERARQUÍA:', {
        totalServicios: paquete.PaqueteServicio.length,
        primeraSeccion: paquete.PaqueteServicio[0] ? getSeccionPosicion(paquete.PaqueteServicio[0]) : null,
        ultimaSeccion: paquete.PaqueteServicio.length > 0 ? getSeccionPosicion(paquete.PaqueteServicio[paquete.PaqueteServicio.length - 1]) : null
    });

    return paquete;
}

// --- Funciones de Lectura ---
export async function obtenerPaquetesAgrupados() {
    return await prisma.eventoTipo.findMany({
        include: {
            Paquete: {
                orderBy: { posicion: 'asc' },
                include: {
                    PaqueteServicio: {
                        include: {
                            Servicio: {
                                select: {
                                    costo: true,
                                    gasto: true,
                                    utilidad: true,
                                    precio_publico: true
                                }
                            }
                        }
                    }
                }
            },
        },
        orderBy: { posicion: 'asc' },
    });
}

export async function obtenerPaquete(id: string) {
    return await prisma.paquete.findUnique({
        where: { id },
        include: {
            PaqueteServicio: {
                select: { servicioId: true, cantidad: true },
            },
        },
    });
}

// --- Funciones de Escritura ---
async function upsertPaquete(data: unknown) {
    const validationResult = PaqueteSchema.safeParse(data);
    if (!validationResult.success) {
        return { success: false, error: validationResult.error.flatten().fieldErrors };
    }

    const { id, servicios, ...validatedData } = validationResult.data;
    const serviciosIncluidos = servicios || [];

    try {
        const serviciosDb = await prisma.servicio.findMany({
            where: { id: { in: serviciosIncluidos.map(s => s.servicioId) } },
        });

        // CONVERSIÓN SEGURA: Convertimos los strings a números aquí.
        const totalCosto = serviciosIncluidos.reduce((acc, s) => {
            const servicioDb = serviciosDb.find(db => db.id === s.servicioId);
            return acc + (servicioDb?.costo || 0) * parseInt(s.cantidad, 10);
        }, 0);
        const totalGasto = serviciosIncluidos.reduce((acc, s) => {
            const servicioDb = serviciosDb.find(db => db.id === s.servicioId);
            return acc + (servicioDb?.gasto || 0) * parseInt(s.cantidad, 10);
        }, 0);
        const totalUtilidad = serviciosIncluidos.reduce((acc, s) => {
            const servicioDb = serviciosDb.find(db => db.id === s.servicioId);
            return acc + (servicioDb?.utilidad || 0) * parseInt(s.cantidad, 10);
        }, 0);

        const dataToSave = {
            ...validatedData,
            precio: parseFloat(validatedData.precio),
            costo: totalCosto,
            gasto: totalGasto,
            utilidad: totalUtilidad,
        };

        const result = await prisma.$transaction(async (tx) => {
            const count = await tx.paquete.count({ where: { eventoTipoId: dataToSave.eventoTipoId } });
            const paqueteResult = await tx.paquete.upsert({
                where: { id: id || '' },
                update: dataToSave,
                create: { ...dataToSave, posicion: count + 1 },
            });

            const paqueteId = id || paqueteResult.id;
            await tx.paqueteServicio.deleteMany({ where: { paqueteId } });
            if (serviciosIncluidos.length > 0) {
                await tx.paqueteServicio.createMany({
                    data: serviciosIncluidos.map(s => {
                        const servicioDb = serviciosDb.find(db => db.id === s.servicioId);
                        return {
                            paqueteId,
                            servicioId: s.servicioId,
                            cantidad: parseInt(s.cantidad, 10), // Conversión final
                            servicioCategoriaId: servicioDb?.servicioCategoriaId || '',
                        };
                    }),
                });
            }
            return paqueteResult;
        });
        return { success: true, data: result };
    } catch (error) {
        console.error("Error al guardar paquete:", error);
        return { success: false, message: "No se pudo guardar el paquete." };
    }
}


export async function crearPaquete(data: unknown) {
    const result = await upsertPaquete(data);
    if (result.success && result.data && result.data.id) {
        revalidatePath(basePath);
        redirect(`/admin/configurar/paquetes/${result.data.id}`);
    }
    return result;
}

export async function actualizarPaquete(data: unknown) {
    const result = await upsertPaquete(data);
    if (result.success && result.data && result.data.id) {
        revalidatePath(basePath);
        revalidatePath(`${basePath}/${result.data.id}`);
    }
    return result;
}

export async function eliminarPaquete(id: string) {
    try {
        await prisma.paquete.delete({ where: { id } });
    } catch (error) {
        return { success: false, message: "No se pudo eliminar." };
    }
    revalidatePath(basePath);
    redirect(basePath);
}


// --- Funciones Refactorizadas ---

/**
 * Clona un paquete existente y todos sus servicios asociados de forma atómica.
 */
export async function clonarPaquete(id: string) {
    try {
        const paqueteOriginal = await prisma.paquete.findUnique({
            where: { id },
            include: { PaqueteServicio: true }, // Incluimos los servicios en la consulta
        });

        if (!paqueteOriginal) {
            return { success: false, message: "El paquete original no existe." };
        }

        const count = await prisma.paquete.count({ where: { eventoTipoId: paqueteOriginal.eventoTipoId } });

        // Usamos una única operación `create` con datos anidados para asegurar la atomicidad.
        await prisma.paquete.create({
            data: {
                // Copiamos los datos del paquete original
                ...paqueteOriginal,
                id: undefined, // Dejamos que Prisma genere un nuevo ID
                nombre: `${paqueteOriginal.nombre} (Copia)`,
                posicion: count + 1,
                // Creamos los nuevos servicios asociados en la misma operación
                PaqueteServicio: {
                    create: paqueteOriginal.PaqueteServicio.map(servicio => ({
                        servicioId: servicio.servicioId,
                        cantidad: servicio.cantidad,
                        servicioCategoriaId: servicio.servicioCategoriaId,
                        visible_cliente: servicio.visible_cliente,
                        posicion: servicio.posicion,
                    })),
                },
            },
        });

        revalidatePath(basePath);
        return { success: true };
    } catch (error) {
        console.error("Error al clonar el paquete:", error);
        return { success: false, message: "No se pudo clonar el paquete." };
    }
}

/**
 * Actualiza las posiciones de múltiples paquetes en una sola transacción.
 */
export async function actualizarOrdenPaquetes(paquetes: { id: string, posicion: number }[]) {
    if (!paquetes || paquetes.length === 0) {
        return { success: true }; // No hay nada que hacer
    }

    try {
        // Usamos una transacción para ejecutar todas las actualizaciones a la vez.
        // Esto es mucho más eficiente y seguro que un forEach con await.
        await prisma.$transaction(
            paquetes.map(paquete =>
                prisma.paquete.update({
                    where: { id: paquete.id },
                    data: { posicion: paquete.posicion },
                })
            )
        );

        revalidatePath(basePath);
        return { success: true };
    } catch (error) {
        console.error("Error al actualizar el orden de los paquetes:", error);
        return { success: false, message: "No se pudo guardar el nuevo orden." };
    }
}

// =============================================================================
// FUNCIONES MIGRADAS DESDE ARCHIVOS LEGACY
// =============================================================================

/**
 * Obtener paquetes por tipo de evento - MIGRADA desde /paquete/paquete.actions.ts
 * Función para obtener paquetes ordenados por posición
 * Utilizada por: FichaCotizacionesUnificada
 */
export async function obtenerPaquetesPorTipoEventoLegacy(eventoTipoId: string) {
    return await prisma.paquete.findMany({
        where: { eventoTipoId },
        orderBy: {
            posicion: 'asc'
        }
    });
}