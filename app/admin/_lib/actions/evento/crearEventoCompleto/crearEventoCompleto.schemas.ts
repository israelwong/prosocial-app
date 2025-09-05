import { z } from 'zod'

// Schema para buscar cliente por teléfono
export const BuscarClienteSchema = z.object({
    telefono: z.string().min(10, 'Teléfono debe tener al menos 10 dígitos'),
    nombre: z.string().optional()
})

// Schema para crear cliente inline
export const CrearClienteInlineSchema = z.object({
    nombre: z.string().min(1, 'Nombre es requerido'),
    telefono: z.string().min(10, 'Teléfono debe tener al menos 10 dígitos'),
    email: z.string().email('Email inválido').optional().nullable(),
    canalId: z.string().optional().nullable(),
    direccion: z.string().optional().nullable()
})

// Schema para validar fecha del evento
export const ValidarFechaEventoSchema = z.object({
    fecha_evento: z.date(),
    permitirDuplicada: z.boolean().default(false),
    codigoAutorizacion: z.string().optional()
})

// Schema para crear evento completo
export const CrearEventoCompletoSchema = z.object({
    // Cliente
    clienteId: z.string().optional(),
    clienteNuevo: CrearClienteInlineSchema.optional(),

    // Evento
    eventoTipoId: z.string().min(1, 'Tipo de evento es requerido'),
    nombre: z.string().min(1, 'Nombre del evento es requerido'),
    fecha_evento: z.date(),

    // Opcionales
    permitirFechaDuplicada: z.boolean().default(false),
    codigoAutorizacion: z.string().optional(),
    userId: z.string().optional(),
    fechaTentativa: z.boolean().default(false)
})

// Schema de respuesta para disponibilidad de fecha
export const DisponibilidadFechaSchema = z.object({
    disponible: z.boolean(),
    conflictos: z.array(z.object({
        id: z.string(),
        nombre: z.string(),
        cliente: z.string(),
        fecha_evento: z.date(),
        concepto: z.string().optional(),
        hora: z.string().optional()
    })).optional()
})

// Schema de respuesta para crear evento completo
export const RespuestaEventoCompletoSchema = z.object({
    success: z.boolean(),
    eventoId: z.string().optional(),
    clienteId: z.string().optional(),
    message: z.string().optional(),
    error: z.string().optional()
})

// Tipos derivados
export type BuscarCliente = z.infer<typeof BuscarClienteSchema>
export type CrearClienteInline = z.infer<typeof CrearClienteInlineSchema>
export type ValidarFechaEvento = z.infer<typeof ValidarFechaEventoSchema>
export type CrearEventoCompleto = z.infer<typeof CrearEventoCompletoSchema>
export type DisponibilidadFecha = z.infer<typeof DisponibilidadFechaSchema>
export type RespuestaEventoCompleto = z.infer<typeof RespuestaEventoCompletoSchema>
