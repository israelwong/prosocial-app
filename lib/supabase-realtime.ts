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

export const desuscribirCotizacion = (channel: any) => {
    if (channel) {
        return supabase.removeChannel(channel)
    }
    return Promise.resolve()
}

export const limpiarConexionesRealtime = () => {
    const channels = supabase.realtime.channels
    console.log(`Limpiando ${channels.length} conexiones Realtime`)

    channels.forEach(channel => {
        supabase.removeChannel(channel)
    })

    return channels.length
}

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

export const monitorearConexiones = () => {
    const info = verificarConexionRealtime()
    console.log('Estado Realtime:', info)

    if (info.channelCount > 5) {
        console.warn('⚠️ Demasiadas conexiones Realtime activas:', info.channelCount)
        return false
    }

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
