import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/admin/_lib/prismaClient'
import { verifyToken } from '@/app/lib/auth'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ eventoId: string }> }
) {
    try {
        // Obtener token de las cookies
        const token = request.cookies.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Token no encontrado' },
                { status: 401 }
            )
        }

        // Verificar el token
        const authResult = await verifyToken(token)

        if (!authResult.status || !authResult.payload) {
            return NextResponse.json(
                { success: false, message: 'Token inválido' },
                { status: 401 }
            )
        }

        const userId = authResult.payload.id

        const { eventoId } = await params

        // Verificar que el evento existe y no está asignado
        const evento = await prisma.evento.findUnique({
            where: { id: eventoId },
            include: {
                Cliente: true,
                EventoTipo: true
            }
        })

        if (!evento) {
            return NextResponse.json(
                { success: false, message: 'Evento no encontrado' },
                { status: 404 }
            )
        }

        if (evento.userId) {
            return NextResponse.json(
                { success: false, message: 'Este evento ya está asignado a otro usuario' },
                { status: 400 }
            )
        }

        // Obtener información del usuario para la bitácora
        const usuario = await prisma.user.findUnique({
            where: { id: userId },
            select: { username: true, email: true }
        })

        // Asignar el evento al usuario actual
        const eventoActualizado = await prisma.evento.update({
            where: { id: eventoId },
            data: {
                userId: userId,
                updatedAt: new Date()
            }
        })

        // Crear entrada en bitácora con nombre del agente
        await prisma.eventoBitacora.create({
            data: {
                eventoId: eventoId,
                comentario: `👤 Prospecto tomado por agente ${usuario?.username || 'Usuario desconocido'}. Evento asignado para seguimiento y creación de cotizaciones.`,
                importancia: 'media',
                status: 'active'
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Prospecto asignado exitosamente',
            eventoId: eventoId,
            userId: userId
        })

    } catch (error) {
        console.error('Error asignando evento:', error)
        return NextResponse.json(
            { success: false, message: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

// Endpoint para desasignar (opcional)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ eventoId: string }> }
) {
    try {
        // Obtener token de las cookies
        const token = request.cookies.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Token no encontrado' },
                { status: 401 }
            )
        }

        // Verificar el token
        const authResult = await verifyToken(token)

        if (!authResult.status || !authResult.payload) {
            return NextResponse.json(
                { success: false, message: 'Token inválido' },
                { status: 401 }
            )
        }

        const userId = authResult.payload.id

        const { eventoId } = await params

        // Verificar que el evento existe y está asignado al usuario actual
        const evento = await prisma.evento.findUnique({
            where: { id: eventoId }
        })

        if (!evento) {
            return NextResponse.json(
                { success: false, message: 'Evento no encontrado' },
                { status: 404 }
            )
        }

        if (evento.userId !== userId) {
            return NextResponse.json(
                { success: false, message: 'Solo puedes desasignar eventos que te pertenecen' },
                { status: 403 }
            )
        }

        // Obtener información del usuario para la bitácora
        const usuario = await prisma.user.findUnique({
            where: { id: userId },
            select: { username: true, email: true }
        })

        // Desasignar el evento
        await prisma.evento.update({
            where: { id: eventoId },
            data: {
                userId: null,
                updatedAt: new Date()
            }
        })

        // Crear entrada en bitácora con nombre del agente
        await prisma.eventoBitacora.create({
            data: {
                eventoId: eventoId,
                comentario: `🔄 Prospecto liberado por agente ${usuario?.username || 'Usuario desconocido'}. Evento disponible para reasignación.`,
                importancia: 'baja',
                status: 'active'
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Evento desasignado exitosamente'
        })

    } catch (error) {
        console.error('Error desasignando evento:', error)
        return NextResponse.json(
            { success: false, message: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
