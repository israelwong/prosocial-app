import { obtenerEventosSeguimientoPorEtapa } from '@/app/admin/_lib/actions/seguimiento';

export default async function TestSeguimientoPage() {
    const eventosPorEtapa = await obtenerEventosSeguimientoPorEtapa();

    return (
        <div className="p-6 text-white bg-black min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Test Seguimiento - Datos Reales</h1>

            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-semibold mb-2">Eventos por Etapa:</h2>
                    <pre className="bg-zinc-800 p-4 rounded overflow-auto text-sm">
                        {JSON.stringify(eventosPorEtapa, null, 2)}
                    </pre>
                </div>

                <div>
                    <h2 className="text-lg font-semibold mb-2">Conteo por Etapa:</h2>
                    <div className="bg-zinc-800 p-4 rounded">
                        {Object.entries(eventosPorEtapa).map(([etapa, eventos]) => (
                            <div key={etapa} className="mb-2">
                                <span className="font-bold text-yellow-400">{etapa}:</span> {eventos.length} eventos
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
