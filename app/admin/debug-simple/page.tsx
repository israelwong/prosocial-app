import prisma from '@/app/admin/_lib/prismaClient';

export default async function DebugSimplePage() {
    // 1. Todas las etapas
    const etapas = await prisma.eventoEtapa.findMany({
        orderBy: { posicion: 'asc' }
    });

    // 2. Todos los eventos con cotizaciones
    const eventos = await prisma.evento.findMany({
        include: {
            EventoEtapa: true,
            Cliente: true,
            Cotizacion: {
                include: {
                    Pago: true
                }
            }
        },
        take: 3
    });

    return (
        <div className="p-6 text-white bg-black min-h-screen font-mono text-sm">
            <h1 className="text-xl font-bold mb-4">Debug Simple</h1>

            <div className="space-y-4">
                <div>
                    <h2 className="font-bold text-yellow-400 mb-2">ETAPAS:</h2>
                    {etapas.map(etapa => (
                        <div key={etapa.id} className="ml-4">
                            {etapa.posicion}. {etapa.nombre} (ID: {etapa.id})
                        </div>
                    ))}
                </div>

                <div>
                    <h2 className="font-bold text-yellow-400 mb-2">EVENTOS (muestra):</h2>
                    {eventos.map(evento => (
                        <div key={evento.id} className="ml-4 mb-4 p-3 bg-zinc-800 rounded">
                            <div><strong>Nombre:</strong> {evento.nombre}</div>
                            <div><strong>Cliente:</strong> {evento.Cliente.nombre}</div>
                            <div><strong>Status:</strong> {evento.status}</div>
                            <div><strong>Etapa:</strong> {evento.EventoEtapa?.nombre || 'Sin etapa'}</div>
                            <div><strong>Cotizaciones:</strong></div>
                            {evento.Cotizacion.map(cot => (
                                <div key={cot.id} className="ml-6">
                                    - Status: {cot.status}, Pagos: {cot.Pago.length}
                                    {cot.Pago.map(pago => (
                                        <div key={pago.id} className="ml-8 text-xs">
                                            ${pago.monto} - {pago.status}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
