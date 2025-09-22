// =====================================================
// CENTRO DE CONTROL REALTIME - CONFIGURACIÓN GLOBAL
// =====================================================
// Control centralizado para activar/desactivar sistemas Realtime
// Útil para debugging, mantenimiento y control granular

export const REALTIME_CONFIG = {
    // Navbar - Suscripción principal de notificaciones
    NAVBAR_NOTIFICACIONES: true,  // ✅ FUNCIONANDO

    // Dropdown - Suscripción secundaria de notificaciones (solo INSERT)
    DROPDOWN_NOTIFICACIONES: true,  // ✅ FUNCIONANDO

    // Bitácora - Suscripción a EventoBitacora
    EVENTO_BITACORA: false,  // ❌ DESACTIVADO - Usa polling por incompatibilidad

    // Cotizaciones - Suscripción a CotizacionVisita (ya eliminada)
    COTIZACIONES_VISITA: false, // Ya no se usa

    // Dashboard - Conteos y estadísticas múltiples tablas
    SIDEBAR_DASHBOARD: true, // ✅ FUNCIONANDO

    // Área pública - Cotizaciones para clientes
    CLIENTE_COTIZACIONES: false, // ✅ FUNCIONANDO

    // Logs de debug
    ENABLE_REALTIME_LOGS: true
};

// Función helper para logs centralizados
export function logRealtime(component: string, message: string, data?: any) {
    if (REALTIME_CONFIG.ENABLE_REALTIME_LOGS) {
        console.log(`🔄 [${component}] ${message}`, data || '');
    }
}
