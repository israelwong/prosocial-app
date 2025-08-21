import { z } from 'zod';

// Esquema para los detalles básicos de las relaciones
const ClienteSchema = z.object({
    nombre: z.string(),
});

const EventoTipoSchema = z.object({
    nombre: z.string(),
});

const EventoEtapaSchema = z.object({
    nombre: z.string(),
    posicion: z.number(),
});

// Esquema para Pago dentro de Cotizacion
const PagoSchema = z.object({
    id: z.string(),
    monto: z.number(),
    createdAt: z.date(),
});

// Esquema para Cotizacion
const CotizacionSchema = z.object({
    id: z.string(),
    precio: z.number(),
    status: z.string(),
    Pago: z.array(PagoSchema),
});

// Esquema para User
const UserSchema = z.object({
    username: z.string().nullable(),
});

// Esquema principal para un evento con todos sus detalles
export const EventoConDetallesSchema = z.object({
    id: z.string(),
    nombre: z.string(),
    fecha_evento: z.date(),
    status: z.string(),
    clienteId: z.string(),
    eventoTipoId: z.string(),
    eventoEtapaId: z.string(),
    Cliente: ClienteSchema,
    EventoTipo: EventoTipoSchema,
    EventoEtapa: EventoEtapaSchema,
    // Puedes añadir más campos si son necesarios para la tabla
});

// Esquema para eventos con cotizaciones (para la lista de eventos)
export const EventoPorEtapaSchema = z.object({
    id: z.string(),
    nombre: z.string().nullable(),
    fecha_evento: z.date(),
    status: z.string(),
    clienteId: z.string(),
    eventoTipoId: z.string().nullable(),
    eventoEtapaId: z.string().nullable(),
    userId: z.string().nullable(),
    Cliente: ClienteSchema,
    EventoTipo: EventoTipoSchema.nullable(),
    EventoEtapa: EventoEtapaSchema.nullable(),
    Cotizacion: z.array(CotizacionSchema),
    User: UserSchema.nullable(),
    total_pagado: z.number(),
});

// Esquema para un array de eventos
export const EventosConDetallesArraySchema = z.array(EventoConDetallesSchema);
export const EventosPorEtapaArraySchema = z.array(EventoPorEtapaSchema);

// Tipo inferido de Zod para usar en los componentes
export type EventoConDetalles = z.infer<typeof EventoConDetallesSchema>;
export type EventoPorEtapa = z.infer<typeof EventoPorEtapaSchema>;
