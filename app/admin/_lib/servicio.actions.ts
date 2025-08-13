'use server'
import { Servicio } from "@/app/admin/_lib/types";
import { crearGasto, eliminarGasto, obtenerGastosPorServicio } from '@/app/admin/_lib/gastos.actions';
import { eliminarGastos } from '@/app/admin/_lib/gastos.actions';
import prisma from './prismaClient';

export async function obtenerServicos() {
    return prisma.servicio.findMany({
        orderBy: {
            posicion: 'asc'
        }
    });
}

export async function obtenerServiciosActivos() {
    return prisma.servicio.findMany({
        where: {
            status: 'active'
        },
        orderBy: {
            posicion: 'asc'
        }
    });
}

export async function obtenerServicio(id: string) {
    return prisma.servicio.findUnique({
        where: {
            id: id
        }
    });
}

export async function crearServicio(servicio: Servicio) {

    try {
        const count = await prisma.servicio.count();

        const result = await prisma.servicio.create({
            data: {
                servicioCategoriaId: servicio.servicioCategoriaId ?? '',
                nombre: servicio.nombre ?? '',
                costo: servicio.costo ?? 0,
                gasto: servicio.gasto ?? 0,
                utilidad: servicio.utilidad ?? 0,
                precio_publico: servicio.precio_publico ?? 0,
                posicion: count + 1,
                visible_cliente: servicio.visible_cliente ?? false
            }
        });

        if (servicio.gastos) {
            for (const gasto of servicio.gastos) {
                await crearGasto(
                    result.id,
                    gasto.nombre,
                    gasto.costo
                );
            }
        }

        return { success: true, result };
    } catch (error) {
        console.error('Error creando servicio:', error);
        return { success: false };
    }

}

export async function actualizarServicio(servicio: Servicio) {

    try {
        if (servicio.id) {
            const updatedServicio = await prisma.servicio.update({
                where: {
                    id: servicio.id
                },
                data: {
                    servicioCategoriaId: servicio.servicioCategoriaId,
                    nombre: servicio.nombre,
                    costo: servicio.costo,
                    gasto: servicio.gasto,
                    utilidad: servicio.utilidad,
                    precio_publico: servicio.precio_publico,
                    visible_cliente: servicio.visible_cliente,
                    tipo_utilidad: servicio.tipo_utilidad
                }
            });

            if (!updatedServicio) {
                throw new Error('Error actualizando servicio');
            }

            if (servicio.gastos) {
                const gastosActuales = await obtenerGastosPorServicio(servicio.id);
                const gastosNuevos = servicio.gastos.filter(gasto => !gastosActuales.some(gastoActual => gastoActual.id === gasto.id));
                const gastosEliminados = gastosActuales.filter(gastoActual => servicio.gastos && !servicio.gastos.some(gasto => gasto.id === gastoActual.id));
                const gastosActualizados = servicio.gastos.filter(gasto => gastosActuales.some(gastoActual => gastoActual.id === gasto.id));

                for (const gasto of gastosNuevos) {
                    await crearGasto(servicio.id, gasto.nombre, gasto.costo);
                }

                for (const gasto of gastosEliminados) {
                    if (gasto.id) {
                        await eliminarGasto(gasto.id);
                    }
                }

                for (const gasto of gastosActualizados) {
                    await prisma.servicioGasto.update({
                        where: {
                            id: gasto.id
                        },
                        data: {
                            nombre: gasto.nombre,
                            costo: gasto.costo
                        }
                    });
                }
            }
        }
        return { success: true };
    } catch (error) {
        console.error('Error actualizando servicio:', error);
        return { success: false };
    }

}

export async function eliminarServicio(id: string) {

    try {

        // saber si el servicio está en Paquetes
        const paquetesConServicio = await prisma.paqueteServicio.findMany({
            where: {
                servicioId: id
            }
        });

        if (paquetesConServicio.length > 0) {
            console.error('No se puede eliminar el servicio porque está en uso en paquetes');
            return { success: false };
        }

        const gastos = await obtenerGastosPorServicio(id);
        if (gastos && gastos.length > 0) {
            await eliminarGastos(id);
        }

        await prisma.servicio.delete({
            where: {
                id: id
            }
        });

    } catch (error) {
        console.error('Error eliminando tarea:', error);
        throw error;
    }
}

