// Ruta: lib/actions/categorias/categorias.schemas.ts

import { z } from 'zod';

// Esquema para validar la creación de una nueva categoría.
export const CategoriaCreateSchema = z.object({
    nombre: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
});

// Esquema para validar la actualización del nombre de una categoría.
export const CategoriaUpdateSchema = z.object({
    id: z.string().cuid(),
    nombre: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
});

// Esquema para validar el array de categorías al reordenar.
export const UpdatePosicionesSchema = z.array(
    z.object({
        id: z.string().cuid(),
        posicion: z.number(),
    })
);

export type CategoriaForm = z.infer<typeof CategoriaCreateSchema>;

export const CategoriaSchema = z.object({
    id: z.string().optional(),
    nombre: z.string().min(1, 'Nombre requerido'),
    seccionId: z.string().min(1, 'Sección requerida')  // <-- agregado
})