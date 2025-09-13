import { z } from 'zod';

// Esquema para datos completos del cliente
export const ClienteCompletoSchema = z.object({
    id: z.string(),
    nombre: z.string(),
    telefono: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    direccion: z.string().nullable().optional(),
    status: z.string(),
    canalId: z.string().nullable().optional(),
    canal: z.object({
        id: z.string(),
        nombre: z.string()
    }).nullable().optional(),
    createdAt: z.date(),
    updatedAt: z.date()
});

// Esquema para etapas de evento
export const EventoEtapaSchema = z.object({
    id: z.string(),
    nombre: z.string(),
    posicion: z.number()
});

// Esquema para gestión completa del evento
export const EventoCompletoSchema = z.object({
    id: z.string(),
    nombre: z.string().nullable().optional(),
    fecha_evento: z.date(),
    sede: z.string().nullable().optional(),
    direccion: z.string().nullable().optional(),
    status: z.string(),
    userId: z.string().nullable().optional(),
    eventoEtapaId: z.string().nullable().optional(),
    eventoTipoId: z.string().nullable().optional(),
    eventoTipo: z.object({
        id: z.string(),
        nombre: z.string()
    }).nullable().optional(),
    etapaActual: EventoEtapaSchema.nullable().optional(),
    usuario: z.object({
        id: z.string(),
        username: z.string().nullable().optional()
    }).nullable().optional(),
    createdAt: z.date(),
    updatedAt: z.date()
});

// Esquema para bitácora con capacidades de edición
export const BitacoraCompletoSchema = z.object({
    id: z.string(),
    eventoId: z.string(),
    comentario: z.string(),
    importancia: z.string(),
    status: z.string(),
    createdAt: z.date(),
    updatedAt: z.date()
});

// Esquema para paquetes disponibles
export const PaqueteDisponibleSchema = z.object({
    id: z.string(),
    nombre: z.string(),
    precio: z.number().nullable().optional(),
    eventoTipoId: z.string(),
    status: z.string()
});

// Esquema para cotización con paquetes
export const CotizacionCompletoSchema = z.object({
    id: z.string(),
    nombre: z.string(),
    precio: z.number(),
    status: z.string(),
    aprobada: z.boolean(),
    paqueteId: z.string().nullable().optional(),
    paquete: PaqueteDisponibleSchema.nullable().optional(),
    createdAt: z.date(),
    pagos: z.array(z.object({
        id: z.string(),
        monto: z.number(),
        status: z.string(),
        createdAt: z.date()
    }))
});

// Esquema principal para evento detalle completo
export const EventoDetalleCompletoSchema = z.object({
    evento: EventoCompletoSchema,
    cliente: ClienteCompletoSchema,
    bitacora: z.array(BitacoraCompletoSchema),
    cotizaciones: z.array(CotizacionCompletoSchema),
    etapasDisponibles: z.array(EventoEtapaSchema),
    paquetesDisponibles: z.array(PaqueteDisponibleSchema),
    balance: z.object({
        totalCotizado: z.number(),
        totalPagado: z.number(),
        totalPendiente: z.number()
    })
});

// Tipos inferidos
export type ClienteCompleto = z.infer<typeof ClienteCompletoSchema>;
export type EventoCompleto = z.infer<typeof EventoCompletoSchema>;
export type BitacoraCompleto = z.infer<typeof BitacoraCompletoSchema>;
export type CotizacionCompleto = z.infer<typeof CotizacionCompletoSchema>;
export type EventoEtapa = z.infer<typeof EventoEtapaSchema>;
export type PaqueteDisponible = z.infer<typeof PaqueteDisponibleSchema>;
export type EventoDetalleCompleto = z.infer<typeof EventoDetalleCompletoSchema>;
