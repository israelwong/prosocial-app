// Ruta: lib/actions/configuracion/configuracion.schemas.ts

import { z } from 'zod';

// Este esquema valida los datos tal como vienen del formulario (strings).
// Esto elimina los errores de tipos en el frontend.
export const ConfiguracionSchema = z.object({
    id: z.string().cuid(),

    nombre: z.string()
        .min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),

    // Validamos como string, pero nos aseguramos que sea un número válido.
    utilidad_servicio: z.string().refine(val => !isNaN(parseFloat(val)), { message: "Debe ser un número válido." }),
    utilidad_producto: z.string().refine(val => !isNaN(parseFloat(val)), { message: "Debe ser un número válido." }),
    comision_venta: z.string().refine(val => !isNaN(parseFloat(val)), { message: "Debe ser un número válido." }),
    sobreprecio: z.string().refine(val => !isNaN(parseFloat(val)), { message: "Debe ser un número válido." }),

    status: z.enum(['active', 'inactive']),

    claveAutorizacion: z.string().nullable().optional(),

    numeroMaximoServiciosPorDia: z.string().nullable().optional(),
});

// El tipo para el formulario ahora será consistente.
export type ConfiguracionForm = z.infer<typeof ConfiguracionSchema>;
