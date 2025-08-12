// Ruta: app/admin/configurar/servicios/nuevo/page.tsx

import ServicioForm from '../components/ServicioForm';
import { obtenerCategorias } from '@/app/admin/_lib/actions/categorias/categorias.actions';
import { getGlobalConfiguracion } from '@/app/admin/_lib/actions/configuracion/configuracion.actions';

export default async function NuevoServicioPage() {
    // Obtenemos todos los datos necesarios en paralelo para mayor eficiencia
    const [categorias, configuracion] = await Promise.all([
        obtenerCategorias(),
        getGlobalConfiguracion()
    ]);
    return (
        <ServicioForm
            categorias={categorias}
            configuracion={configuracion}
        />
    );
}