// Ruta: app/admin/configurar/paquetes/page.tsx

import { Metadata } from 'next';
import { obtenerPaquetesAgrupados } from '@/app/admin/_lib/actions/paquetes/paquetes.actions';
import { obtenerTiposEvento } from '@/app/admin/_lib/actions/evento/tipo/eventoTipo.actions';
import PaquetesDashboard from './components/PaquetesDashboard';
import { getGlobalConfiguracion } from '@/app/admin/_lib/actions/configuracion/configuracion.actions';


export const metadata: Metadata = {
    title: 'Configurar Paquetes',
};

export default async function PaquetesPage() {
    const [grupos, tiposEvento, configuracion] = await Promise.all([
        obtenerPaquetesAgrupados(),
        obtenerTiposEvento(),
        getGlobalConfiguracion()
    ]);

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <PaquetesDashboard initialGrupos={grupos} tiposEvento={tiposEvento} configuracion={configuracion} />
        </div>
    );
}
