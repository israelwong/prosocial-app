// Ruta: app/admin/configurar/categorias/page.tsx

import { Metadata } from 'next';
import { obtenerCategorias } from '@/app/admin/_lib/actions/categorias/categorias.actions';
import CategoriasCliente from './components/CategoriasCliente';

export const metadata: Metadata = {
    title: 'Configurar Categorías de Servicio',
};

export default async function CategoriasPage() {
    const initialCategories = await obtenerCategorias();

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <CategoriasCliente initialCategories={initialCategories} />
        </div>
    );
}
