import { z } from 'zod'

// Schema para actualizar evento básico
export const ActualizarEventoBasicoSchema = z.object({
    id: z.string().min(1, 'ID es requerido'),
    nombre: z.string().nullable(),
    fecha_evento: z.date(),
    sede: z.string().nullable(),
    direccion: z.string().nullable(),
    status: z.string()
})

// Schema para cambiar etapa
export const CambiarEtapaEventoSchema = z.object({
    eventoId: z.string().min(1, 'ID del evento es requerido'),
    etapaId: z.string().min(1, 'ID de la etapa es requerido')
})

// Schema para asignación de usuario
export const AsignarUsuarioEventoSchema = z.object({
    eventoId: z.string().min(1, 'ID del evento es requerido'),
    userId: z.string().min(1, 'ID del usuario es requerido')
})

// Schema para etapa
export const EventoEtapaSchema = z.object({
    id: z.string(),
    nombre: z.string(),
    posicion: z.number()
})

// Tipos derivados
export type ActualizarEventoBasico = z.infer<typeof ActualizarEventoBasicoSchema>
export type CambiarEtapaEvento = z.infer<typeof CambiarEtapaEventoSchema>
export type AsignarUsuarioEvento = z.infer<typeof AsignarUsuarioEventoSchema>
export type EventoEtapa = z.infer<typeof EventoEtapaSchema>
