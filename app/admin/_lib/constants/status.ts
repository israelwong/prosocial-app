// ========================================
// STATUS CONSTANTS - Fuente de verdad para homologación
// ========================================

// Evento Status - Corregido según lógica de negocio
export const EVENTO_STATUS = {
    PENDIENTE: 'pendiente',   // Evento recién creado
    APROBADO: 'aprobado',     // Evento aprobado por cliente
    CANCELADO: 'cancelado',   // Evento cancelado
    COMPLETADO: 'completado', // Evento completado/entregado
    ARCHIVADO: 'archivado',   // Evento archivado
    // Valores legacy que necesitan migración
    ACTIVE: 'active',         // -> migrar a pendiente o aprobado
    CANCELLED: 'cancelled',   // -> migrar a cancelado
    COMPLETED: 'completed',   // -> migrar a completado
    ARCHIVED: 'archived',     // -> migrar a archivado
    INACTIVE: 'inactive'      // -> migrar a archivado
} as const;

export type EventoStatus = typeof EVENTO_STATUS[keyof typeof EVENTO_STATUS];

// Cotización Status
export const COTIZACION_STATUS = {
    PENDIENTE: 'pendiente',
    APROBADA: 'aprobada',
    AUTORIZADO: 'autorizado',
    RECHAZADA: 'rechazada',
    EXPIRADA: 'expirada',
    ARCHIVADA: 'archivada'
} as const;

export type CotizacionStatus = typeof COTIZACION_STATUS[keyof typeof COTIZACION_STATUS];

// Pago Status  
export const PAGO_STATUS = {
    PENDING: 'pending',
    PENDIENTE: 'pendiente',   // Variación en español
    PAID: 'paid',
    COMPLETADO: 'completado', // Variación de paid en español
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
} as const;

export type PagoStatus = typeof PAGO_STATUS[keyof typeof PAGO_STATUS];

// Agenda Status
export const AGENDA_STATUS = {
    POR_CONFIRMAR: 'por_confirmar', // Fecha tentativa, no confirmada
    PENDIENTE: 'pendiente',
    CONFIRMADO: 'confirmado',
    CANCELADO: 'cancelado',
    COMPLETADO: 'completado',
    REAGENDADO: 'reagendado'
} as const;

export type AgendaStatus = typeof AGENDA_STATUS[keyof typeof AGENDA_STATUS];

// Cliente Status
export const CLIENTE_STATUS = {
    PROSPECTO: 'prospecto',   // Cliente potencial
    ACTIVO: 'activo',         // Cliente activo/confirmado  
    CLIENTE: 'cliente',       // Cliente establecido
    INACTIVO: 'inactivo',     // Cliente inactivo
    ARCHIVADO: 'archivado'    // Cliente archivado
} as const;

export type ClienteStatus = typeof CLIENTE_STATUS[keyof typeof CLIENTE_STATUS];

// Nomina Status  
export const NOMINA_STATUS = {
    PENDIENTE: 'pendiente',   // Nómina pendiente de autorización
    AUTORIZADO: 'autorizado', // Nómina autorizada para pago
    PAGADO: 'pagado',         // Nómina pagada
    CANCELADO: 'cancelado'    // Nómina cancelada
} as const;

export type NominaStatus = typeof NOMINA_STATUS[keyof typeof NOMINA_STATUS];

// ========================================
// MAPEO DE HOMOLOGACIÓN - Para migrar datos existentes
// ========================================

// Mapeo de valores antiguos a nuevos para Evento
export const EVENTO_STATUS_MAP: Record<string, EventoStatus> = {
    'active': EVENTO_STATUS.ACTIVE,
    'inactive': EVENTO_STATUS.ARCHIVED,  // Mapear inactive a archived
    'cancelled': EVENTO_STATUS.CANCELLED,
    'completed': EVENTO_STATUS.COMPLETED,
    'archived': EVENTO_STATUS.ARCHIVED
};

