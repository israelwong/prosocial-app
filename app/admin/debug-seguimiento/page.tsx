import { debugEventosSeguimiento } from '@/app/admin/_lib/actions/seguimiento/debug.actions';

export default async function DebugPage() {
    const datos = await debugEventosSeguimiento();

    return (
        <div className="p-6 text-white bg-black min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Debug Seguimiento</h1>

            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-semibold mb-2">Etapas Disponibles:</h2>
                    <pre className="bg-zinc-800 p-4 rounded overflow-auto text-sm">
                        {JSON.stringify(datos.etapas, null, 2)}
                    </pre>
                </div>

                <div>
                    <h2 className="text-lg font-semibold mb-2">Etapas Buscadas:</h2>
                    <pre className="bg-zinc-800 p-4 rounded overflow-auto text-sm">
                        {JSON.stringify(datos.etapasBuscadas, null, 2)}
                    </pre>
                </div>

                <div>
                    <h2 className="text-lg font-semibold mb-2">Eventos en Etapas (sin filtro status):</h2>
                    <pre className="bg-zinc-800 p-4 rounded overflow-auto text-sm">
                        {JSON.stringify(datos.eventosEnEtapas, null, 2)}
                    </pre>
                </div>

                <div>
                    <h2 className="text-lg font-semibold mb-2">Eventos con Cotización Aprobada:</h2>
                    <pre className="bg-zinc-800 p-4 rounded overflow-auto text-sm">
                        {JSON.stringify(datos.eventosConCotizacionAprobada, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
