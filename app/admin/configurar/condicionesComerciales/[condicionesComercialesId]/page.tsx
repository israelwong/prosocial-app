
// Ruta: app/admin/configurar/condicionesComerciales/[condicionesComercialesId]/page.tsx

import { obtenerCondicionComercial } from '@/app/admin/_lib/actions/condicionesComerciales/condicionesComerciales.actions';
import { obtenerMetodosPago } from '@/app/admin/_lib/actions/metodoPago/metodoPago.actions';
import CondicionComercialForm from '../components/CondicionComercialForm';
import { notFound } from 'next/navigation';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editar Condición Comercial',
};

interface PageProps { params: Promise<{ condicionesComercialesId: string }> }

export default async function EditarCondicionComercialPage({ params }: PageProps) {
  const { condicionesComercialesId } = await params;

  // Obtenemos tanto la condición a editar como la lista total de métodos de pago
  const [condicion, metodosPagoDisponibles] = await Promise.all([
    obtenerCondicionComercial(condicionesComercialesId),
    obtenerMetodosPago()
  ]);

  if (!condicion) {
    notFound();
  }

  return <CondicionComercialForm condicion={condicion} metodosPagoDisponibles={metodosPagoDisponibles} />;
}
