import { z } from 'zod';

export const EventoDetalleSchema = z.object({
    id: z.string(),
    nombre: z.string().nullable().optional(),
    fecha_evento: z.date(),
    status: z.string(),
    sede: z.string().nullable().optional(),
    direccion: z.string().nullable().optional(),
    eventoTipo: z.object({
        id: z.string().nullable().optional(),
        nombre: z.string().nullable().optional()
    }).nullable(),
    etapa: z.object({
        id: z.string().nullable().optional(),
        nombre: z.string().nullable().optional(),
        posicion: z.number().nullable().optional()
    }).nullable(),
    cliente: z.object({
        id: z.string(),
        nombre: z.string(),
        telefono: z.string().nullable().optional(),
        email: z.string().nullable().optional()
    }),
    cotizaciones: z.array(z.object({
        id: z.string(),
        nombre: z.string(),
        precio: z.number(),
        status: z.string(),
        aprobada: z.boolean(),
        createdAt: z.date(),
        pagos: z.array(z.object({
            id: z.string(),
            monto: z.number(),
            status: z.string(),
            createdAt: z.date()
        }))
    })),
    bitacora: z.array(z.object({
        id: z.string(),
        comentario: z.string(),
        importancia: z.string(),
        createdAt: z.date()
    })),
    balance: z.object({
        totalCotizado: z.number(),
        totalPagado: z.number(),
        totalPendiente: z.number()
    })
});

export type EventoDetalle = z.infer<typeof EventoDetalleSchema>;
