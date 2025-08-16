import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase URL or Anon Key')
}

// Cliente base de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
})

// Funciones de suscripción para tiempo real
export const suscribirCotizacion = (cotizacionId: string, callback: (payload: any) => void) => {
    const channel = supabase
        .channel(`cotizacion:${cotizacionId}`)
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

// Función para desuscribirse
export const desuscribirCotizacion = (channel: any) => {
    return supabase.removeChannel(channel)
}

// Función para verificar estado de conexión
export const verificarConexionRealtime = () => {
    return supabase.realtime.isConnected()
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
