import { NextRequest, NextResponse } from 'next/server'
import { obtenerCotizacionesParaEvento } from '@/app/admin/_lib/actions/cotizacion/cotizacion.actions'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ eventoId: string }> }
) {
    try {
        const { eventoId } = await params

        console.log('🔍 API: Obteniendo cotizaciones públicas para evento:', eventoId)

        if (!eventoId || typeof eventoId !== 'string') {
            return NextResponse.json(
                { error: 'ID de evento inválido' },
                { status: 400 }
            )
        }

        // Usar la función existente pero filtrar solo cotizaciones visibles
        const resultado = await obtenerCotizacionesParaEvento(eventoId)

        if ('error' in resultado) {
            return NextResponse.json(
                { error: resultado.error },
                { status: 404 }
            )
        }

        // Filtrar solo cotizaciones que el cliente puede ver
        const cotizacionesPublicas = (resultado.cotizaciones || [])
            .filter((cotizacion: any) =>
                cotizacion.status !== 'archivada' &&
                cotizacion.visible_cliente !== false
            )
            .map((cotizacion: any) => ({
                id: cotizacion.id,
                nombre: cotizacion.nombre,
                precio: cotizacion.precio,
                status: cotizacion.status
            }))

        console.log('✅ API: Cotizaciones públicas obtenidas:', cotizacionesPublicas.length)

        return NextResponse.json({
            success: true,
            cotizaciones: cotizacionesPublicas
        })

    } catch (error) {
        console.error('❌ Error en API cotizaciones públicas:', error)
        return NextResponse.json(
            {
                error: 'Error interno del servidor',
                details: error instanceof Error ? error.message : 'Error desconocido'
            },
            { status: 500 }
        )
    }
}
