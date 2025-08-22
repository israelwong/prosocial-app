// =====================================
// EXPORTACIONES CENTRALIZADAS - FINANZAS
// =====================================

// Schemas y tipos
export * from './finanzas.schemas';

// Actions de pagos
export * from '../pagos';

// Actions de gastos
export {
    crearGasto,
    actualizarGasto,
    obtenerGastoPorId,
    listarGastos,
    cancelarGasto,
    obtenerEstadisticasGastos
} from './gastos.actions';

// Actions de reportes
export {
    obtenerBalanceGeneral,
    obtenerResumenNomina,
    obtenerPagosEntrantes
} from './reportes.actions';

// Actions de proyección financiera (NUEVO)
export {
    obtenerProyeccionFinanciera,
    obtenerMetricasDelMes,
    obtenerHistorialCobranza
} from './proyeccion.actions';

// Re-exportar actions existentes de nómina para centralizar
export {
    crearNominaIndividual,
    autorizarPago,
    cancelarPago
} from '../seguimiento/nomina.actions';
