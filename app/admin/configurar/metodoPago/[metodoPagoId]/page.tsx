// Ruta: app/admin/configurar/metodoPago/[metodoPagoId]/page.tsx

import { obtenerMetodoPago } from '@/app/admin/_lib/actions/metodoPago/metodoPago.actions';
import MetodoPagoForm from '../components/MetodoPagoForm';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Editar Método de Pago',
};

interface PageProps {
    metodoPagoId: string;
}

export default async function page({ params }: { params: Promise<{ metodoPagoId: string }> }) {
    const { metodoPagoId } = await params;
    const metodo = await obtenerMetodoPago(metodoPagoId);

    if (!metodo) {
        notFound();
    }

    // Renderiza el formulario en modo "edición" pasándole los datos del método.
    return <MetodoPagoForm metodo={metodo} />;
}
