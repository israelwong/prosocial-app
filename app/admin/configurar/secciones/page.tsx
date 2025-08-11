// Ruta: app/admin/configurar/secciones/page.tsx

import { Metadata } from 'next';
import { obtenerSeccionesConCategorias, obtenerCategoriasHuerfanas } from '@/app/admin/_lib/actions/secciones/secciones.actions';
import SeccionesCliente from './components/SeccionesCliente';

export const metadata: Metadata = {
    title: 'Organizar Secciones y Categorías',
};

export default async function SeccionesPage() {
    // Obtenemos todos los datos necesarios en el servidor
    const [secciones, categoriasHuerfanas] = await Promise.all([
        obtenerSeccionesConCategorias(),
        obtenerCategoriasHuerfanas()
    ]);

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className='mb-6 pb-4 border-b border-zinc-700'>
                <h1 className="text-2xl font-semibold text-zinc-100">Organizador de Catálogo</h1>
                <p className="text-sm text-zinc-400 mt-1">Arrastra las categorías "Sin Asignar" a la sección que desees.</p>
            </div>
            <SeccionesCliente
                initialSecciones={secciones}
                initialCategoriasHuerfanas={categoriasHuerfanas}
            />
        </div>
    );
}
