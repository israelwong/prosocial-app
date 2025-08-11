// Ruta: app/admin/configurar/servicios/page.tsx

import { Metadata } from 'next';
import { obtenerServiciosPorCategoria } from '@/app/admin/_lib/actions/servicios/servicios.actions';
import ServiciosCliente from './components/ServiciosCliente';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Configurar Servicios',
};

export default async function ServiciosPage() {
    const categoriasConServicios = await obtenerServiciosPorCategoria();

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className='flex justify-between items-center mb-6 pb-4 border-b border-zinc-700'>
                <h1 className="text-2xl font-semibold text-zinc-100">Catálogo de Servicios</h1>
                <Link href="/admin/configurar/servicios/nuevo"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">
                    Crear Servicio
                </Link>
            </div>
            <ServiciosCliente initialData={categoriasConServicios} />
        </div>
    );
}
