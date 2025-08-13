import { obtenerSeccion } from '@/app/admin/_lib/actions/secciones/secciones.actions';
import SeccionForm from '../components/SeccionForm';
import { notFound } from 'next/navigation';

interface Props { params: Promise<{ seccionId: string }> }

export default async function EditarSeccionPage({ params }: Props) {
    const { seccionId } = await params;
    const seccion = await obtenerSeccion(seccionId);
    if (!seccion) return notFound();
    return <SeccionForm seccion={seccion} />;
}
