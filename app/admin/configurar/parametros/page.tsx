// app/admin/configurar/parametros/page.tsx

import { Metadata } from 'next';
import { getGlobalConfiguracion } from '@/app/admin/_lib/actions/configuracion/configuracion.actions';
import ConfiguracionForm from './components/ConfiguracionForm';

export const metadata: Metadata = {
    title: 'Parámetros Base',
};

// Convertimos la página en un componente asíncrono para usar Server Components
export default async function ParametrosPage() {

    // 1. Obtenemos la configuración en el servidor.
    const configuracion = await getGlobalConfiguracion();

    // 2. Pasamos los datos a nuestro nuevo formulario, que es un Client Component.
    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <ConfiguracionForm config={configuracion} />
        </div>
    );
}