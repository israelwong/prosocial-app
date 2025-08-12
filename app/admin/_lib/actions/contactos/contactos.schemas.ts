// Ruta: app/admin/_lib/actions/contactos/contactos.schemas.ts

import { z } from 'zod';

// Schema para crear un nuevo contacto
export const ContactoCreateSchema = z.object({
    nombre: z.string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres')
        .refine(val => val.trim().length > 0, 'El nombre es requerido'),

    telefono: z.string()
        .regex(/^\d{10}$/, 'El teléfono debe tener exactamente 10 dígitos')
        .transform(val => val.replace(/\D/g, '')), // Remover caracteres no numéricos

    email: z.string()
        .email('Formato de email inválido')
        .optional()
        .or(z.literal('')),

    canalId: z.string()
        .min(1, 'Debe seleccionar un canal'),

    userId: z.string()
        .min(1, 'Usuario requerido'),

    status: z.enum(['prospecto', 'cliente', 'descartado']),
});

// Schema para actualizar un contacto
export const ContactoUpdateSchema = ContactoCreateSchema.extend({
    id: z.string().min(1, 'ID requerido'),
}).partial().required({ id: true });

// Schema para búsqueda de contactos
export const ContactoBusquedaSchema = z.object({
    search: z.string().optional(),
    status: z.enum(['prospecto', 'cliente', 'descartado']).optional(),
    canalId: z.string().optional(),
    fechaDesde: z.string().optional(),
    fechaHasta: z.string().optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
});

// Tipos inferidos
export type ContactoCreateForm = z.infer<typeof ContactoCreateSchema>;
export type ContactoUpdateForm = z.infer<typeof ContactoUpdateSchema>;
export type ContactoBusquedaForm = z.infer<typeof ContactoBusquedaSchema>;

// Schema para validación de teléfono único
export const TelefonoUnicoSchema = z.object({
    telefono: z.string().regex(/^\d{10}$/, 'Formato de teléfono inválido'),
    excludeId: z.string().optional(), // Para excluir el propio registro al editar
});

export type TelefonoUnicoForm = z.infer<typeof TelefonoUnicoSchema>;
