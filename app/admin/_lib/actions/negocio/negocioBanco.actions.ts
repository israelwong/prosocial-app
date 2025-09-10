'use server'
import prisma from '@/app/admin/_lib/prismaClient'
import { revalidatePath } from 'next/cache'

export interface NegocioBanco {
    id: string
    negocioId: string
    banco: string
    beneficiario: string
    clabe: string
    cuenta?: string | null
    sucursal?: string | null
    status: string
    principal: boolean
    createdAt: Date
    updatedAt: Date
}

export interface CrearCuentaBancariaData {
    banco: string
    beneficiario: string
    clabe: string
    cuenta?: string
    sucursal?: string
    principal?: boolean
}

export interface ActualizarCuentaBancariaData extends CrearCuentaBancariaData {
    id: string
}

// Obtener todas las cuentas bancarias
export async function obtenerCuentasBancarias(): Promise<NegocioBanco[]> {
    try {
        const cuentas = await prisma.negocioBanco.findMany({
            orderBy: [
                { principal: 'desc' },
                { createdAt: 'desc' }
            ]
        })

        return cuentas
    } catch (error) {
        console.error('Error obteniendo cuentas bancarias:', error)
        return []
    }
}

// Obtener cuenta bancaria principal
export async function obtenerCuentaPrincipal(): Promise<NegocioBanco | null> {
    try {
        const cuentaPrincipal = await prisma.negocioBanco.findFirst({
            where: {
                principal: true,
                status: 'active'
            }
        })

        return cuentaPrincipal
    } catch (error) {
        console.error('Error obteniendo cuenta principal:', error)
        return null
    }
}

// Crear nueva cuenta bancaria
export async function crearCuentaBancaria(data: CrearCuentaBancariaData) {
    try {
        // Obtener o crear el negocio
        let negocio = await prisma.negocio.findFirst()

        if (!negocio) {
            negocio = await prisma.negocio.create({
                data: {
                    nombre: 'Mi Negocio',
                    descripcion: 'Descripción del negocio'
                }
            })
        }

        // Si se marca como principal, desmarcar otras cuentas
        if (data.principal) {
            await prisma.negocioBanco.updateMany({
                where: { negocioId: negocio.id },
                data: { principal: false }
            })
        }

        const nuevaCuenta = await prisma.negocioBanco.create({
            data: {
                negocioId: negocio.id,
                banco: data.banco,
                beneficiario: data.beneficiario,
                clabe: data.clabe,
                cuenta: data.cuenta || null,
                sucursal: data.sucursal || null,
                principal: data.principal || false
            }
        })

        revalidatePath('/admin/configurar/cuenta-bancaria')

        return {
            success: true,
            data: nuevaCuenta,
            message: 'Cuenta bancaria creada exitosamente'
        }
    } catch (error) {
        console.error('Error creando cuenta bancaria:', error)
        return {
            success: false,
            message: 'Error al crear la cuenta bancaria'
        }
    }
}

// Actualizar cuenta bancaria
export async function actualizarCuentaBancaria(data: ActualizarCuentaBancariaData) {
    try {
        // Si se marca como principal, desmarcar otras cuentas
        if (data.principal) {
            await prisma.negocioBanco.updateMany({
                where: {
                    id: { not: data.id }
                },
                data: { principal: false }
            })
        }

        const cuentaActualizada = await prisma.negocioBanco.update({
            where: { id: data.id },
            data: {
                banco: data.banco,
                beneficiario: data.beneficiario,
                clabe: data.clabe,
                cuenta: data.cuenta || null,
                sucursal: data.sucursal || null,
                principal: data.principal || false
            }
        })

        revalidatePath('/admin/configurar/cuenta-bancaria')

        return {
            success: true,
            data: cuentaActualizada,
            message: 'Cuenta bancaria actualizada exitosamente'
        }
    } catch (error) {
        console.error('Error actualizando cuenta bancaria:', error)
        return {
            success: false,
            message: 'Error al actualizar la cuenta bancaria'
        }
    }
}

// Eliminar cuenta bancaria
export async function eliminarCuentaBancaria(id: string) {
    try {
        await prisma.negocioBanco.delete({
            where: { id }
        })

        revalidatePath('/admin/configurar/cuenta-bancaria')

        return {
            success: true,
            message: 'Cuenta bancaria eliminada exitosamente'
        }
    } catch (error) {
        console.error('Error eliminando cuenta bancaria:', error)
        return {
            success: false,
            message: 'Error al eliminar la cuenta bancaria'
        }
    }
}

// Cambiar estado de cuenta bancaria
export async function cambiarEstadoCuentaBancaria(id: string, status: string) {
    try {
        const cuentaActualizada = await prisma.negocioBanco.update({
            where: { id },
            data: { status }
        })

        revalidatePath('/admin/configurar/cuenta-bancaria')

        return {
            success: true,
            data: cuentaActualizada,
            message: `Cuenta bancaria ${status === 'active' ? 'activada' : 'desactivada'} exitosamente`
        }
    } catch (error) {
        console.error('Error cambiando estado de cuenta bancaria:', error)
        return {
            success: false,
            message: 'Error al cambiar el estado de la cuenta bancaria'
        }
    }
}

// Establecer cuenta como principal
export async function establecerCuentaPrincipal(id: string) {
    try {
        // Desmarcar todas las cuentas como principal
        await prisma.negocioBanco.updateMany({
            data: { principal: false }
        })

        // Marcar la cuenta seleccionada como principal
        const cuentaActualizada = await prisma.negocioBanco.update({
            where: { id },
            data: { principal: true }
        })

        revalidatePath('/admin/configurar/cuenta-bancaria')

        return {
            success: true,
            data: cuentaActualizada,
            message: 'Cuenta establecida como principal exitosamente'
        }
    } catch (error) {
        console.error('Error estableciendo cuenta principal:', error)
        return {
            success: false,
            message: 'Error al establecer cuenta principal'
        }
    }
}
