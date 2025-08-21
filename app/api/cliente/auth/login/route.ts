import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/admin/_lib/prismaClient';

export async function POST(request: NextRequest) {
    try {
        const { email, telefono } = await request.json()

        // Validar que se proporcione al menos uno
        if (!email && !telefono) {
            return NextResponse.json(
                { message: 'Por favor proporciona email o teléfono' },
                { status: 400 }
            )
        }

        // Buscar cliente por email o teléfono
        const whereCondition: any = {}
        if (email) whereCondition.email = email
        if (telefono) whereCondition.telefono = telefono

        const cliente = await prisma.cliente.findFirst({
            where: whereCondition,
            include: {
                Evento: {
                    include: {
                        Cotizacion: {
                            where: {
                                status: 'aprobada'
                            }
                        }
                    }
                }
            }
        })

        if (!cliente) {
            return NextResponse.json(
                { message: 'No se encontró un cliente con estos datos' },
                { status: 404 }
            )
        }

        // Verificar que tenga al menos un evento con cotización aprobada
        const eventosConCotizacionAprobada = cliente.Evento.filter(
            evento => evento.Cotizacion.length > 0
        )

        if (eventosConCotizacionAprobada.length === 0) {
            return NextResponse.json(
                { message: 'No tienes eventos con cotizaciones aprobadas disponibles' },
                { status: 403 }
            )
        }

        // Verificar si ya tiene contraseña configurada
        const hasPassword = !!cliente.passwordHash

        // Actualizar último login
        await prisma.cliente.update({
            where: { id: cliente.id },
            data: { lastLogin: new Date() }
        })

        return NextResponse.json({
            success: true,
            hasPassword,
            cliente: {
                id: cliente.id,
                nombre: cliente.nombre,
                email: cliente.email,
                telefono: cliente.telefono
            },
            message: hasPassword
                ? 'Cliente verificado, proceder con login'
                : 'Cliente verificado, requiere configuración inicial'
        })

    } catch (error) {
        console.error('Error en login de cliente:', error)
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
