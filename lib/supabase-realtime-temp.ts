import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase URL or Anon Key')
}

// Cliente base de Supabase con configuración optimizada
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
        params: {
            eventsPerSecond: 5,
            heartbeatIntervalMs: 30000,
            reconnectAfterMs: function (tries: number) {
                return [1000, 2000, 5000, 10000][tries - 1] || 10000
            }
        },
        log_level: 'info',
        timeout: 20000
    },
    auth: {
        persistSession: false,
        autoRefreshToken: false
    },
    db: {
        schema: 'public'
    }
})

// TEMPORAL: Funciones de realtime deshabilitadas para evitar conflictos de schema
export const suscribirCotizacion = (cotizacionId: string, callback: (payload: any) => void) => {
    console.warn('Realtime temporalmente deshabilitado debido a drift de schema')
    return null
}

export const desuscribirCotizacion = (channel: any) => {
    console.warn('Realtime temporalmente deshabilitado')
    return Promise.resolve()
}

export const limpiarConexionesRealtime = () => {
    console.warn('Realtime temporalmente deshabilitado')
    return 0
}

export const verificarConexionRealtime = () => {
    return {
        isConnected: false,
        channelCount: 0,
        status: 'deshabilitado temporalmente',
        warning: 'Realtime deshabilitado debido a drift de schema'
    }
}

export const monitorearConexiones = () => {
    console.warn('Realtime temporalmente deshabilitado')
    return true
}

export const ESTADOS_COTIZACION = {
    BORRADOR: 'borrador',
    ENVIADA: 'enviada',
    APROBADA: 'aprobada',
    RECHAZADA: 'rechazada',
    EXPIRADA: 'expirada'
} as const

export const ESTADOS_EVENTO = {
    PROSPECTO: 'prospecto',
    CONFIRMADO: 'confirmado'
} as const
