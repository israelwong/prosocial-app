import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/admin/_lib/prismaClient'

export async function POST(request: NextRequest) {
    try {
        const { email, codigoEvento } = await request.json()

        // Validaciones básicas
        if (!email || !codigoEvento) {
            return NextResponse.json(
                { message: 'Email y código de evento son requeridos' },
                { status: 400 }
            )
        }

        // Buscar cliente por email
        const cliente = await prisma.cliente.findFirst({
            where: {
                email: email.toLowerCase()
            }
        })

        if (!cliente) {
            return NextResponse.json(
                { message: 'Email no encontrado en nuestros registros' },
                { status: 401 }
            )
        }

        // Buscar eventos del cliente que estén contratados
        const eventosContratados = await prisma.evento.findMany({
            where: {
                clienteId: cliente.id,
                status: 'contratado'
            },
            include: {
                EventoTipo: true,
                Cliente: {
                    select: {
                        nombre: true,
                        email: true,
                        telefono: true
                    }
                }
            }
        })

        if (eventosContratados.length === 0) {
            return NextResponse.json(
                { message: 'No tienes eventos contratados en este momento' },
                { status: 404 }
            )
        }

        // Verificar código de evento (por simplicidad, usamos el ID del primer evento + año)
        // En producción esto debería ser un sistema más seguro
        const codigoValido = eventosContratados.some(evento => {
            const codigoGenerado = `${evento.id.slice(-4).toUpperCase()}${new Date(evento.fecha_evento).getFullYear()}`
            return codigoGenerado === codigoEvento.toUpperCase()
        })

        if (!codigoValido) {
            return NextResponse.json(
                { message: 'Código de evento incorrecto' },
                { status: 401 }
            )
        }

        // Login exitoso - retornar información básica
        return NextResponse.json({
            success: true,
            cliente: {
                nombre: cliente.nombre,
                email: cliente.email
            },
            eventosId: eventosContratados.map(e => e.id),
            message: 'Login exitoso'
        })

    } catch (error) {
        console.error('Error en login de cliente:', error)
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
