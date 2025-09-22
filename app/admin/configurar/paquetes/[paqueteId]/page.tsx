// Ruta: app/admin/configurar/paquetes/[paqueteId]/page.tsx

import PaqueteForm from '../components/PaqueteForm';
import { obtenerPaquete } from '@/app/admin/_lib/actions/paquetes/paquetes.actions';
import { obtenerTiposEvento } from '@/app/admin/_lib/actions/evento/tipo/eventoTipo.actions';
import { obtenerServiciosPorCategoria } from '@/app/admin/_lib/actions/servicios/servicios.actions'; // fallback
import { obtenerCatalogoCompleto } from '@/app/admin/_lib/actions/catalogo/catalogo.actions';
import { getGlobalConfiguracion } from '@/app/admin/_lib/actions/configuracion/configuracion.actions';
import { obtenerMetodosPago } from '@/app/admin/_lib/actions/metodoPago/metodoPago.actions';
import prisma from '@/app/admin/_lib/prismaClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Editar Paquete',
    description: 'Página para editar un paquete existente',
};

export default async function EditarPaquetePage({ params }: { params: Promise<{ paqueteId: string }> }) {
    const { paqueteId } = await params;

    // Obtenemos todos los datos, incluyendo la configuración
    const [paquete, tiposEvento, serviciosDisponibles, catalogo, configuracion, condiciones, metodosPago] = await Promise.all([
        obtenerPaquete(paqueteId),
        obtenerTiposEvento(),
        obtenerServiciosPorCategoria(), // legacy
        obtenerCatalogoCompleto(),
        getGlobalConfiguracion(),
        prisma.condicionesComerciales.findMany({
            where: { status: 'active' },
            orderBy: { orden: 'asc' },
            include: { CondicionesComercialesMetodoPago: { select: { metodoPagoId: true } } }
        }),
        obtenerMetodosPago()
    ]);

    if (!paquete) {
        notFound();
    }

    // Obtener el nombre del tipo de evento para mostrar en la cabecera
    const tipoEventoNombre = tiposEvento.find(tipo => tipo.id === paquete.eventoTipoId)?.nombre;

    // Pasamos la configuración como prop al formulario
    return (
        <PaqueteForm
            paquete={paquete}
            tiposEvento={tiposEvento}
            tipoEventoNombre={tipoEventoNombre}
            serviciosDisponibles={serviciosDisponibles}
            catalogo={catalogo as any}
            configuracion={configuracion}
            condiciones={condiciones as any}
            metodosPago={metodosPago as any}
        />
    );
}