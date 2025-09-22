// Ruta: app/admin/_lib/actions/eventoTipo/eventoTipo.schemas.ts

import { z } from 'zod';

// Esquema para validar la creación de un nuevo tipo de evento.
export const EventoTipoCreateSchema = z.object({
    nombre: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
});

// Esquema para validar la actualización del nombre.
export const EventoTipoUpdateSchema = z.object({
    id: z.string().cuid(),
    nombre: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
});

// Esquema para validar el array al reordenar.
export const UpdatePosicionesSchema = z.array(
    z.object({
        id: z.string().cuid(),
        posicion: z.number(),
    })
);

export type EventoTipoForm = z.infer<typeof EventoTipoCreateSchema>;
