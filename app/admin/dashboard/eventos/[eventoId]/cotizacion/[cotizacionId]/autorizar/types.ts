// Tipos compartidos para la página de autorización de cotización
export interface AutorizacionCotizacionData {
    id: string
    total: number
    anticipo: number
    status: string
    Evento: {
        nombre: string
        fecha_evento: string
        Cliente: {
            nombre: string
            email: string | null
            telefono: string | null
        }
        EventoTipo?: {
            nombre: string
        } | null
    }
    Servicio: Array<{
        cantidad: number
        precio_unitario: number
        Servicio: {
            nombre: string
        }
        ServicioCategoria: {
            nombre: string
        }
    }>
}

export interface AutorizacionCuentaBancaria {
    id: string
    banco: string
    beneficiario: string
    clabe: string
    cuenta?: string | null
    sucursal?: string | null
    principal: boolean
}

export interface ConfiguracionComercial {
    totalOriginal: number
    totalFinal: number
    anticipoOriginal: number
    anticipoFinal: number
    porcentajeAnticipo: number
    descuentos: Array<{
        concepto: string
        tipo: 'porcentaje' | 'fijo'
        valor: number
    }>
    observaciones: string
}

export interface MetodoPago {
    cuentaBancariaId: string
    tipoTransferencia: string
    requiereComprobante: boolean
}

export interface CalendarioPagos {
    fechaLimiteAnticipo: Date
    fechaVencimientoRevenue: Date
    penalizaciones: {
        activadas: boolean
        porcentajeDiario: number
    }
    descuentoProntoPago: {
        activado: boolean
        porcentaje: number
        diasAnticipacion: number
    }
}
