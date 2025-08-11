// Ruta: app/admin/_lib/actions/servicios/servicios.schemas.ts

import { z } from 'zod';

// Esquema para un gasto individual, validando como strings
const GastoSchema = z.object({
    id: z.string().optional(),
    nombre: z.string().min(1, "El concepto es requerido."),
    costo: z.string().refine(val => !isNaN(parseFloat(val)), { message: "Debe ser un número válido." }),
});

// Esquema principal para el formulario de Servicio
export const ServicioSchema = z.object({
    id: z.string().optional(),
    nombre: z.string().min(5, "El nombre debe tener al menos 5 caracteres."),
    servicioCategoriaId: z.string().min(1, "Debes seleccionar una categoría."),
    costo: z.string().refine(val => val.trim() !== '' && !isNaN(parseFloat(val)), { message: "El costo es requerido y debe ser un número." }),
    tipo_utilidad: z.enum(['servicio', 'producto']),
    visible_cliente: z.boolean(),

    gastos: z.array(GastoSchema).optional(),
});

export type ServicioForm = z.infer<typeof ServicioSchema>;
