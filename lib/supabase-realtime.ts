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
            eventsPerSecond: 5, // Reducido de 10 a 5
            heartbeatIntervalMs: 30000,
            reconnectAfterMs: function (tries: number) {
                return [1000, 2000, 5000, 10000][tries - 1] || 10000
            }
        },
        // Configuración adicional para prevenir conexiones múltiples
        log_level: 'info',
        timeout: 20000
    },
    auth: {
        persistSession: false, // Evita conexiones persistentes innecesarias
        autoRefreshToken: false
    },
    db: {
        // Configuración de pool de conexiones más conservadora
        schema: 'public'
    }
})

// Funciones de suscripción para tiempo real con manejo de errores mejorado
export const suscribirCotizacion = (cotizacionId: string, callback: (payload: any) => void) => {
    // Verificar si ya hay demasiadas conexiones activas
    if (supabase.realtime.channels.length > 3) {
        console.warn('Demasiadas conexiones Realtime activas, limpiando...')
        // Limpiar conexiones huérfanas
        supabase.realtime.channels.forEach((channel, index) => {
            if (index < supabase.realtime.channels.length - 3) {
                supabase.removeChannel(channel)
            }
        })
    }

    const channel = supabase
        .channel(`cotizacion:${cotizacionId}`, {
            config: {
                presence: { key: 'user' },
                broadcast: { self: false }
            }
        })
        .on('postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'Cotizacion',
                filter: `id=eq.${cotizacionId}`
            },
            (payload) => {
                console.log('Cotización actualizada:', payload)
                callback({ ...payload, table: 'Cotizacion' })
            }
        )
        .on('postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'CotizacionServicio',
                filter: `cotizacionId=eq.${cotizacionId}`
            },
            (payload) => {
                console.log('Servicios actualizados:', payload)
                callback({ ...payload, table: 'CotizacionServicio' })
            }
        )
        .on('postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'CotizacionCosto',
                filter: `cotizacionId=eq.${cotizacionId}`
            },
            (payload) => {
                console.log('Costos actualizados:', payload)
                callback({ ...payload, table: 'CotizacionCosto' })
            }
        )
        .subscribe()

    return channel
}

// Función para desuscribirse con cleanup mejorado
export const desuscribirCotizacion = (channel: any) => {
    if (channel) {
        return supabase.removeChannel(channel)
    }
    return Promise.resolve()
}

// Función para limpiar todas las conexiones
export const limpiarConexionesRealtime = () => {
    const channels = supabase.realtime.channels
    console.log(`Limpiando ${channels.length} conexiones Realtime`)

    channels.forEach(channel => {
        supabase.removeChannel(channel)
    })

    return channels.length
}

// Función para verificar estado de conexión con más información
export const verificarConexionRealtime = () => {
    const isConnected = supabase.realtime.isConnected()
    const channelCount = supabase.realtime.channels.length

    return {
        isConnected,
        channelCount,
        status: isConnected ? 'conectado' : 'desconectado',
        warning: channelCount > 5 ? 'Demasiadas conexiones activas' : null
    }
}

// Función para monitorear conexiones
export const monitorearConexiones = () => {
    const info = verificarConexionRealtime()
    console.log('Estado Realtime:', info)

    if (info.channelCount > 5) {
        console.warn('⚠️ Demasiadas conexiones Realtime activas:', info.channelCount)
        return false
    }

    return true
}

// Estados de cotización
export const ESTADOS_COTIZACION = {
    PENDIENTE: 'pendiente',
    APROBADA: 'aprobada',
    RECHAZADA: 'rechazada',
    EXPIRADA: 'expirada',
    EN_SESION: 'en_sesion' // Nuevo estado para sesiones en vivo
} as const

// Estados de evento
export const ESTADOS_EVENTO = {
    ACTIVE: 'active',
    CONTRATADO: 'contratado',
    CANCELADO: 'cancelado'
} as const
