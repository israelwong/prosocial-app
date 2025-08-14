import CategoriaForm from '../components/CategoriaForm';
import { notFound } from 'next/navigation';

interface Props {
    searchParams: Promise<{ seccionId?: string }>
}

export default async function NuevaCategoriaPage({ searchParams }: Props) {
    const params = await searchParams;
    const seccionId = params?.seccionId;
    if (!seccionId) return notFound();
    return <CategoriaForm seccionId={seccionId} />;
}
