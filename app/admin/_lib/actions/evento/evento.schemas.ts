// Ruta: app/admin/_lib/actions/evento/evento.schemas.ts

import { z } from 'zod';

// Importar tipos necesarios
import type { EventoBitacora } from '../../types';

// Schema para búsqueda y filtros de eventos
export const EventoBusquedaSchema = z.object({
    search: z.string().optional(),
    filtroBalance: z.enum(['todos', 'pagados', 'pendientes']).default('todos'),
    fechaDesde: z.string().optional(),
    fechaHasta: z.string().optional(),
    eventoTipoId: z.string().optional(),
    clienteId: z.string().optional(),
    eventoEtapaId: z.string().optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
});

// Schema para actualizar etapa de evento
export const EventoEtapaUpdateSchema = z.object({
    eventoId: z.string().min(1, 'ID de evento requerido'),
    eventoEtapaId: z.string().min(1, 'ID de etapa requerido'),
});

// Schema para actualizar status de etapa
export const EventoEtapaStatusSchema = z.object({
    eventoId: z.string().min(1, 'ID de evento requerido'),
    etapaId: z.string().min(1, 'ID de etapa requerido'),
    status: z.string().min(1, 'Status requerido'),
});

// Schema para crear evento
export const EventoCreateSchema = z.object({
    clienteId: z.string().min(1, 'Cliente requerido'),
    eventoTipoId: z.string().optional(),
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
    fecha_evento: z.string().min(1, 'La fecha del evento es requerida'),
    sede: z.string().optional(),
    direccion: z.string().optional(),
    userId: z.string().optional(),
    eventoEtapaId: z.string().optional(),
    status: z.string().default('active'),
});

// Schema para actualizar evento
export const EventoUpdateSchema = EventoCreateSchema.extend({
    id: z.string().min(1, 'ID requerido'),
}).partial().required({ id: true });

// Tipos inferidos
export type EventoBusquedaForm = z.infer<typeof EventoBusquedaSchema>;
export type EventoEtapaUpdateForm = z.infer<typeof EventoEtapaUpdateSchema>;
export type EventoEtapaStatusForm = z.infer<typeof EventoEtapaStatusSchema>;
export type EventoCreateForm = z.infer<typeof EventoCreateSchema>;
export type EventoUpdateForm = z.infer<typeof EventoUpdateSchema>;

// Tipo extendido para eventos con datos adicionales
export interface EventoExtendido {
    id: string;
    clienteId: string;
    eventoTipoId: string | null;
    nombre: string | null;
    fecha_evento: Date;
    sede: string | null;
    direccion: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string | null;
    eventoEtapaId: string | null;
    // Campos adicionales calculados
    clienteNombre: string;
    tipoEvento: string;
    precio: number;
    totalPagado: number;
    balance: number;
}

// Tipo para evento completo con todas las relaciones
export interface EventoCompleto {
    id: string;
    clienteId: string;
    eventoTipoId: string | null;
    nombre: string | null;
    fecha_evento: Date;
    sede: string | null;
    direccion: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string | null;
    eventoEtapaId: string | null;
    EventoTipo?: {
        id: string;
        nombre: string;
    } | null;
    Cliente?: {
        id: string;
        nombre: string;
        telefono: string | null;
        email: string | null;
        direccion: string | null;
        status: string;
        canalId: string | null;
        userId: string | null;
        createdAt: Date;
        updatedAt: Date;
        Canal?: {
            id: string;
            nombre: string;
        } | null;
    } | null;
    EventoEtapa?: {
        id: string;
        nombre: string;
    } | null;
    Cotizacion?: any[];
    Agenda?: any[];
    EventoBitacora?: EventoBitacora[];
}
