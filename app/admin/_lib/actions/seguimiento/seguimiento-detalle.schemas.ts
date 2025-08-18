// Ruta: app/admin/_lib/actions/seguimiento/seguimiento-detalle.schemas.ts

import { z } from 'zod';
import type {
    Evento,
    Cliente,
    EventoEtapa,
    Cotizacion,
    Pago,
    ServicioCategoria,
    CotizacionServicio,
    User,
    Agenda,
    AgendaTipo,
    EventoTipo
} from '@/app/admin/_lib/types';

// ========================================
// SCHEMAS DE VALIDACIÓN
// ========================================

/**
 * Schema para obtener detalle completo de evento
 */
export const EventoDetalleParamsSchema = z.object({
    eventoId: z.string().min(1, "ID del evento es requerido"),
    cotizacionId: z.string().optional() // Parámetro opcional para obtener cotización específica
});

/**
 * Schema para actualizar etapa de evento
 */
export const EventoEtapaUpdateSchema = z.object({
    eventoId: z.string().min(1, "ID del evento es requerido"),
    eventoEtapaId: z.string().min(1, "ID de la etapa es requerido")
});

/**
 * Schema para crear nuevo pago
 */
export const PagoCreateSchema = z.object({
    cotizacionId: z.string().min(1, "ID de cotización es requerido"),
    metodoPagoId: z.string().min(1, "Método de pago es requerido"),
    monto: z.number().positive("El monto debe ser positivo"),
    concepto: z.string().min(1, "Concepto es requerido"),
    metodo_pago: z.string().min(1, "Método de pago es requerido"),
    descripcion: z.string().optional(),
    status: z.enum(['pending', 'paid', 'failed']).default('paid'),
    tipo_transaccion: z.enum(['ingreso', 'egreso']).default('ingreso'),
    categoria_transaccion: z.enum(['abono', 'honorarios', 'servicio', 'producto', 'comision', 'ajuste']).default('abono')
});

/**
 * Schema para actualizar pago
 */
export const PagoUpdateSchema = PagoCreateSchema.partial().extend({
    id: z.string().min(1, "ID del pago es requerido")
});

/**
 * Schema para crear agenda
 */
export const AgendaCreateSchema = z.object({
    eventoId: z.string().min(1, "ID del evento es requerido"),
    agendaTipoId: z.string().min(1, "Tipo de agenda es requerido"),
    titulo: z.string().min(1, "Título es requerido"),
    descripcion: z.string().optional(),
    fecha: z.date(),
    hora: z.string().optional(),
    ubicacion: z.string().optional(),
    responsableId: z.string().optional(),
    status: z.enum(['pendiente', 'en_proceso', 'completado', 'cancelado']).default('pendiente'),
    prioridad: z.enum(['baja', 'media', 'alta']).default('media')
});

/**
 * Schema para actualizar agenda
 */
export const AgendaUpdateSchema = AgendaCreateSchema.partial().extend({
    id: z.string().min(1, "ID de la agenda es requerido")
});

// ========================================
// TIPOS INFERIDOS
// ========================================

export type EventoDetalleParams = z.infer<typeof EventoDetalleParamsSchema>;
export type EventoEtapaUpdateForm = z.infer<typeof EventoEtapaUpdateSchema>;
export type PagoCreateForm = z.infer<typeof PagoCreateSchema>;
export type PagoUpdateForm = z.infer<typeof PagoUpdateSchema>;
export type AgendaCreateForm = z.infer<typeof AgendaCreateSchema>;
export type AgendaUpdateForm = z.infer<typeof AgendaUpdateSchema>;

// ========================================
// TIPOS COMPLEJOS PARA DATOS COMPLETOS
// ========================================

/**
 * Resumen financiero calculado
 */
export type ResumenFinanciero = {
    precio: number;
    totalPagado: number;
    balance: number;
    porcentajePagado: number;
    cantidadPagos: number;
    ultimoPago?: {
        fecha: Date;
        monto: number;
        metodo: string;
    };
};

/**
 * Información extendida del evento con cálculos
 */
export type EventoExtendido = Evento & {
    clienteNombre: string;
    tipoEventoNombre: string;
    etapaNombre: string;
    diasHastaEvento: number;
    statusEvento: 'futuro' | 'hoy' | 'pasado';
};

/**
 * Servicio con información adicional para display
 * Combina datos de CotizacionServicio con información calculada
 */
export type ServicioDetalle = {
    id: string;
    cotizacionId: string;
    servicioId?: string | null;
    nombre: string;
    descripcion?: string | null;
    precio: number;
    cantidad: number;
    subtotal: number;
    categoria: string;
    categoriaNombre: string;
    seccion?: string; // Agregamos el campo de sección

    // Información del responsable
    responsableId?: string | null;
    responsableNombre?: string;
    responsableEmail?: string;

    // Estado y fechas
    status: string;
    statusDisplay: string;
    colorStatus: string;
    fechaAsignacion?: Date | null;
    FechaEntrega?: Date | null;

    // Metadatos
    posicion: number;
    es_personalizado: boolean;
    createdAt: Date;
    updatedAt: Date;
};

/**
 * Agenda con información extendida
 */
export type AgendaDetalle = Agenda & {
    tipoNombre: string;
    responsableNombre?: string;
    diasFaltantes: number;
    statusDisplay: string;
    colorStatus: string;
    iconoTipo: string;
};

/**
 * Datos completos del evento para la página de detalle
 */
export type EventoDetalleCompleto = {
    // Información básica del evento
    evento: EventoExtendido;
    cliente: Cliente;
    tipoEvento: EventoTipo;

    // Gestión de etapas
    etapaActual: EventoEtapa;
    etapasDisponibles: EventoEtapa[];

    // Información financiera
    cotizacion: Cotizacion | null;
    pagos: Pago[];
    resumenFinanciero: ResumenFinanciero;
    condicionComercial: string | null;

    // Servicios y recursos
    serviciosCategorias: ServicioCategoria[];
    serviciosDetalle: ServicioDetalle[];
    usuarios: User[];

    // Agenda y seguimiento
    agenda: AgendaDetalle[];
    agendaTipos: AgendaTipo[];

    // Metadatos y timestamps
    fechaCargaDatos: Date;
    ultimaActualizacion: Date;
};

/**
 * Respuesta estándar para operaciones de mutación
 */
export type EventoDetalleActionResult<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: Date;
};

// ========================================
// UTILIDADES Y HELPERS
// ========================================

/**
 * Colores para estados de agenda
 */
export const AGENDA_STATUS_COLORS = {
    pendiente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    en_proceso: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    completado: 'bg-green-500/20 text-green-400 border-green-500/30',
    cancelado: 'bg-red-500/20 text-red-400 border-red-500/30'
} as const;

/**
 * Iconos para tipos de agenda
 */
export const AGENDA_TIPO_ICONS = {
    reunion: 'users',
    llamada: 'phone',
    email: 'mail',
    tarea: 'check-square',
    evento: 'calendar',
    seguimiento: 'clock'
} as const;

/**
 * Estados de servicios
 */
export const SERVICIO_STATUS_COLORS = {
    pendiente: 'bg-yellow-500/20 text-yellow-400',
    asignado: 'bg-blue-500/20 text-blue-400',
    en_proceso: 'bg-orange-500/20 text-orange-400',
    completado: 'bg-green-500/20 text-green-400',
    cancelado: 'bg-red-500/20 text-red-400'
} as const;
