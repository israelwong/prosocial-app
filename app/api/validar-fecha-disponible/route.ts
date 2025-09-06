import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/admin/_lib/prismaClient'
import { AGENDA_STATUS } from '@/app/admin/_lib/constants/status'

export async function POST(request: NextRequest) {
    try {
        const { fecha } = await request.json()

        if (!fecha) {
            return NextResponse.json(
                { success: false, message: 'Fecha requerida' },
                { status: 400 }
            )
        }

        // Convertir fecha a objeto Date
        const fechaEvento = new Date(fecha)

        // Verificar si hay eventos confirmados o completados en esa fecha
        const eventosEnFecha = await prisma.agenda.count({
            where: {
                fecha: {
                    gte: new Date(fechaEvento.setHours(0, 0, 0, 0)),
                    lt: new Date(fechaEvento.setHours(23, 59, 59, 999))
                },
                status: {
                    in: [AGENDA_STATUS.CONFIRMADO, AGENDA_STATUS.COMPLETADO]
                }
            }
        })

        // Si hay eventos confirmados o completados, la fecha no está disponible
        const available = eventosEnFecha === 0

        return NextResponse.json({
            success: true,
            available,
            message: available
                ? 'Fecha disponible'
                : 'La fecha seleccionada ya tiene eventos confirmados',
            debug: {
                eventosEncontrados: eventosEnFecha,
                statusBuscados: [AGENDA_STATUS.CONFIRMADO, AGENDA_STATUS.COMPLETADO]
            }
        })

    } catch (error) {
        console.error('Error validando fecha:', error)
        return NextResponse.json(
            { success: false, message: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
