import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/admin/_lib/prismaClient'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { eventoId, comentario, mensaje, importancia = '2' } = body

        console.log('📝 Nueva nota de bitácora:', {
            eventoId,
            comentario: comentario || mensaje,
            importancia
        })

        // Usar comentario o mensaje (compatibilidad)
        const textoComentario = comentario || mensaje

        // Validar datos requeridos
        if (!eventoId || !textoComentario) {
            return NextResponse.json(
                { error: 'Datos requeridos: eventoId, comentario/mensaje' },
                { status: 400 }
            )
        }

        // Verificar que el evento existe
        const evento = await prisma.evento.findUnique({
            where: { id: eventoId }
        })

        if (!evento) {
            return NextResponse.json(
                { error: 'Evento no encontrado' },
                { status: 404 }
            )
        }

        // Crear la entrada de bitácora
        const bitacora = await prisma.eventoBitacora.create({
            data: {
                eventoId: eventoId,
                comentario: textoComentario,
                importancia: importancia,
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        })

        console.log('✅ Nota de bitácora creada:', bitacora.id)

        return NextResponse.json({
            success: true,
            message: 'Nota agregada a bitácora exitosamente',
            bitacoraId: bitacora.id
        })

    } catch (error) {
        console.error('❌ Error al agregar nota a bitácora:', error)
        return NextResponse.json(
            {
                error: 'Error interno del servidor',
                details: error instanceof Error ? error.message : 'Error desconocido'
            },
            { status: 500 }
        )
    }
}
