// Ruta: app/admin/_lib/actions/secciones/secciones.schemas.ts

import { z } from 'zod';

// Esquema para crear o actualizar una Sección
export const SeccionSchema = z.object({
    id: z.string().cuid().optional(),
    nombre: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
    descripcion: z.string().optional(),
});

// Esquema para la acción de asignar una categoría a una sección
export const AsignarCategoriaSchema = z.object({
    categoriaId: z.string().cuid(),
    seccionId: z.string().cuid(),
});

export type SeccionForm = z.infer<typeof SeccionSchema>;
