// Ruta: app/admin/_lib/actions/debug/pricingDebug.actions.ts
// Acción temporal para inspeccionar datos reales de Métodos de Pago y Condiciones Comerciales.
// Se puede eliminar una vez validada la lógica de cálculo.

'use server';

import prisma from '@/app/admin/_lib/prismaClient';

export async function debugListMetodosYCondiciones() {
    const metodos = await prisma.metodoPago.findMany({ orderBy: { orden: 'asc' } });
    const condiciones = await prisma.condicionesComerciales.findMany({
        orderBy: { orden: 'asc' },
        include: { CondicionesComercialesMetodoPago: { select: { metodoPagoId: true } } }
    });

    const resumen = {
        metodos: metodos.map(m => ({
            id: m.id,
            metodo_pago: m.metodo_pago,
            comision_porcentaje_base: m.comision_porcentaje_base,
            comision_fija_monto: m.comision_fija_monto,
            num_msi: m.num_msi,
            comision_msi_porcentaje: m.comision_msi_porcentaje,
            status: m.status
        })),
        condiciones: condiciones.map(c => ({
            id: c.id,
            nombre: c.nombre,
            descuento: c.descuento, // porcentaje (10 = 10%)
            porcentaje_anticipo: c.porcentaje_anticipo, // porcentaje (30 = 30%)
            metodosPagoIds: c.CondicionesComercialesMetodoPago.map(mp => mp.metodoPagoId),
            status: c.status
        }))
    };

    console.log('[DEBUG Pricing] Métodos de Pago y Condiciones Comerciales:', JSON.stringify(resumen, null, 2));
    return resumen;
}
