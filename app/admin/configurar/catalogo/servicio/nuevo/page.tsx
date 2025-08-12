import ServicioForm from '../components/ServicioForm';
import { obtenerCategorias } from '@/app/admin/_lib/actions/categorias/categorias.actions';
import { getGlobalConfiguracion } from '@/app/admin/_lib/actions/configuracion/configuracion.actions';
import { notFound } from 'next/navigation';

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Nuevo Servicio',
    description: 'Página para crear un nuevo servicio en el catálogo',
};

interface NuevoProps {
    searchParams: Promise<{ categoriaId?: string }>;
}

export default async function NuevoServicioCatalogoPage({ searchParams }: NuevoProps) {
    const { categoriaId } = await searchParams;
    const [categorias, configuracion] = await Promise.all([
        obtenerCategorias(),
        getGlobalConfiguracion()
    ]);
    if (categoriaId && !categorias.find(c => c.id === categoriaId)) return notFound();
    // Reutilizamos el formulario original; este no soporta prop directa de categoría preseleccionada,
    // así que lo ajustaremos pasando un valor initial via categorias (el usuario puede seguir cambiando).
    // Alternativa: clonar el componente y añadir defaultValue, pero mantenemos simple.
    return <ServicioForm categorias={categorias} configuracion={configuracion} initialCategoriaId={categoriaId} />;
}
