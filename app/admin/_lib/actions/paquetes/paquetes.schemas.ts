// Ruta: app/admin/_lib/actions/paquetes/paquetes.schemas.ts

import { z } from 'zod';

// Esquema para un servicio individual dentro de un paquete, validando cantidad como string.
const ServicioEnPaqueteSchema = z.object({
    servicioId: z.string().cuid(),
    cantidad: z.string().refine(val => parseInt(val) >= 1, { message: "La cantidad debe ser al menos 1." }),
});

// Esquema principal para el formulario de Paquete.
export const PaqueteSchema = z.object({
    id: z.string().cuid().optional(),

    nombre: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
    eventoTipoId: z.string().min(1, { message: 'Debes seleccionar un tipo de evento.' }),

    // Validamos el precio como un string que pueda convertirse a número.
    precio: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, { message: 'El precio debe ser un número válido.' }),

    status: z.enum(['active', 'inactive']),

    // Un array que contiene los servicios seleccionados.
    servicios: z.array(ServicioEnPaqueteSchema).optional(),
});

export type PaqueteForm = z.infer<typeof PaqueteSchema>;
