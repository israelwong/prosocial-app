import { z } from 'zod'

// Schema base para bitácora
export const BitacoraBaseSchema = z.object({
    id: z.string().optional(),
    eventoId: z.string().min(1, 'Evento ID es requerido'),
    comentario: z.string().min(1, 'Comentario es requerido'),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional()
})

// Schema para crear bitácora
export const CrearBitacoraSchema = BitacoraBaseSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true
})

// Schema para actualizar bitácora
export const ActualizarBitacoraSchema = z.object({
    id: z.string().min(1, 'ID es requerido'),
    comentario: z.string().min(1, 'Comentario es requerido')
})

// Schema para bitácora completa
export const BitacoraCompletaSchema = BitacoraBaseSchema.extend({
    id: z.string().min(1, 'ID es requerido'),
    createdAt: z.date(),
    updatedAt: z.date()
})

// Tipos derivados
export type BitacoraBase = z.infer<typeof BitacoraBaseSchema>
export type CrearBitacora = z.infer<typeof CrearBitacoraSchema>
export type ActualizarBitacora = z.infer<typeof ActualizarBitacoraSchema>
export type BitacoraCompleta = z.infer<typeof BitacoraCompletaSchema>
