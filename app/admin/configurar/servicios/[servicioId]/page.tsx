// Ruta: app/admin/configurar/servicios/[servicioId]/page.tsx

import ServicioForm from '../components/ServicioForm';
import { obtenerServicio } from '@/app/admin/_lib/actions/servicios/servicios.actions';
import { obtenerCategorias } from '@/app/admin/_lib/actions/categorias/categorias.actions';
import { getGlobalConfiguracion } from '@/app/admin/_lib/actions/configuracion/configuracion.actions';
import { notFound } from 'next/navigation';

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Editar Servicio',
    description: 'Página para editar un servicio existente',
};

export default async function EditarServicioPage({ params }: { params: Promise<{ servicioId: string }> }) {
    const { servicioId } = await params;

    const [servicio, categorias, configuracion] = await Promise.all([
        obtenerServicio(servicioId),
        obtenerCategorias(),
        getGlobalConfiguracion()
    ]);

    if (!servicio) notFound();

    return <ServicioForm servicio={servicio} categorias={categorias} configuracion={configuracion} />;
}