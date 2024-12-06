export interface User {
    id?: number;
    email: string;
    username: string;
    token: string;
    role: string;
}
export interface EventoTipo {
    id: string
    nombre: string
    posicion: number
}

export interface ServicioCategoria {
    id: string
    nombre: string
    posicion: number,
}

export interface Servicio {
    id?: string
    servicioCategoriaId?: string
    nombre: string
    costo?: number
    gasto?: number
    utilidad?: number
    precio_publico?: number
    cantidad?: number
    posicion?: number
    visible_cliente?: boolean
    tipo_utilidad?: string
    gastos?: ServicioGasto[]
    status?: string
    createdAt?: Date
    updatedAt?: Date
}

export interface ServicioGasto {
    id?: string;
    servicioId?: string;
    nombre: string;
    costo: number;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
}

export interface Configuracion {
    id?: string
    nombre: string
    utilidad_producto: number
    utilidad_servicio: number
    comision_venta: number
    sobreprecio: number
    status?: string | null
    createdAt?: Date | undefined
    updatedAt?: Date | undefined
}

export interface Configuracion {
    id?: string
    nombre: string
    utilidad_producto: number
    utilidad_servicio: number
    comision_venta: number
    sobreprecio: number
    status?: string | null
    createdAt?: Date | undefined
    updatedAt?: Date | undefined
}

export interface Paquete {
    id?: string
    eventoTipoId: string
    nombre: string
    costo?: number | null
    gasto?: number | null
    utilidad?: number | null
    precio?: number | null
    servicios?: PaqueteServicio[]
    posicion?: number
    status?: string | null
    createdAt?: Date
    updatedAt?: Date
}

export interface PaqueteServicio {
    id?: string
    paqueteId: string
    servicioId: string
    servicioCategoriaId: string
    cantidad: number
    status?: string
    posicion?: number
    visible_cliente?: boolean
    createdAt?: Date
    updatedAt?: Date
}

export interface Canal {
    id?: string
    nombre: string
    posicion: number
    createdAt?: Date
    updatedAt?: Date
}

export interface Cliente {
    id?: string;
    nombre: string;
    email?: string | null;
    telefono: string | null;
    direccion?: string | null;
    etapa: string; // prospecto, cliente
    status?: string; // 1 nuevo, 2 seguimiento, 3 archivado
    canalId?: string | null; // canal de adquisición
    createdAt?: Date;
    updatedAt?: Date;
    // para asociar a evento
    nombreEvento?: string;
    fechaCelebracion?: Date;
    eventoTipoId?: string;

}

export interface Evento {
    id?: string
    clienteId: string
    eventoTipoId: string | null //
    tipoEvento?: string // para mostrar en la lista de eventos
    nombre: string
    fecha_evento: Date
    status?: string
    createdAt?: Date
    updatedAt?: Date
}

export interface Cotizacion {
    id?: string
    eventoTipoId: string
    eventoId: string
    nombre: string
    precio: number
    condicionesComercialesId?: string | null
    condicionesComercialesMetodoPagoId?: string | null
    status?: string
    servicios?: Servicio[];
    createdAt?: Date
    updatedAt?: Date
}

export interface CotizacionServicio {
    id?: string
    cotizacionId: string
    servicioId: string
    servicioCategoriaId?: string
    cantidad: number
    posicion: number
    precio: number
    createdAt?: Date
    updatedAt?: Date
}

export interface MetodoPago {
    id?: string
    metodo_pago?: string
    comision_porcentaje_base?: number | null
    comision_fija_monto?: number | null
    num_msi?: number | null
    comision_msi_porcentaje?: number | null
    orden?: number | null
    status?: string
    createdAt?: Date
    updatedAt?: Date
    metodosPago?: MetodoPago[] | null
    nombre?: string
}

export interface CondicionesComerciales {
    id?: string
    nombre?: string
    descripcion?: string | null
    descuento?: number | null
    status?: string
    createdAt?: Date
    updatedAt?: Date
    metodosPago?: MetodoPago[] | null
    orden?: number | null // para mostrar la lista
}

export interface CondicionesComercialesMetodoPago {
    id?: string
    condicionesComercialesId: string
    metodoPagoId: string
    status?: string
    createdAt?: Date
    updatedAt?: Date
    orden?: number | null
}

export interface CotizacionDetalleEvento {
    error?: string;
    evento?: {
        eventoTipoId: string | null;
        nombre: string;
        clienteId: string;
        fecha_evento: Date;
    };
    eventoTipo?: {
        nombre: string;
    } | null;
    cliente?: {
        nombre: string;
    };
}

export interface Image {
    name: string;
    width: number;
    height: number;
}