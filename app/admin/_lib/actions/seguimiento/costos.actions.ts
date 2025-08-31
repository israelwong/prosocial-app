'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

interface CostoData {
    id?: string
    cotizacionId: string
    nombre: string
    descripcion?: string
    costo: number
    tipo?: string
    fecha?: Date
}

export async function crearCosto(datos: CostoData) {
    try {
        const { cotizacionId, nombre, descripcion, costo, tipo = 'produccion' } = datos

        // Validaciones
        if (!cotizacionId || !nombre || costo <= 0) {
            return { success: false, message: 'Datos incompletos o inválidos' }
        }

        // Crear el costo
        const nuevoCosto = await prisma.cotizacionCosto.create({
            data: {
                cotizacionId,
                nombre,
                descripcion,
                costo,
                tipo,
                posicion: 0 // Para costos de producción
            }
        })

        revalidatePath(`/admin/dashboard/seguimiento`)

        return {
            success: true,
            message: 'Costo registrado exitosamente',
            costo: nuevoCosto
        }

    } catch (error) {
        console.error('❌ Error al crear costo:', error)
        return {
            success: false,
            message: 'Error interno del servidor'
        }
    }
}

export async function obtenerCostosPorCotizacion(cotizacionId: string) {
    try {
        if (!cotizacionId) {
            return { success: false, message: 'ID de cotización requerido' }
        }

        const costos = await prisma.cotizacionCosto.findMany({
            where: {
                cotizacionId,
                tipo: 'produccion' // Solo costos de producción
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return {
            success: true,
            costos: costos.map((costo: any) => ({
                ...costo,
                fechaFormateada: new Intl.DateTimeFormat('es-MX', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }).format(costo.createdAt),
                montoFormateado: new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN'
                }).format(costo.costo)
            }))
        }

    } catch (error) {
        console.error('❌ Error al obtener costos:', error)
        return {
            success: false,
            message: 'Error al obtener costos'
        }
    }
}

export async function actualizarCosto(datos: CostoData) {
    try {
        const { id, nombre, descripcion, costo } = datos

        // Validaciones
        if (!id || !nombre || costo <= 0) {
            return { success: false, message: 'Datos incompletos o inválidos' }
        }

        // Actualizar el costo
        const costoActualizado = await prisma.cotizacionCosto.update({
            where: { id },
            data: {
                nombre,
                descripcion,
                costo
            }
        })

        revalidatePath(`/admin/dashboard/seguimiento`)

        return {
            success: true,
            message: 'Costo actualizado exitosamente',
            costo: costoActualizado
        }

    } catch (error) {
        console.error('❌ Error al actualizar costo:', error)
        return {
            success: false,
            message: 'Error interno del servidor'
        }
    }
}

export async function eliminarCosto(costoId: string) {
    try {
        if (!costoId) {
            return { success: false, message: 'ID de costo requerido' }
        }

        // Eliminar el costo
        await prisma.cotizacionCosto.delete({
            where: { id: costoId }
        })

        revalidatePath(`/admin/dashboard/seguimiento`)

        return {
            success: true,
            message: 'Costo eliminado exitosamente'
        }

    } catch (error) {
        console.error('❌ Error al eliminar costo:', error)
        return {
            success: false,
            message: 'Error interno del servidor'
        }
    }
}

export async function obtenerTotalCostosPorCotizacion(cotizacionId: string) {
    try {
        if (!cotizacionId) {
            return { success: false, total: 0 }
        }

        const resultado = await prisma.cotizacionCosto.aggregate({
            where: {
                cotizacionId,
                tipo: 'produccion'
            },
            _sum: {
                costo: true
            }
        })

        return {
            success: true,
            total: resultado._sum.costo || 0
        }

    } catch (error) {
        console.error('❌ Error al obtener total de costos:', error)
        return {
            success: false,
            total: 0
        }
    }
}
