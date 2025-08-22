// =====================================
// EXPORTACIONES DE PAGOS
// =====================================

export {
    // Obtener pagos
    obtenerPagos,
    obtenerPago,
    obtenerPagoCompleto,
    obtenerPagosCotizacion,
    obtenerPagoSesionStripe,

    // CRUD pagos
    crearPago,
    actualizarPago,
    eliminarPago,

    // Detalles y balances
    obtenerDetallesPago,
    obtenerBalancePagosEvento,
    ontenerDetallesPago, // Mantener para compatibilidad (typo en original)

    // Stripe
    validarPagoStripe,
    promesPagoSPEI
} from './pago.actions';
