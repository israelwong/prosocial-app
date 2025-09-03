import { NextResponse } from 'next/server';
import { obtenerNegocio, obtenerRedesSociales } from '@/app/admin/_lib/actions/negocio/negocio.actions';

export async function GET() {
    try {
        const [negocio, redesSociales] = await Promise.all([
            obtenerNegocio(),
            obtenerRedesSociales()
        ]);

        return NextResponse.json({
            negocio,
            redesSociales
        });
    } catch (error) {
        console.error('Error al obtener información del negocio:', error);
        return NextResponse.json(
            { error: 'Error al obtener información del negocio' },
            { status: 500 }
        );
    }
}
