// =====================================
// EXPORTACIONES DE AGENDA
// =====================================

export {
    // Búsqueda y obtención
    obtenerAgendasConFiltros,
    obtenerAgenda,
    obtenerAgendasPendientes,

    // CRUD
    crearAgenda,
    actualizarAgenda,
    eliminarAgenda,
    cambiarStatusAgenda,

    // Compatibilidad
    crearAgendaEvento,

    // Funciones migradas desde ROOT (legacy)
    verificarDisponibilidadFechaRootLegacy,
    obtenerAgendaConEventosRootLegacy,
    obtenerAgendaDeEventoRootLegacy,
    eliminarAgendaEventoRootLegacy,
    actualizarStatusAgendaActividadRootLegacy,
    actualizarAgendaEventoRootLegacy
} from './agenda.actions';

export * from './agenda.schemas';
