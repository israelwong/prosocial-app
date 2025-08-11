// Ruta: app/admin/_lib/actions/usuarios/usuarios.schemas.ts

import { z } from 'zod';

const roles = ['admin', 'empleado', 'proveedor'] as const;
const statuses = ['active', 'inactive'] as const;

// Esquema para la creación de un usuario (contraseña obligatoria)
export const UserCreateSchema = z.object({
    id: z.string().cuid().optional(),
    username: z.string().min(3, 'El nombre de usuario es requerido.'),
    email: z.string().email('Correo electrónico inválido.').nullable().optional().or(z.literal('')),
    telefono: z.string().length(10, 'El teléfono debe tener 10 dígitos.'),
    role: z.enum(roles, { error: "Selecciona un rol válido." }),
    status: z.enum(statuses, { error: "Selecciona un estatus válido." }),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

// Esquema para la actualización (contraseña opcional)
export const UserUpdateSchema = z.object({
    id: z.string().cuid().optional(),
    username: z.string().min(3, 'El nombre de usuario es requerido.'),
    email: z.string().email('Correo electrónico inválido.').nullable().optional().or(z.literal('')),
    telefono: z.string().length(10, 'El teléfono debe tener 10 dígitos.'),
    role: z.enum(roles, { error: "Selecciona un rol válido." }),
    status: z.enum(statuses, { error: "Selecciona un estatus válido." }),
    password: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres.').optional().or(z.literal('')),
});

// El tipo para el formulario será una unión de ambos, para máxima flexibilidad.
export type UserForm = z.infer<typeof UserCreateSchema> | z.infer<typeof UserUpdateSchema>;
