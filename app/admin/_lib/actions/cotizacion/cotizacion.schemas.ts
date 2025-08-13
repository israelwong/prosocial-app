import { z } from 'zod';

// Schema para validar servicios en cotización
export const CotizacionServicioSchema = z.object({
    servicioId: z.string().min(1, 'ID de servicio requerido'),
    servicioCategoriaId: z.string().min(1, 'ID de categoría requerido'),
    cantidad: z.number().min(1, 'Cantidad debe ser mayor a 0'),
    precioUnitario: z.number().min(0, 'Precio unitario debe ser mayor o igual a 0'),
    costo: z.number().min(0, 'Costo debe ser mayor o igual a 0'),
    nombre: z.string().min(1, 'Nombre del servicio requerido'),
    posicion: z.number().default(0)
});

// Schema para crear cotización nueva
export const CotizacionNuevaSchema = z.object({
    eventoId: z.string().min(1, 'ID de evento requerido'),
    eventoTipoId: z.string().min(1, 'Tipo de evento requerido'),
    nombre: z.string().min(1, 'Nombre de cotización requerido'),
    precio: z.number().min(0, 'Precio debe ser mayor o igual a 0'),
    condicionesComercialesId: z.string().optional(),
    servicios: z.array(CotizacionServicioSchema).min(1, 'Debe incluir al menos un servicio')
});

// Schema para editar cotización existente
export const CotizacionEditarSchema = z.object({
    id: z.string().min(1, 'ID de cotización requerido'),
    nombre: z.string().min(1, 'Nombre de cotización requerido'),
    precio: z.number().min(0, 'Precio debe ser mayor o igual a 0'),
    condicionesComercialesId: z.string().optional(),
    status: z.enum(['pending', 'aprobado', 'rechazado']).default('pending'),
    visible_cliente: z.boolean().default(true),
    servicios: z.array(CotizacionServicioSchema)
});

// Schema para parámetros de URL
export const CotizacionParamsSchema = z.object({
    eventoId: z.string().min(1, 'ID de evento requerido'),
    tipoEventoId: z.string().optional(),
    paqueteId: z.string().optional(),
    cotizacionId: z.string().optional()
});

// Tipos derivados de los schemas
export type CotizacionServicio = z.infer<typeof CotizacionServicioSchema>;
export type CotizacionNueva = z.infer<typeof CotizacionNuevaSchema>;
export type CotizacionEditar = z.infer<typeof CotizacionEditarSchema>;
export type CotizacionParams = z.infer<typeof CotizacionParamsSchema>;

// Schema para formulario cliente (react-hook-form)
export const CotizacionFormSchema = z.object({
    nombre: z.string().min(1, 'Nombre de cotización requerido'),
    eventoTipoId: z.string().min(1, 'Tipo de evento requerido'),
    condicionesComercialesId: z.string().optional(),
    servicios: z.array(z.object({
        servicioId: z.string(),
        cantidad: z.string()
    }))
});

export type CotizacionForm = z.infer<typeof CotizacionFormSchema>;
