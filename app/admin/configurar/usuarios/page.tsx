// Ruta: app/admin/configurar/usuarios/page.tsx

import { Metadata } from 'next';
import { obtenerUsuarios } from '@/app/admin/_lib/actions/usuarios/usuarios.actions';
import UsuariosCliente from './components/UsuariosCliente';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Configurar Usuarios',
};

export default async function UsuariosPage() {
    const usuarios = await obtenerUsuarios();

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className='flex justify-between items-center mb-6 pb-4 border-b border-zinc-700'>
                <h1 className="text-2xl font-semibold text-zinc-100">Usuarios del Sistema</h1>
                <Link href="/admin/configurar/usuarios/nuevo"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">
                    Registrar Usuario
                </Link>
            </div>
            <UsuariosCliente initialUsuarios={usuarios} />
        </div>
    );
}
