// Ruta: app/admin/configurar/metodoPago/page.tsx

import { Metadata } from 'next';
import { obtenerMetodosPago } from '@/app/admin/_lib/actions/metodoPago/metodoPago.actions';
import ListaMetodosPagoCliente from './components/ListaMetodosPagoCliente';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Configurar Métodos de Pago',
};

// Esta página ahora es un Server Component que obtiene los datos.
export default async function MetodosPagoPage() {

    const metodosPago = await obtenerMetodosPago();

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className='flex justify-between items-center mb-6 pb-4 border-b border-zinc-700'>
                <h1 className="text-2xl font-semibold text-zinc-100">Métodos de Pago</h1>
                <Link href="/admin/configurar/metodoPago/nuevo"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">
                    Agregar Método
                </Link>
            </div>

            <div className='text-zinc-400 mb-6 text-sm space-y-1'>
                <p>Define los métodos de pago y sus comisiones para calcular automáticamente los cargos en la pasarela de pago.</p>
            </div>

            <ListaMetodosPagoCliente metodosPago={metodosPago} />
        </div>
    );
}
