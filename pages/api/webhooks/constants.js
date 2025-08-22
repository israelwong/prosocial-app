// Constantes para webhooks de Stripe
// Este archivo contiene solo las constantes necesarias para evitar problemas de importación TypeScript

export const WEBHOOK_SUCCESS_FLOW = {
  // Cuando un prospecto paga un servicio exitosamente
  EVENTO: "aprobado", // evento -> aprobado
  COTIZACION: "aprobada", // cotización -> aprobada
  PAGO: "paid", // pago -> paid
  AGENDA: "confirmado", // agenda -> confirmado
  CLIENTE: "cliente", // prospecto -> cliente
};

export const PAGO_STATUS = {
  PENDING: "pending",
  PENDIENTE: "pendiente",
  PAID: "paid",
  COMPLETADO: "completado",
  FAILED: "failed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

export const EVENTO_STATUS = {
  PENDIENTE: "pendiente",
  APROBADO: "aprobado",
  CANCELADO: "cancelado",
  COMPLETADO: "completado",
  ARCHIVADO: "archivado",
};

export const COTIZACION_STATUS = {
  PENDIENTE: "pendiente",
  APROBADA: "aprobada",
  RECHAZADA: "rechazada",
  EXPIRADA: "expirada",
  ARCHIVADA: "archivada",
};

export const CLIENTE_STATUS = {
  PROSPECTO: "prospecto",
  ACTIVO: "activo",
  CLIENTE: "cliente",
  INACTIVO: "inactivo",
  ARCHIVADO: "archivado",
};
