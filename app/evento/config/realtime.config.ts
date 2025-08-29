/**
 * Configuración de funcionalidades realtime para páginas públicas de eventos
 * 
 * NOTA DE RENDIMIENTO:
 * Si experimentas problemas de RAM o lentitud en el navegador,
 * puedes deshabilitar estas funcionalidades cambiando los valores a false.
 */

export const REALTIME_CONFIG = {
    // Habilitar actualizaciones en tiempo real de cotizaciones
    cotizacionesRealtime: false, // Deshabilitado por problemas de rendimiento

    // Habilitar notificaciones visuales de cambios
    notificacionesVisuales: false, // Deshabilitado por problemas de rendimiento

    // Tiempo de duración de las notificaciones (ms)
    duracionNotificaciones: 5000,

    // Delay para conectar suscripciones (prevenir race conditions)
    delayConexion: 100,

    // Timeout para scroll automático después de notificación
    timeoutScroll: 500
} as const

/**
 * Para habilitar realtime en desarrollo o producción específica:
 * 
 * 1. Cambiar cotizacionesRealtime a true
 * 2. Cambiar notificacionesVisuales a true
 * 3. Monitorear el uso de memoria en el navegador
 * 4. Si hay problemas, volver a deshabilitar
 */
