import { z } from 'zod'

// Schema base para evento
export const EventoBaseSchema = z.object({
    id: z.string().optional(),
    clienteId: z.string().min(1, 'Cliente es requerido'),
    eventoTipoId: z.string().min(1, 'Tipo de evento es requerido'),
    nombre: z.string().nullable(),
    fecha_evento: z.date(),
    sede: z.string().nullable(),
    direccion: z.string().nullable(),
    status: z.string().default('active'),
    userId: z.string().nullable(),
    eventoEtapaId: z.string().nullable(),
})

// Schema para crear evento
export const CrearEventoSchema = EventoBaseSchema.omit({ id: true })

// Schema para actualizar evento
export const ActualizarEventoSchema = EventoBaseSchema.partial().extend({
    id: z.string().min(1, 'ID es requerido')
})

// Schema para obtener evento completo con relaciones
export const EventoCompletoSchema = EventoBaseSchema.extend({
    id: z.string().min(1, 'ID es requerido'), // Forzar que id sea requerido en datos completos
    createdAt: z.date(),
    updatedAt: z.date(),
    EventoTipo: z.object({
        nombre: z.string()
    }).nullable(),
    Cliente: z.object({
        id: z.string(),
        nombre: z.string(),
        telefono: z.string().nullable(),
        email: z.string().nullable(),
        direccion: z.string().nullable(),
        status: z.string(),
        canalId: z.string().nullable(),
        createdAt: z.date(),
        Canal: z.object({
            nombre: z.string()
        }).nullable()
    }),
    EventoEtapa: z.object({
        nombre: z.string(),
        posicion: z.number()
    }).nullable(),
    User: z.object({
        username: z.string().nullable()
    }).nullable(),
    Cotizacion: z.array(z.object({
        id: z.string(),
        status: z.string(),
        precio: z.number(),
        Pago: z.array(z.object({
            id: z.string(),
            monto: z.number(),
            createdAt: z.date()
        }))
    })),
    EventoBitacora: z.array(z.object({
        id: z.string(),
        comentario: z.string(),
        createdAt: z.date(),
        updatedAt: z.date()
    }))
})

// Tipos derivados
export type EventoBase = z.infer<typeof EventoBaseSchema>
export type CrearEvento = z.infer<typeof CrearEventoSchema>
export type ActualizarEvento = z.infer<typeof ActualizarEventoSchema>
export type EventoCompleto = z.infer<typeof EventoCompletoSchema>
