import { z } from 'zod';

// =====================================
// ENUMS Y CONSTANTES
// =====================================

export const GASTO_STATUS = {
    ACTIVO: 'activo',
    CANCELADO: 'cancelado'
} as const;

export const GASTO_CATEGORIAS = {
    OFICINA: 'oficina',
    TRANSPORTE: 'transporte',
    MARKETING: 'marketing',
    SERVICIOS: 'servicios',
    EQUIPAMIENTO: 'equipamiento',
    OTROS: 'otros'
} as const;

export const METODOS_PAGO_GASTO = {
    EFECTIVO: 'efectivo',
    TRANSFERENCIA: 'transferencia',
    TARJETA: 'tarjeta',
    CHEQUE: 'cheque'
} as const;

export const TIPO_TRANSACCION = {
    INGRESO: 'ingreso',
    EGRESO: 'egreso'
} as const;

export const CATEGORIA_TRANSACCION = {
    ABONO: 'abono',
    HONORARIOS: 'honorarios',
    SERVICIO: 'servicio',
    PRODUCTO: 'producto',
    COMISION: 'comision',
    AJUSTE: 'ajuste',
    GASTO: 'gasto'
} as const;

// =====================================
// SCHEMAS DE VALIDACIÓN
// =====================================

export const GastoCreateSchema = z.object({
    concepto: z.string().min(1, 'El concepto es requerido').max(255, 'Máximo 255 caracteres'),
    descripcion: z.string().optional(),
    monto: z.number().positive('El monto debe ser mayor a 0'),
    categoria: z.enum([
        GASTO_CATEGORIAS.OFICINA,
        GASTO_CATEGORIAS.TRANSPORTE,
        GASTO_CATEGORIAS.MARKETING,
        GASTO_CATEGORIAS.SERVICIOS,
        GASTO_CATEGORIAS.EQUIPAMIENTO,
        GASTO_CATEGORIAS.OTROS
    ]),
    subcategoria: z.string().optional(),
    fecha: z.date().default(() => new Date()),
    fechaFactura: z.date().optional(),
    metodoPago: z.enum([
        METODOS_PAGO_GASTO.EFECTIVO,
        METODOS_PAGO_GASTO.TRANSFERENCIA,
        METODOS_PAGO_GASTO.TARJETA,
        METODOS_PAGO_GASTO.CHEQUE
    ]).optional(),
    numeroFactura: z.string().optional(),
    proveedor: z.string().optional(),
    eventoId: z.string().optional(),
    usuarioId: z.string().min(1, 'El usuario es requerido'),
    comprobanteUrl: z.string().url().optional()
});

export const GastoUpdateSchema = GastoCreateSchema.partial().extend({
    id: z.string().min(1, 'ID requerido'),
    status: z.enum([GASTO_STATUS.ACTIVO, GASTO_STATUS.CANCELADO]).optional()
});

export const GastoFilterSchema = z.object({
    fechaInicio: z.date().optional(),
    fechaFin: z.date().optional(),
    categoria: z.string().optional(),
    subcategoria: z.string().optional(),
    eventoId: z.string().optional(),
    usuarioId: z.string().optional(),
    status: z.enum([GASTO_STATUS.ACTIVO, GASTO_STATUS.CANCELADO]).optional(),
    proveedor: z.string().optional(),
    montoMin: z.number().optional(),
    montoMax: z.number().optional()
});

export const BalanceGeneralFilterSchema = z.object({
    fechaInicio: z.date(),
    fechaFin: z.date(),
    eventoId: z.string().optional(),
    incluirNomina: z.boolean().default(true),
    incluirGastos: z.boolean().default(true)
});

// =====================================
// TIPOS TYPESCRIPT
// =====================================

export type GastoCreate = z.infer<typeof GastoCreateSchema>;
export type GastoUpdate = z.infer<typeof GastoUpdateSchema>;
export type GastoFilter = z.infer<typeof GastoFilterSchema>;
export type BalanceGeneralFilter = z.infer<typeof BalanceGeneralFilterSchema>;

export interface Gasto {
    id: string;
    concepto: string;
    descripcion?: string;
    monto: number;
    categoria: string;
    subcategoria?: string;
    fecha: Date;
    fechaFactura?: Date;
    status: string;
    metodoPago?: string;
    numeroFactura?: string;
    proveedor?: string;
    eventoId?: string;
    usuarioId: string;
    comprobanteUrl?: string;
    createdAt: Date;
    updatedAt: Date;

    // Relaciones opcionales
    Evento?: {
        id: string;
        nombre: string;
        fecha_evento: Date;
    };
    Usuario?: {
        id: string;
        username?: string;
        email?: string;
    };
}

export interface ResumenFinanciero {
    periodo: {
        fechaInicio: Date;
        fechaFin: Date;
    };
    ingresos: {
        total: number;
        pagosConfirmados: number;
        pagosPendientes: number;
        cantidad: number;
    };
    egresos: {
        total: number;
        nomina: number;
        gastos: number;
        cantidad: number;
    };
    balance: {
        neto: number;
        porcentajeUtilidad: number;
    };
    comparacion?: {
        periodoAnterior: {
            ingresos: number;
            egresos: number;
            balance: number;
        };
        variacion: {
            ingresos: number;
            egresos: number;
            balance: number;
        };
    };
}

export interface EstadisticasGastos {
    totalMonto: number;
    promedioMonto: number;
    cantidadGastos: number;
    gastoPorCategoria: Array<{
        categoria: string;
        total: number;
        cantidad: number;
        porcentaje: number;
    }>;
    gastoPorMes: Array<{
        mes: string;
        total: number;
        cantidad: number;
    }>;
    topProveedores: Array<{
        proveedor: string;
        total: number;
        cantidad: number;
    }>;
}

export interface NominaResumen {
    totalPendiente: number;
    totalAutorizado: number;
    totalPagado: number;
    cantidadPendiente: number;
    cantidadAutorizada: number;
    cantidadPagada: number;
    proximosPagos: Array<{
        id: string;
        usuario: string;
        monto: number;
        concepto: string;
        status: string; // Agregado para manejar estados de nómina
        fechaAsignacion: Date;
        fechaPago?: Date;
        cliente?: string;
        evento?: string;
        fechaEvento?: Date;
        eventoId?: string;
    }>;
}

// =====================================
// RESPONSES ESTÁNDAR
// =====================================

export interface ActionResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}
