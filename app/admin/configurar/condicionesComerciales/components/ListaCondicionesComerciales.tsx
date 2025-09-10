// Ruta: app/admin/configurar/condicionesComerciales/components/ListaCondicionesComercialesCliente.tsx

'use client';

import { type CondicionesComerciales } from '@prisma/client';
import { useRouter } from 'next/navigation';

// Tipo extendido que incluye las relaciones con métodos de pago
type CondicionExtendida = CondicionesComerciales & {
    CondicionesComercialesMetodoPago: {
        MetodoPago: {
            id: string;
            metodo_pago: string;
        };
    }[];
};

interface Props {
    condiciones: CondicionExtendida[];
}

export default function ListaCondicionesComercialesCliente({ condiciones }: Props) {
    const router = useRouter();

    return (
        <div className="border border-zinc-700 rounded-lg overflow-hidden">
            <table className="min-w-full bg-zinc-800 text-sm">
                <thead className="bg-zinc-900/50">
                    <tr className="text-zinc-400">
                        <th className="py-3 px-4 text-left font-medium">Nombre</th>
                        <th className="py-3 px-4 text-center font-medium">Anticipo</th>
                        <th className="py-3 px-4 text-center font-medium">Descuento</th>
                        <th className="py-3 px-4 text-left font-medium">Métodos de Pago</th>
                        <th className="py-3 px-4 text-center font-medium">Estado</th>
                        <th className="py-3 px-4 text-right font-medium">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700">
                    {condiciones.map((condicion) => (
                        <tr key={condicion.id} className="hover:bg-zinc-700/50 text-zinc-300">
                            <td className="py-3 px-4 font-medium">{condicion.nombre}</td>
                            <td className="py-3 px-4 text-center">{condicion.porcentaje_anticipo ? `${condicion.porcentaje_anticipo}%` : 'N/A'}</td>
                            <td className="py-3 px-4 text-center">{condicion.descuento ? `${condicion.descuento}%` : 'N/A'}</td>
                            <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                    {condicion.CondicionesComercialesMetodoPago.map((relacion) => (
                                        <span
                                            key={relacion.MetodoPago.id}
                                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-900/30 text-blue-300 border border-blue-700/50"
                                        >
                                            {relacion.MetodoPago.metodo_pago}
                                        </span>
                                    ))}
                                    {condicion.CondicionesComercialesMetodoPago.length === 0 && (
                                        <span className="text-zinc-500 text-xs">Sin métodos asignados</span>
                                    )}
                                </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                                <span className={`h-2.5 w-2.5 rounded-full inline-block ${condicion.status === 'active' ? 'bg-green-500' : 'bg-zinc-500'}`}></span>
                            </td>
                            <td className="py-3 px-4 text-right">
                                <button
                                    onClick={() => router.push(`/admin/configurar/condicionesComerciales/${condicion.id}`)}
                                    className="px-3 py-1 rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs font-medium"
                                >
                                    Editar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {condiciones.length === 0 && (
                <p className="text-center text-zinc-500 py-10">
                    No hay condiciones comerciales definidas.
                </p>
            )}
        </div>
    );
}
