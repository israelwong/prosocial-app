// Ruta: app/admin/configurar/condicionesComerciales/nueva/page.tsx

import CondicionComercialForm from '../components/CondicionComercialForm';
import { obtenerMetodosPago } from '@/app/admin/_lib/actions/metodoPago/metodoPago.actions';

export default async function NuevaCondicionComercialPage() {
    const metodosPagoDisponibles = await obtenerMetodosPago();
    return <CondicionComercialForm metodosPagoDisponibles={metodosPagoDisponibles} />;
}