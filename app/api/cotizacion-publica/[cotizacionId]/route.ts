import { NextRequest, NextResponse } from 'next/server'
import { obtenerCotizacionParaRedireccion } from '@/app/lib/cotizacion-publica.actions'

export async function GET(
    request: NextRequest,
    { params }: { params: { cotizacionId: string } }
) {
    try {
        const { cotizacionId } = params

        console.log('🔍 API: Consultando cotización pública:', cotizacionId)

        // Validar formato del ID
        if (!cotizacionId || typeof cotizacionId !== 'string') {
            return NextResponse.json(
                { error: 'ID de cotización inválido' },
                { status: 400 }
            )
        }

        // Obtener datos de la cotización
        const cotizacionData = await obtenerCotizacionParaRedireccion(cotizacionId)

        if (!cotizacionData) {
            return NextResponse.json(
                { error: 'Cotización no encontrada' },
                { status: 404 }
            )
        }

        console.log('✅ API: Datos obtenidos:', cotizacionData)

        return NextResponse.json({
            success: true,
            data: cotizacionData,
            // Datos específicos para redirección
            tieneAprobada: cotizacionData.tieneAprobada,
            eventoId: cotizacionData.eventoId
        })

    } catch (error) {
        console.error('❌ Error en API cotización pública:', error)
        return NextResponse.json(
            {
                error: 'Error interno del servidor',
                details: error instanceof Error ? error.message : 'Error desconocido'
            },
            { status: 500 }
        )
    }
}
