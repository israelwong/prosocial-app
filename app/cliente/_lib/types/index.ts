/**
 * Tipos compartidos del cliente
 */

// Cliente
export interface Cliente {
    id: string
    nombre: string
    email: string
    telefono?: string
}

// Evento
export interface Evento {
    id: string
    nombre: string
    fecha_evento: string
    hora_evento: string
    numero_invitados: number
    lugar: string
    cotizacion: {
        id: string
        status: string
        total: number
        pagado: number
    }
}

// Evento con detalles
export interface EventoDetalle extends Evento {
    direccion?: string
    sede?: string
    eventoTipo?: {
        id: string
        nombre: string
    }
    eventoEtapa?: {
        id: string
        nombre: string
    }
    cotizacion: {
        id: string
        status: string
        total: number
        pagado: number
        descripcion?: string
        servicios: ServicioCotizacion[]
    }
}

// Servicio en cotización
export interface ServicioCotizacion {
    id: string
    nombre: string
    cantidad: number
    precio_unitario?: number
    subtotal?: number
    seccion?: string
    categoria?: string
    seccionPosicion?: number
    categoriaPosicion?: number
    posicion?: number
}

// Cotización para pago
export interface CotizacionPago {
    id: string
    total: number
    pagado: number
    evento: {
        id: string
        nombre: string
        fecha_evento: string
        lugar: string
        numero_invitados: number
    }
    cliente: {
        id: string
        nombre: string
        email: string
        telefono: string
    }
}

// Lead
export interface Lead {
    id: string
    nombre: string
    email: string
    telefono: string
    tipoEvento: string
    fechaEvento: string
    numeroInvitados: number
    presupuesto?: number
    mensaje?: string
    status: string
    fechaCreacion: string
}

// Datos de login
export interface LoginData {
    email: string
    telefono: string
}

// Datos de sesión de pago
export interface SesionPagoData {
    cotizacionId: string
    monto: number
    clienteEmail: string
    clienteNombre: string
    eventoNombre: string
}

// Respuestas genéricas de API
export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    message?: string
}

export interface ApiError {
    success: false
    message: string
}
