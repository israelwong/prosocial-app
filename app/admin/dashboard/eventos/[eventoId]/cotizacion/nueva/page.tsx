import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
    title: 'Crear Cotización',
}

interface PageProps {
    params: Promise<{ eventoId: string }>;
    searchParams: Promise<{
        tipoEventoId?: string;
        paqueteId?: string;
    }>;
}

export default async function NuevaCotizacionPage({ params, searchParams }: PageProps) {
    const { eventoId } = await params;
    const { tipoEventoId, paqueteId } = await searchParams;

    // Construir parámetros de consulta para la redirección
    const queryParams = new URLSearchParams();
    if (tipoEventoId) queryParams.set('tipoEventoId', tipoEventoId);
    if (paqueteId) queryParams.set('paqueteId', paqueteId);

    // Redirigir a la página principal con parámetros
    const redirectUrl = `/admin/dashboard/eventos/${eventoId}/cotizacion${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    redirect(redirectUrl);
}
