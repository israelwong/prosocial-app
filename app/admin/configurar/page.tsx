import { redirect } from 'next/navigation';
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Configurar',
    description: 'Configurar usuarios',
}

export default function ConfigurarIndexRedirect() {
    redirect('/admin/configurar/paquetes');
}
