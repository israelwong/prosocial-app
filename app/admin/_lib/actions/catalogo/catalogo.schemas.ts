// Ruta: app/admin/_lib/actions/catalogo/catalogo.schemas.ts

import { z } from 'zod';

// Esquema para crear/actualizar una Sección
export const SeccionSchema = z.object({
    id: z.string().cuid().optional(),
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
    descripcion: z.string().optional(),
});

// Esquema para crear/actualizar una Categoría
export const CategoriaSchema = z.object({
    id: z.string().cuid().optional(),
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
});

// Reutilizamos y adaptamos el esquema de Servicio
const GastoSchema = z.object({
    id: z.string().optional(),
    nombre: z.string().min(1, "El concepto es requerido."),
    costo: z.string().refine(val => !isNaN(parseFloat(val)), { message: "Debe ser un número." }),
});

export const ServicioSchema = z.object({
    id: z.string().optional(),
    nombre: z.string().min(5, "El nombre es requerido."),
    servicioCategoriaId: z.string().min(1, "La categoría es requerida."),
    costo: z.string().refine(val => !isNaN(parseFloat(val)), { message: "El costo es requerido." }),
    tipo_utilidad: z.enum(['servicio', 'producto']),
    visible_cliente: z.boolean(),
    gastos: z.array(GastoSchema).optional(),
});

export type SeccionForm = z.infer<typeof SeccionSchema>;
export type CategoriaForm = z.infer<typeof CategoriaSchema>;
export type ServicioForm = z.infer<typeof ServicioSchema>;



// NUEVO SCHEMA PARA LA ACCIÓN UNIFICADA
export const UpdatePosicionSchema = z.object({
    itemId: z.string().cuid(),
    itemType: z.enum(['seccion', 'categoria', 'servicio']),
    newParentId: z.string(),
    newIndex: z.number().int().min(0),
});

export type UpdatePosicionPayload = z.infer<typeof UpdatePosicionSchema>;



