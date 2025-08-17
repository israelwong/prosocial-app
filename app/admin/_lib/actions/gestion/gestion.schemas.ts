import { z } from 'zod';

// Schema para actualizar la etapa de un evento
export const ActualizarEtapaEventoSchema = z.object({
    eventoId: z.string().min(1, 'ID del evento es requerido'),
    nuevaEtapaId: z.string().min(1, 'ID de la nueva etapa es requerido'),
});

// Schema para obtener eventos por etapas
export const ObtenerEventosPorEtapasSchema = z.object({
    etapas: z.array(z.number()).optional(),
    incluirTodos: z.boolean().optional().default(false),
});

// Schema para el card del evento en el kanban
export const EventoKanbanSchema = z.object({
    id: z.string(),
    nombre: z.string().nullable(),
    fecha_evento: z.date(),
    sede: z.string().nullable(),
    clienteNombre: z.string(),
    eventoTipo: z.string().nullable(),
    etapaNombre: z.string().nullable(),
    etapaId: z.string().nullable(),
    status: z.string(), // 'active' | 'aprobado' | otros
    totalPendiente: z.number(),
    cotizacionPrecio: z.number().nullable(),
    totalPagado: z.number(),
    tieneCotizacionAprobada: z.boolean(),
});

// Schema para las estadísticas por columna
export const EstadisticasColumnaSchema = z.object({
    etapaId: z.string(),
    etapaNombre: z.string(),
    totalEventos: z.number(),
    totalPendienteCobrar: z.number(),
});

// Types
export type ActualizarEtapaEventoType = z.infer<typeof ActualizarEtapaEventoSchema>;
export type ObtenerEventosPorEtapasType = z.infer<typeof ObtenerEventosPorEtapasSchema>;
export type EventoKanbanType = z.infer<typeof EventoKanbanSchema>;
export type EstadisticasColumnaType = z.infer<typeof EstadisticasColumnaSchema>;
