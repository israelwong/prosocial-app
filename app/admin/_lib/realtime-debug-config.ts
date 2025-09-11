// =====================================================
// CENTRO DE CONTROL REALTIME - DEBUG SISTEMÁTICO
// =====================================================
// Usar este archivo para controlar todos los sistemas Realtime
// y activarlos uno por uno para identificar problemas

export const REALTIME_DEBUG_CONFIG = {
    // Navbar - Suscripción principal de notificaciones
    NAVBAR_NOTIFICACIONES: true,  // ✅ FUNCIONANDO

    // Dropdown - Suscripción secundaria de notificaciones (solo INSERT)
    DROPDOWN_NOTIFICACIONES: true,  // ✅ FUNCIONANDO

    // Bitácora - Suscripción a EventoBitacora
    EVENTO_BITACORA: false,  // ❌ PERMANENTEMENTE DESACTIVADO - CAUSA SCHEMA MISMATCH

    // Cotizaciones - Suscripción a CotizacionVisita (ya eliminada)
    COTIZACIONES_VISITA: false, // Ya no se usa

    // Dashboard - Conteos y estadísticas múltiples tablas
    SIDEBAR_DASHBOARD: true, // ✅ FUNCIONANDO

    // Área pública - Cotizaciones para clientes
    CLIENTE_COTIZACIONES: true, // ✅ FUNCIONANDO

    // Logs de debug
    ENABLE_REALTIME_LOGS: true
};

// Función helper para logs centralizados
export function logRealtime(component: string, message: string, data?: any) {
    if (REALTIME_DEBUG_CONFIG.ENABLE_REALTIME_LOGS) {
        console.log(`🔄 [${component}] ${message}`, data || '');
    }
}