export async function obtenerServicioPorCategoria(id: string) {
    const tareas = await prisma.servicio.findMany({
        where: {
            servicioCategoriaId: id
        },
        orderBy: {
            posicion: 'asc'
        }
    });
    return tareas.length > 0 ? tareas : null;
}

export async function actualizarPosicionServicio(servicios: Servicio[]) {
    if (!servicios || servicios.length === 0) {
        console.error('No se proporcionaron tareas para actualizar.');
        return;
    }

    try {
        for (const servicio of servicios) {
            if (servicio.id && servicio.posicion !== undefined) {
                console.log(`Actualizando servicio con id: ${servicio.id} a la posición: ${servicio.posicion}`);
                await prisma.servicio.update({
                    where: {
                        id: servicio.id
                    },
                    data: {
                        posicion: servicio.posicion
                    }
                });
            } else {
                console.warn(`servicio inválida: ${JSON.stringify(servicio)}`);
            }
        }
    } catch (error) {
        console.error('Error actualizando posicion servicio:', error);
    }
}

export async function cambiarCategoriaTarea(id: string, categoriaId: string) {
    await prisma.servicio.update({
        where: {
            id: id
        },
        data: {
            servicioCategoriaId: categoriaId
        }
    });
    return { success: true };
}

export async function actualizarCategoriaTarea(id: string, categoriaId: string) {
    await prisma.servicio.update({
        where: {
            id: id
        },
        data: {
            servicioCategoriaId: categoriaId
        }
    });
    return { success: true };
}

export async function duplicarServicio(id: string) {

    const servicio = await obtenerServicio(id);

    if (!servicio) {
        throw new Error('servicio no encontrado');
    }

    const count = await prisma.servicio.count();

    const existingServicio = await prisma.servicio.findFirst({
        where: {
            nombre: `${servicio.nombre} (copia)`
        }
    });

    const newNombre = existingServicio ? `${servicio.nombre} (copia ${count + 1})` : `${servicio.nombre} (copia)`;

    const result = await prisma.servicio.create({
        data: {
            servicioCategoriaId: servicio.servicioCategoriaId,
            nombre: newNombre,
            costo: servicio.costo,
            gasto: servicio.gasto,
            utilidad: servicio.utilidad,
            precio_publico: servicio.precio_publico,
            posicion: count + 1,
            visible_cliente: servicio.visible_cliente
        }
    });

    // Duplicar gastos
    const gastos = await obtenerGastosPorServicio(id);
    if (gastos) {
        for (const gasto of gastos) {
            await crearGasto(
                result.id,
                gasto.nombre,
                gasto.costo
            );
        }
    }
    return { success: true, result };
}

export async function actualizarVisibilidadCliente(servicioId: string, visible: boolean) {
    await prisma.servicio.update({
        where: {
            id: servicioId
        },
        data: {
            visible_cliente: visible
        }
    });
    return { success: true };
}

export async function obtenerServiciosAdyacentes(servicioId: string): Promise<{ servicioAnterior: Servicio | null, servicioSiguiente: Servicio | null }> {
    const servicioActual = await obtenerServicio(servicioId);
    if (!servicioActual) {
        throw new Error('Servicio no encontrado');
    }

    const servicios = await prisma.servicio.findMany({
        where: {
            servicioCategoriaId: servicioActual.servicioCategoriaId
        },
        orderBy: {
            posicion: 'asc'
        }
    });

    const index = servicios.findIndex(t => t.id === servicioId);
    const servicioAnterior = index > 0 ? { ...servicios[index - 1], visibilidad_cliente: servicios[index - 1].visible_cliente } : null;
    const servicioSiguiente = index < servicios.length - 1 ? { ...servicios[index + 1], visibilidad_cliente: servicios[index + 1].visible_cliente } : null;

    return { servicioAnterior, servicioSiguiente };
}

export async function obtenerServiciosConRelaciones() {
    return await prisma.servicio.findMany({
        where: {
            status: 'active'
        },
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
        },
        orderBy: {
            posicion: 'asc'
        }
    });
}