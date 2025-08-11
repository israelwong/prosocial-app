// Ruta: lib/actions/metodoPago/metodoPago.schemas.ts

import { z } from 'zod';

// Esquema para validar la creación y actualización de Métodos de Pago.
// Todos los campos numéricos se tratan como strings para ser compatibles con el formulario.
export const MetodoPagoSchema = z.object({
    id: z.string().optional(), // Opcional porque al crear no existe

    metodo_pago: z.string()
        .min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),

    // Los campos que pueden estar vacíos los hacemos opcionales y nulos.
    comision_porcentaje_base: z.string().nullable().optional(),
    comision_fija_monto: z.string().nullable().optional(),
    num_msi: z.string().nullable().optional(),
    comision_msi_porcentaje: z.string().nullable().optional(),
    payment_method: z.string().nullable().optional(),

    status: z.enum(['active', 'inactive']),
});

export type MetodoPagoForm = z.infer<typeof MetodoPagoSchema>;
