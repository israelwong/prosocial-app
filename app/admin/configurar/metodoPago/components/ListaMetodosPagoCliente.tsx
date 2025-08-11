// Ruta: app/admin/configurar/metodoPago/components/ListaMetodosPagoCliente.tsx

'use client';

import { type MetodoPago } from '@prisma/client';
import { useRouter } from 'next/navigation';

interface Props {
    metodosPago: MetodoPago[];
}

export default function ListaMetodosPagoCliente({ metodosPago }: Props) {
    const router = useRouter();

    return (
        <div className="border border-zinc-700 rounded-lg overflow-hidden">
            <table className="min-w-full bg-zinc-800 text-sm">
                <thead className="bg-zinc-900/50">
                    <tr className="text-zinc-400">
                        <th className="py-3 px-4 text-left font-medium">Método de Pago</th>
                        <th className="py-3 px-4 text-center font-medium">Stripe ID</th>
                        <th className="py-3 px-4 text-center font-medium">Comisión Base</th>
                        <th className="py-3 px-4 text-center font-medium">Comisión Fija</th>
                        <th className="py-3 px-4 text-center font-medium"># MSI</th>
                        <th className="py-3 px-4 text-center font-medium">Comisión MSI</th>
                        <th className="py-3 px-4 text-center font-medium">Estado</th>
                        <th className="py-3 px-4 text-right font-medium">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700">
                    {metodosPago.map((metodo) => (
                        <tr key={metodo.id} className="hover:bg-zinc-700/50 text-zinc-300">
                            <td className="py-3 px-4">{metodo.metodo_pago}</td>
                            <td className="py-3 px-4 text-center font-mono text-xs">{metodo.payment_method || 'N/A'}</td>
                            <td className="py-3 px-4 text-center">{metodo.comision_porcentaje_base ? `${metodo.comision_porcentaje_base}%` : 'N/A'}</td>
                            <td className="py-3 px-4 text-center">{metodo.comision_fija_monto ? `$${metodo.comision_fija_monto}` : 'N/A'}</td>
                            <td className="py-3 px-4 text-center">{metodo.num_msi || 'N/A'}</td>
                            <td className="py-3 px-4 text-center">{metodo.comision_msi_porcentaje ? `${metodo.comision_msi_porcentaje}%` : 'N/A'}</td>
                            <td className="py-3 px-4 text-center">
                                <span className={`h-2.5 w-2.5 rounded-full inline-block ${metodo.status === 'active' ? 'bg-green-500' : 'bg-zinc-500'}`}></span>
                            </td>
                            <td className="py-3 px-4 text-right">
                                <button
                                    onClick={() => router.push(`/admin/configurar/metodoPago/${metodo.id}`)}
                                    className="px-3 py-1 rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs font-medium"
                                >
                                    Editar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {metodosPago.length === 0 && (
                <p className="text-center text-zinc-500 py-10">
                    No hay métodos de pago definidos.
                </p>
            )}
        </div>
    );
}
