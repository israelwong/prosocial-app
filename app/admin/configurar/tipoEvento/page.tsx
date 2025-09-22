// Ruta: app/admin/configurar/tipoEvento/page.tsx

import { Metadata } from 'next';
import { obtenerTiposEvento } from '@/app/admin/_lib/actions/evento/tipo/eventoTipo.actions';
import TiposEventoCliente from './components/TiposEventoCliente';

export const metadata: Metadata = {
    title: 'Configurar Tipos de Evento',
};

export default async function TiposEventoPage() {
    const initialItems = await obtenerTiposEvento();

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <TiposEventoCliente initialItems={initialItems} />
        </div>
    );
}
