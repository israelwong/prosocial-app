// Ruta: app/admin/_lib/actions/seguimiento/seguimiento-detalle.index.ts

// Exports de schemas y tipos
export * from './seguimiento-detalle.schemas';

// Exports de actions
export {
    obtenerEventoDetalleCompleto,
    actualizarEtapaEventoDetalle,
    crearPagoEventoDetalle,
    actualizarPagoEventoDetalle,
    eliminarPagoEventoDetalle,
    crearAgendaEventoDetalle,
    actualizarAgendaEventoDetalle
} from './seguimiento-detalle.actions';
