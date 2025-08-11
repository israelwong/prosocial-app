// Ruta: app/admin/configurar/condicionesComerciales/page.tsx

import { Metadata } from 'next';
import { obtenerCondicionesComerciales } from '@/app/admin/_lib/actions/condicionesComerciales/condicionesComerciales.actions';
import ListaCondicionesComercialesCliente from './components/ListaCondicionesComerciales';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Configurar Condiciones Comerciales',
};

export default async function CondicionesComercialesPage() {
    const condiciones = await obtenerCondicionesComerciales();

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className='flex justify-between items-center mb-6 pb-4 border-b border-zinc-700'>
                <h1 className="text-2xl font-semibold text-zinc-100">Condiciones Comerciales</h1>
                <Link href="/admin/configurar/condicionesComerciales/nueva"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">
                    Crear Condición
                </Link>
            </div>
            <ListaCondicionesComercialesCliente condiciones={condiciones} />
        </div>
    );
}
