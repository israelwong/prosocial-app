// Ruta: app/admin/_lib/actions/contactos/contactos.actions.ts

'use server'

import prisma from '@/app/admin/_lib/prismaClient';
import {
    ContactoCreateSchema,
    ContactoUpdateSchema,
    ContactoBusquedaSchema,
    TelefonoUnicoSchema,
    type ContactoCreateForm,
    type ContactoUpdateForm,
    type ContactoBusquedaForm,
    type TelefonoUnicoForm
} from './contactos.schemas';
import { revalidatePath } from 'next/cache';

// Obtener todos los contactos con paginación y filtros
export async function obtenerContactos(params?: ContactoBusquedaForm) {
    try {
        const validatedParams = ContactoBusquedaSchema.parse(params || {});
        const { search, status, canalId, fechaDesde, fechaHasta, page, limit } = validatedParams;

        const skip = (page - 1) * limit;

        // Construir condiciones de búsqueda
        const where: any = {};

        if (search) {
            where.OR = [
                { nombre: { contains: search, mode: 'insensitive' } },
                { telefono: { contains: search } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (status) {
            where.status = status;
        }

        if (canalId) {
            where.canalId = canalId;
        }

        if (fechaDesde || fechaHasta) {
            where.createdAt = {};
            if (fechaDesde) where.createdAt.gte = new Date(fechaDesde);
            if (fechaHasta) where.createdAt.lte = new Date(fechaHasta);
        }

        // Ejecutar consultas en paralelo
        const [contactos, total] = await Promise.all([
            prisma.cliente.findMany({
                where,
                include: {
                    Canal: {
                        select: {
                            id: true,
                            nombre: true,
                        }
                    },
                    _count: {
                        select: {
                            Evento: true,
                        }
                    }
                },
                orderBy: [
                    { updatedAt: 'desc' },
                    { createdAt: 'desc' },
                ],
                skip,
                take: limit,
            }),
            prisma.cliente.count({ where }),
        ]);

        return {
            success: true,
            data: contactos,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            }
        };
    } catch (error) {
        console.error('Error al obtener contactos:', error);
        return {
            success: false,
            message: 'Error al obtener la lista de contactos',
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

// Obtener contacto por ID
export async function obtenerContacto(id: string) {
    try {
        if (!id || typeof id !== 'string') {
            return {
                success: false,
                message: 'ID de contacto inválido'
            };
        }

        const contacto = await prisma.cliente.findUnique({
            where: { id },
            include: {
                Canal: {
                    select: {
                        id: true,
                        nombre: true,
                    }
                },
                Evento: {
                    select: {
                        id: true,
                        nombre: true,
                        fecha_evento: true,
                        status: true,
                        EventoTipo: {
                            select: {
                                nombre: true,
                            }
                        }
                    },
                    orderBy: {
                        fecha_evento: 'desc',
                    }
                },
                _count: {
                    select: {
                        Evento: true,
                    }
                }
            }
        });

        if (!contacto) {
            return {
                success: false,
                message: 'Contacto no encontrado'
            };
        }

        return {
            success: true,
            data: contacto
        };
    } catch (error) {
        console.error('Error al obtener contacto:', error);
        return {
            success: false,
            message: 'Error al obtener el contacto',
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

// Crear nuevo contacto
export async function crearContacto(data: ContactoCreateForm) {
    try {
        const validatedData = ContactoCreateSchema.parse(data);

        // Verificar si el teléfono ya existe
        const existeContacto = await verificarTelefonoUnico({
            telefono: validatedData.telefono
        });

        if (!existeContacto.success || !existeContacto.isUnique) {
            return {
                success: false,
                message: 'El número de teléfono ya está registrado',
                contactoExistente: existeContacto.contactoId
            };
        }

        const nuevoContacto = await prisma.cliente.create({
            data: {
                nombre: validatedData.nombre,
                telefono: validatedData.telefono,
                email: validatedData.email || null,
                canalId: validatedData.canalId,
                userId: validatedData.userId,
                status: validatedData.status,
            },
            include: {
                Canal: {
                    select: {
                        nombre: true,
                    }
                }
            }
        });

        revalidatePath('/admin/dashboard/contactos');

        return {
            success: true,
            message: 'Contacto creado exitosamente',
            data: nuevoContacto
        };
    } catch (error) {
        console.error('Error al crear contacto:', error);
        return {
            success: false,
            message: 'Error al crear el contacto',
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

// Actualizar contacto
export async function actualizarContacto(data: ContactoUpdateForm) {
    try {
        const validatedData = ContactoUpdateSchema.parse(data);
        const { id, ...updateData } = validatedData;

        // Si se está actualizando el teléfono, verificar que sea único
        if (updateData.telefono) {
            const existeContacto = await verificarTelefonoUnico({
                telefono: updateData.telefono,
                excludeId: id
            });

            if (!existeContacto.success || !existeContacto.isUnique) {
                return {
                    success: false,
                    message: 'El número de teléfono ya está registrado por otro contacto'
                };
            }
        }

        // Remover campos undefined para evitar problemas con Prisma
        const cleanData = Object.entries(updateData).reduce((acc, [key, value]) => {
            if (value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {} as any);

        const contactoActualizado = await prisma.cliente.update({
            where: { id },
            data: cleanData,
            include: {
                Canal: {
                    select: {
                        nombre: true,
                    }
                }
            }
        });

        revalidatePath('/admin/dashboard/contactos');
        revalidatePath(`/admin/dashboard/contactos/${id}`);

        return {
            success: true,
            message: 'Contacto actualizado exitosamente',
            data: contactoActualizado
        };
    } catch (error) {
        console.error('Error al actualizar contacto:', error);
        return {
            success: false,
            message: 'Error al actualizar el contacto',
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

// Eliminar contacto
export async function eliminarContacto(id: string) {
    try {
        if (!id || typeof id !== 'string') {
            return {
                success: false,
                message: 'ID de contacto inválido'
            };
        }

        // Verificar si tiene eventos asociados
        const eventosAsociados = await prisma.evento.count({
            where: { clienteId: id }
        });

        if (eventosAsociados > 0) {
            return {
                success: false,
                message: `No se puede eliminar el contacto porque tiene ${eventosAsociados} evento(s) asociado(s)`
            };
        }

        await prisma.cliente.delete({
            where: { id }
        });

        revalidatePath('/admin/dashboard/contactos');

        return {
            success: true,
            message: 'Contacto eliminado exitosamente'
        };
    } catch (error) {
        console.error('Error al eliminar contacto:', error);
        return {
            success: false,
            message: 'Error al eliminar el contacto',
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

// Verificar si el teléfono es único
export async function verificarTelefonoUnico(data: TelefonoUnicoForm) {
    try {
        const validatedData = TelefonoUnicoSchema.parse(data);
        const { telefono, excludeId } = validatedData;

        const where: any = { telefono };
        if (excludeId) {
            where.NOT = { id: excludeId };
        }

        const contactoExistente = await prisma.cliente.findFirst({
            where,
            select: { id: true, nombre: true }
        });

        return {
            success: true,
            isUnique: !contactoExistente,
            contactoId: contactoExistente?.id,
            contactoNombre: contactoExistente?.nombre
        };
    } catch (error) {
        console.error('Error al verificar teléfono único:', error);
        return {
            success: false,
            message: 'Error al verificar el teléfono',
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

// Cambiar status de contacto
export async function cambiarStatusContacto(id: string, status: 'prospecto' | 'cliente' | 'descartado') {
    try {
        if (!id || typeof id !== 'string') {
            return {
                success: false,
                message: 'ID de contacto inválido'
            };
        }

        const contactoActualizado = await prisma.cliente.update({
            where: { id },
            data: { status },
        });

        revalidatePath('/admin/dashboard/contactos');
        revalidatePath(`/admin/dashboard/contactos/${id}`);

        return {
            success: true,
            message: `Status cambiado a ${status} exitosamente`,
            data: contactoActualizado
        };
    } catch (error) {
        console.error('Error al cambiar status:', error);
        return {
            success: false,
            message: 'Error al cambiar el status del contacto',
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}
