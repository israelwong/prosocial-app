// Ruta: lib/actions/condicionesComerciales/condicionesComerciales.schemas.ts

import { z } from 'zod';

export const CondicionComercialSchema = z.object({
    id: z.string().optional(),

    nombre: z.string().min(3, { message: 'El nombre es requerido.' }),
    descripcion: z.string().nullable().optional(),

    // Tratamos los números como strings para el formulario
    descuento: z.string().nullable().optional(),
    porcentaje_anticipo: z.string().nullable().optional(),

    // tipoEvento: z.string().nullable().optional(),
    status: z.enum(['active', 'inactive']),

    // Aquí recibiremos un array con los IDs de los métodos de pago seleccionados
    metodosPagoIds: z.array(z.string()).min(1, { message: 'Debes seleccionar al menos un método de pago.' }),
});

export type CondicionComercialForm = z.infer<typeof CondicionComercialSchema>;
