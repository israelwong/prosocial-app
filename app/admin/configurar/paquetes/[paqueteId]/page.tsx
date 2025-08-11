// Ruta: app/admin/configurar/paquetes/[paqueteId]/page.tsx

import PaqueteForm from '../components/PaqueteForm';
import { obtenerPaquete } from '@/app/admin/_lib/actions/paquetes/paquetes.actions';
import { obtenerTiposEvento } from '@/app/admin/_lib/actions/eventoTipo/eventoTipo.actions';
import { obtenerServiciosPorCategoria } from '@/app/admin/_lib/actions/servicios/servicios.actions';
import { getGlobalConfiguracion } from '@/app/admin/_lib/actions/configuracion/configuracion.actions';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Editar Paquete',
    description: 'Página para editar un paquete existente',
};

export default async function EditarPaquetePage({ params }: { params: Promise<{ paqueteId: string }> }) {
    const { paqueteId } = await params;

    // Obtenemos todos los datos, incluyendo la configuración
    const [paquete, tiposEvento, serviciosDisponibles, configuracion] = await Promise.all([
        obtenerPaquete(paqueteId),
        obtenerTiposEvento(),
        obtenerServiciosPorCategoria(),
        getGlobalConfiguracion()
    ]);

    if (!paquete) {
        notFound();
    }

    // Pasamos la configuración como prop al formulario
    return (
        <PaqueteForm
            paquete={paquete}
            tiposEvento={tiposEvento}
            serviciosDisponibles={serviciosDisponibles}
            configuracion={configuracion}
        />
    );
}