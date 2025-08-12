// Ruta: app/admin/configurar/pricing-debug/page.tsx
// Página temporal para disparar la acción de debug y mostrar la data.

import { debugListMetodosYCondiciones } from '@/app/admin/_lib/actions/debug/pricingDebug.actions';

export const dynamic = 'force-dynamic';

export default async function PricingDebugPage() {
    const data = await debugListMetodosYCondiciones();
    return (
        <div className="p-6 space-y-4 text-sm">
            <h1 className="text-xl font-semibold">Debug Pricing</h1>
            <p className="text-zinc-400">Datos en vivo de Métodos de Pago y Condiciones Comerciales (ver también consola del servidor).</p>
            <pre className="bg-zinc-900 border border-zinc-700 p-4 rounded text-xs overflow-auto max-h-[70vh]">
                {JSON.stringify(data, null, 2)}
            </pre>
            <p className="text-xs text-yellow-500">Esta ruta es temporal. Eliminar cuando validemos la lógica.</p>
        </div>
    );
}
