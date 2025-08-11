// Ruta: app/admin/configurar/usuarios/[usuarioId]/page.tsx

import { obtenerUsuario } from '@/app/admin/_lib/actions/usuarios/usuarios.actions';
import UsuarioForm from '../components/UsuarioForm';
import { notFound } from 'next/navigation';

export default async function EditarUsuarioPage({ params }: { params: Promise<{ usuarioId: string }> }) {
    const { usuarioId } = await params;
    const usuario = await obtenerUsuario(usuarioId);

    if (!usuario) {
        notFound();
    }

    return <UsuarioForm usuario={usuario} />;
}