// Mapeo de valores antiguos a nuevos para Cotización
export const COTIZACION_STATUS_MAP: Record<string, CotizacionStatus> = {
    'pending': COTIZACION_STATUS.PENDIENTE,  // pending -> pendiente
    'pendiente': COTIZACION_STATUS.PENDIENTE,
    'aprobada': COTIZACION_STATUS.APROBADA,
    'aprobado': COTIZACION_STATUS.APROBADA,  // aprobado -> aprobada
    'autorizado': COTIZACION_STATUS.AUTORIZADO,
    'rechazada': COTIZACION_STATUS.RECHAZADA,
    'rechazado': COTIZACION_STATUS.RECHAZADA, // rechazado -> rechazada
    'expirada': COTIZACION_STATUS.EXPIRADA,
    'archivada': COTIZACION_STATUS.ARCHIVADA
};

// Mapeo de valores antiguos a nuevos para Pago
export const PAGO_STATUS_MAP: Record<string, PagoStatus> = {
    'pending': PAGO_STATUS.PENDING,
    'succeeded': PAGO_STATUS.PAID,        // succeeded -> paid
    'paid': PAGO_STATUS.PAID,
    'failed': PAGO_STATUS.FAILED,
    'cancelled': PAGO_STATUS.CANCELLED,
    'refunded': PAGO_STATUS.REFUNDED
};

// Mapeo de valores antiguos a nuevos para Agenda
export const AGENDA_STATUS_MAP: Record<string, AgendaStatus> = {
    'por_confirmar': AGENDA_STATUS.POR_CONFIRMAR,
    'pendiente': AGENDA_STATUS.PENDIENTE,
    'confirmado': AGENDA_STATUS.CONFIRMADO,
    'cancelado': AGENDA_STATUS.CANCELADO,
    'completado': AGENDA_STATUS.COMPLETADO,
    'reagendado': AGENDA_STATUS.REAGENDADO
};

// ========================================
// FUNCIONES DE UTILIDAD
// ========================================

// Función para homologar status de Evento
export function homologarEventoStatus(status: string): EventoStatus {
    return EVENTO_STATUS_MAP[status.toLowerCase()] || EVENTO_STATUS.ACTIVE;
}

// Función para homologar status de Cotización
export function homologarCotizacionStatus(status: string): CotizacionStatus {
    return COTIZACION_STATUS_MAP[status.toLowerCase()] || COTIZACION_STATUS.PENDIENTE;
}

// Función para homologar status de Pago
export function homologarPagoStatus(status: string): PagoStatus {
    return PAGO_STATUS_MAP[status.toLowerCase()] || PAGO_STATUS.PENDING;
}

// Función para homologar status de Agenda
export function homologarAgendaStatus(status: string): AgendaStatus {
    return AGENDA_STATUS_MAP[status.toLowerCase()] || AGENDA_STATUS.PENDIENTE;
}

// ========================================
// VALIDADORES
// ========================================

export function isValidEventoStatus(status: string): status is EventoStatus {
    return Object.values(EVENTO_STATUS).includes(status as EventoStatus);
}

export function isValidCotizacionStatus(status: string): status is CotizacionStatus {
    return Object.values(COTIZACION_STATUS).includes(status as CotizacionStatus);
}

export function isValidPagoStatus(status: string): status is PagoStatus {
    return Object.values(PAGO_STATUS).includes(status as PagoStatus);
}

export function isValidAgendaStatus(status: string): status is AgendaStatus {
    return Object.values(AGENDA_STATUS).includes(status as AgendaStatus);
}

// ========================================
// FUNCIONES DE MIGRACIÓN - Para homologación futura
// ========================================

// Mapeo para migrar status de eventos legacy a nuevos
export const EVENTO_STATUS_MIGRATION_MAP: Record<string, EventoStatus> = {
    'active': EVENTO_STATUS.PENDIENTE,      // active -> pendiente
    'aprobado': EVENTO_STATUS.APROBADO,     // aprobado -> aprobado (mantener)
    'cancelled': EVENTO_STATUS.CANCELADO,   // cancelled -> cancelado
    'completed': EVENTO_STATUS.COMPLETADO,  // completed -> completado
    'archived': EVENTO_STATUS.ARCHIVADO,    // archived -> archivado
    'inactive': EVENTO_STATUS.ARCHIVADO,    // inactive -> archivado
};

