import { z } from 'zod';

// Esquema para crear una nueva etapa del pipeline
export const crearEtapaSchema = z.object({
    nombre: z.string()
        .min(1, "El nombre es requerido")
        .max(100, "El nombre no puede exceder 100 caracteres"),
    posicion: z.number()
        .int("La posición debe ser un número entero")
        .min(0, "La posición debe ser mayor o igual a 0")
});

// Esquema para actualizar una etapa del pipeline
export const actualizarEtapaSchema = z.object({
    id: z.string().cuid("ID inválido"),
    nombre: z.string()
        .min(1, "El nombre es requerido")
        .max(100, "El nombre no puede exceder 100 caracteres")
        .optional(),
    posicion: z.number()
        .int("La posición debe ser un número entero")
        .min(0, "La posición debe ser mayor o igual a 0")
        .optional()
});

// Esquema para eliminar una etapa del pipeline
export const eliminarEtapaSchema = z.object({
    id: z.string().cuid("ID inválido")
});

// Esquema para reordenar etapas del pipeline
export const reordenarEtapasSchema = z.object({
    etapas: z.array(z.object({
        id: z.string().cuid("ID inválido"),
        posicion: z.number()
            .int("La posición debe ser un número entero")
            .min(0, "La posición debe ser mayor o igual a 0")
    })).min(1, "Debe proporcionar al menos una etapa")
});

// Tipos TypeScript derivados de los esquemas
export type CrearEtapaType = z.infer<typeof crearEtapaSchema>;
export type ActualizarEtapaType = z.infer<typeof actualizarEtapaSchema>;
export type EliminarEtapaType = z.infer<typeof eliminarEtapaSchema>;
export type ReordenarEtapasType = z.infer<typeof reordenarEtapasSchema>;

// Tipo para la respuesta de etapa completa
export type EtapaPipelineType = {
    id: string;
    nombre: string;
    posicion: number;
    eventoCount: number;
    createdAt: Date;
    updatedAt: Date;
};
