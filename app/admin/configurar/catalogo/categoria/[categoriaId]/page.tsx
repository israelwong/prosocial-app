import { obtenerCategoria } from '@/app/admin/_lib/actions/catalogo/catalogo.actions';
import CategoriaForm from '../../categoria/components/CategoriaForm';
import { notFound } from 'next/navigation';

export default async function EditarCategoriaPage({ params }: { params: { categoriaId: string } }) {
    const categoria = await obtenerCategoria(params.categoriaId);
    if (!categoria) return notFound();
    return <CategoriaForm categoria={categoria} />;
}
