import CategoriaForm from '../components/CategoriaForm';
import { notFound } from 'next/navigation';

export default function NuevaCategoriaPage({ searchParams }: { searchParams: { seccionId?: string } }) {
    const seccionId = searchParams?.seccionId;
    if (!seccionId) return notFound();
    return <CategoriaForm seccionId={seccionId} />;
}
