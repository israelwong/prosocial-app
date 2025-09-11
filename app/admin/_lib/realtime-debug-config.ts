// =====================================================
// CENTRO DE CONTROL REALTIME - DEBUG SISTEMÁTICO
// =====================================================
// Usar este archivo para controlar todos los sistemas Realtime
// y activarlos uno por uno para identificar problemas

export const REALTIME_DEBUG_CONFIG = {
    // Navbar - Suscripción principal de notificaciones
    NAVBAR_NOTIFICACIONES: false,  // DESACTIVAR TODO

    // Dropdown - Suscripción secundaria de notificaciones (solo INSERT)
    DROPDOWN_NOTIFICACIONES: false,  // DESACTIVAR TODO

    // Bitácora - Suscripción a EventoBitacora
    EVENTO_BITACORA: false,  // DESACTIVAR TODO

    // Cotizaciones - Suscripción a CotizacionVisita (ya eliminada)
    COTIZACIONES_VISITA: false, // Ya no se usa

    // Dashboard - Conteos y estadísticas múltiples tablas
    SIDEBAR_DASHBOARD: false, // DESACTIVAR TODO

    // Área pública - Cotizaciones para clientes
    CLIENTE_COTIZACIONES: false, // DESACTIVAR TODO

    // Logs de debug
    ENABLE_REALTIME_LOGS: true
};

// Función helper para logs centralizados
export function logRealtime(component: string, message: string, data?: any) {
    if (REALTIME_DEBUG_CONFIG.ENABLE_REALTIME_LOGS) {
        console.log(`🔄 [${component}] ${message}`, data || '');
    }
}
