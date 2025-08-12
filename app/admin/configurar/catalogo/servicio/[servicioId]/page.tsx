import ServicioForm from '../../servicio/components/ServicioForm';
import { obtenerServicio } from '@/app/admin/_lib/actions/servicios/servicios.actions';
import { obtenerCategorias } from '@/app/admin/_lib/actions/categorias/categorias.actions';
import { getGlobalConfiguracion } from '@/app/admin/_lib/actions/configuracion/configuracion.actions';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Editar Servicio',
    description: 'Página para editar un servicio existente en el catálogo',
};

export default async function EditarServicioCatalogoPage({ params }: { params: Promise<{ servicioId: string }> }) {
    const { servicioId } = await params;
    const [servicio, categorias, configuracion] = await Promise.all([
        obtenerServicio(servicioId),
        obtenerCategorias(),
        getGlobalConfiguracion()
    ]);
    if (!servicio) return notFound();
    return <ServicioForm servicio={servicio} categorias={categorias} configuracion={configuracion} />;
}
