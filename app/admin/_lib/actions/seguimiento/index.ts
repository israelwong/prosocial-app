// Ruta: app/admin/_lib/actions/seguimiento/index.ts

// Exports del módulo principal de seguimiento
export {
    obtenerEventosSeguimientoPorEtapa,
    obtenerEventosSeguimientoPorEtapaListaAprobados,
    obtenerEventosSeguimiento,
    obtenerEtapasSeguimiento,
    actualizarEtapaEvento,
    obtenerMetricasSeguimiento
} from './seguimiento.actions';

export * from './seguimiento.schemas';

// Exports del módulo de detalle de seguimiento
export * from './seguimiento-detalle.index';

export type {
    SeguimientoBusquedaForm,
    SeguimientoEtapaUpdateForm,
    EventoSeguimiento,
    EtapaSeguimiento,
    SeguimientoEtapas
} from './seguimiento.schemas';
