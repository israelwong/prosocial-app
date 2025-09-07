import { z } from 'zod';
import { COTIZACION_STATUS } from '../../constants/status';

// Schema para validar servicios en cotización con snapshot completo
// Estructura de trazabilidad: Sección → Categoría → Servicio → Precio → Cantidad
export const CotizacionServicioSchema = z.object({
    servicioId: z.string().nullable(), // Permitir null para servicios personalizados
    servicioCategoriaId: z.string().nullable(), // Permitir null para servicios personalizados
    cantidad: z.number().min(1, 'Cantidad debe ser mayor a 0'),

    // Campos snapshot para trazabilidad (estructura jerárquica)
    seccion_nombre_snapshot: z.string().optional(),
    categoria_nombre_snapshot: z.string().optional(),
    nombre_snapshot: z.string().min(1, 'Nombre del servicio requerido'),
    descripcion_snapshot: z.string().optional(),

    // Precios y costos snapshot
    precio_unitario_snapshot: z.number().min(0, 'Precio unitario debe ser mayor o igual a 0'),
    costo_snapshot: z.number().min(0, 'Costo debe ser mayor o igual a 0'),
    gasto_snapshot: z.number().min(0, 'Gasto debe ser mayor o igual a 0'),
    utilidad_snapshot: z.number().min(0, 'Utilidad debe ser mayor o igual a 0'),
    precio_publico_snapshot: z.number().min(0, 'Precio público debe ser mayor o igual a 0'),
    tipo_utilidad_snapshot: z.enum(['servicio', 'producto']).default('servicio'),

    // Campos operacionales actuales
    precioUnitario: z.number().min(0, 'Precio unitario debe ser mayor o igual a 0'),

    // Campos personalización
    es_personalizado: z.boolean().default(false),
    servicio_original_id: z.string().optional(),

    posicion: z.number().default(0)
});

// Schema para costos adicionales
export const CotizacionCostoSchema = z.object({
    nombre: z.string().min(1, 'Nombre del costo requerido'),
    descripcion: z.string().optional(),
    costo: z.number().min(0, 'Costo debe ser mayor o igual a 0'),
    tipo: z.enum(['sesion', 'evento', 'descuento']).default('sesion'),
    posicion: z.number().default(0)
});

// Schema para crear cotización nueva
export const CotizacionNuevaSchema = z.object({
    eventoId: z.string().min(1, 'ID de evento requerido'),
    eventoTipoId: z.string().min(1, 'Tipo de evento requerido'),
    nombre: z.string().min(1, 'Nombre de cotización requerido'),
    descripcion: z.string().optional(),
    precio: z.number().min(0, 'Precio debe ser mayor o igual a 0'),
    dias_minimos_contratacion: z.number().min(1, 'Días mínimos debe ser mayor a 0').max(365, 'Días mínimos no puede exceder 365').default(5),
    condicionesComercialesId: z.string().optional(),
    servicios: z.array(CotizacionServicioSchema).min(1, 'Debe incluir al menos un servicio'),
    costos: z.array(CotizacionCostoSchema).optional().default([])
});

// Schema para editar cotización existente
export const CotizacionEditarSchema = z.object({
    id: z.string().min(1, 'ID de cotización requerido'),
    nombre: z.string().min(1, 'Nombre de cotización requerido'),
    descripcion: z.string().optional(),
    precio: z.number().min(0, 'Precio debe ser mayor o igual a 0'),
    dias_minimos_contratacion: z.number().min(1, 'Días mínimos debe ser mayor a 0').max(365, 'Días mínimos no puede exceder 365').default(5),
    condicionesComercialesId: z.string().optional(),
    status: z.enum([
        COTIZACION_STATUS.PENDIENTE,
        COTIZACION_STATUS.APROBADA,
        COTIZACION_STATUS.RECHAZADA,
        COTIZACION_STATUS.AUTORIZADO,
        COTIZACION_STATUS.EXPIRADA,
        COTIZACION_STATUS.ARCHIVADA
    ] as const).default(COTIZACION_STATUS.PENDIENTE),
    visible_cliente: z.boolean().default(true),
    servicios: z.array(CotizacionServicioSchema),
    costos: z.array(CotizacionCostoSchema).optional().default([])
});

// Schema para parámetros de URL
export const CotizacionParamsSchema = z.object({
    eventoId: z.string().min(1, 'ID de evento requerido'),
    tipoEventoId: z.string().optional(),
    paqueteId: z.string().optional(),
    cotizacionId: z.string().optional()
});

// Schema para formulario cliente (react-hook-form)
export const CotizacionFormSchema = z.object({
    nombre: z.string().min(1, 'Nombre de cotización requerido'),
    descripcion: z.string().optional(),
    dias_minimos_contratacion: z.number().min(1, 'Días mínimos debe ser mayor a 0').max(365, 'Días mínimos no puede exceder 365').default(5),
    eventoTipoId: z.string().min(1, 'Tipo de evento requerido'),
    condicionesComercialesId: z.string().optional(),
    servicios: z.array(z.object({
        servicioId: z.string(),
        cantidad: z.string(),
        precioPersonalizado: z.string().optional() // Campo para precio personalizado
    })),
    costos: z.array(z.object({
        nombre: z.string(),
        costo: z.string(),
        tipo: z.enum(['sesion', 'evento', 'descuento']).default('sesion')
    })).optional().default([])
});

// Schema para agregar servicio personalizado al vuelo
export const ServicioPersonalizadoSchema = z.object({
    nombre: z.string().min(1, 'Nombre requerido'),
    descripcion: z.string().optional(),
    precioUnitario: z.number().min(0, 'Precio debe ser mayor o igual a 0'),
    costo: z.number().min(0, 'Costo debe ser mayor o igual a 0'),
    gasto: z.number().min(0, 'Gasto debe ser mayor o igual a 0'),
    tipo_utilidad: z.enum(['servicio', 'producto']).default('servicio'),
    categoria_nombre: z.string().min(1, 'Categoría requerida'),
    seccion_nombre: z.string().optional(),
    cantidad: z.number().min(1, 'Cantidad debe ser mayor a 0').default(1),
    guardar_en_catalogo: z.boolean().default(false)
});

// Tipos derivados de los schemas
export type CotizacionServicio = z.infer<typeof CotizacionServicioSchema>;
export type CotizacionCosto = z.infer<typeof CotizacionCostoSchema>;
export type CotizacionNueva = z.infer<typeof CotizacionNuevaSchema>;
export type CotizacionEditar = z.infer<typeof CotizacionEditarSchema>;
export type CotizacionParams = z.infer<typeof CotizacionParamsSchema>;
export type CotizacionForm = z.infer<typeof CotizacionFormSchema>;
export type ServicioPersonalizado = z.infer<typeof ServicioPersonalizadoSchema>;