// Mapeo para migrar status de cotizaciones legacy
export const COTIZACION_STATUS_MIGRATION_MAP: Record<string, CotizacionStatus> = {
    'pending': COTIZACION_STATUS.PENDIENTE,   // pending -> pendiente
    'pendiente': COTIZACION_STATUS.PENDIENTE, // pendiente -> pendiente (mantener)
    'aprobada': COTIZACION_STATUS.APROBADA,   // aprobada -> aprobada (mantener)
};

// Mapeo para migrar status de pagos legacy
export const PAGO_STATUS_MIGRATION_MAP: Record<string, PagoStatus> = {
    'pending': PAGO_STATUS.PENDING,           // pending -> pending (mantener)
    'pendiente': PAGO_STATUS.PENDING,         // pendiente -> pending
    'paid': PAGO_STATUS.PAID,                 // paid -> paid (mantener)
    'completado': PAGO_STATUS.PAID,           // completado -> paid
    'succeeded': PAGO_STATUS.PAID,            // succeeded -> paid
};

// Funciones para aplicar migración
export function migrarEventoStatus(legacyStatus: string): EventoStatus {
    return EVENTO_STATUS_MIGRATION_MAP[legacyStatus.toLowerCase()] || EVENTO_STATUS.PENDIENTE;
}

export function migrarCotizacionStatus(legacyStatus: string): CotizacionStatus {
    return COTIZACION_STATUS_MIGRATION_MAP[legacyStatus.toLowerCase()] || COTIZACION_STATUS.PENDIENTE;
}

export function migrarPagoStatus(legacyStatus: string): PagoStatus {
    return PAGO_STATUS_MIGRATION_MAP[legacyStatus.toLowerCase()] || PAGO_STATUS.PENDING;
}

// ========================================
// FLUJOS DE NEGOCIO - Rutas lógicas de status
// ========================================

// Flujo de Webhook Exitoso (Stripe Payment Success)
export const WEBHOOK_SUCCESS_FLOW = {
    // Cuando un prospecto paga un servicio exitosamente
    EVENTO: EVENTO_STATUS.APROBADO,        // evento -> aprobado
    COTIZACION: COTIZACION_STATUS.APROBADA, // cotización -> aprobada
    PAGO: PAGO_STATUS.PAID,                // pago -> paid
    AGENDA: AGENDA_STATUS.CONFIRMADO,      // agenda -> confirmado
    CLIENTE: CLIENTE_STATUS.CLIENTE        // prospecto -> cliente
} as const;

// Flujo de Creación Manual
export const MANUAL_CREATION_FLOW = {
    // Estados iniciales al crear manualmente
    CLIENTE: CLIENTE_STATUS.PROSPECTO,      // nuevo cliente -> prospecto
    EVENTO: EVENTO_STATUS.PENDIENTE,        // nuevo evento -> pendiente
    COTIZACION: COTIZACION_STATUS.PENDIENTE, // nueva cotización -> pendiente
    AGENDA: AGENDA_STATUS.PENDIENTE,        // nueva cita -> pendiente
    PAGO: PAGO_STATUS.PENDING               // nuevo pago -> pending
} as const;

// Flujo de Autorización Manual
export const MANUAL_APPROVAL_FLOW = {
    // Cuando se autoriza manualmente sin pago
    EVENTO: EVENTO_STATUS.APROBADO,         // evento -> aprobado
    COTIZACION: COTIZACION_STATUS.APROBADA, // cotización -> aprobada
    AGENDA: AGENDA_STATUS.CONFIRMADO,       // agenda -> confirmado
    CLIENTE: CLIENTE_STATUS.CLIENTE         // prospecto -> cliente  
} as const;
