// Ruta: app/admin/_lib/actions/seguimiento/seguimiento.schemas.ts

import { z } from 'zod';

// ========================================
// SCHEMAS DE VALIDACIÓN
// ========================================

// Schema para búsqueda y filtros de eventos en seguimiento
export const SeguimientoBusquedaSchema = z.object({
    search: z.string().optional(),
    filtroBalance: z.enum(['todos', 'pagados', 'pendientes']).default('todos'),
    fechaDesde: z.string().optional(),
    fechaHasta: z.string().optional(),
    eventoTipoId: z.string().optional(),
    clienteId: z.string().optional(),
    eventoEtapaId: z.string().optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(50),
});

// Schema para actualizar etapa de evento en seguimiento
export const SeguimientoEtapaUpdateSchema = z.object({
    eventoId: z.string().min(1, 'ID de evento requerido'),
    eventoEtapaId: z.string().min(1, 'ID de etapa requerido'),
});

// ========================================
// TIPOS INFERIDOS
// ========================================

export type SeguimientoBusquedaForm = z.infer<typeof SeguimientoBusquedaSchema>;
export type SeguimientoEtapaUpdateForm = z.infer<typeof SeguimientoEtapaUpdateSchema>;

// ========================================
// TIPOS EXTENDIDOS (para datos con joins)
// ========================================

export type EventoSeguimiento = {
    // Campos base del evento
    id: string;
    nombre: string | null;
    fecha_evento: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;

    // Datos del cliente
    clienteId: string;
    clienteNombre: string;

    // Datos del tipo de evento
    eventoTipoId: string | null;
    tipoEventoNombre: string;

    // Datos de la etapa
    eventoEtapaId: string | null;
    etapaNombre: string;
    etapaPosicion: number;

    // Datos de cotización
    cotizacionId: string | null;
    cotizacionAprobada: boolean;
    precio: number;

    // Datos de pagos
    totalPagado: number;
    balance: number;

    // Campos calculados
    diasRestantes: number;
    statusPago: 'pagado' | 'pendiente' | 'sobregiro';
};

export type EtapaSeguimiento = {
    id: string;
    nombre: string;
    posicion: number;
    eventos: EventoSeguimiento[];
};

export type SeguimientoEtapas = {
    [etapaNombre: string]: EventoSeguimiento[];
};
