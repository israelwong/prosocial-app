// ========================================
// EVENTO ETAPAS - IDs de las etapas de eventos
// ========================================

export const EVENTO_ETAPAS = {
    NUEVO: 'cm6498oqp0000gu1ax8qnuuu8',        // Evento nuevo/inicial
    SEGUIMIENTO: 'cm6498zw00001gu1a67s88y5h', // Evento en seguimiento
    APROBADO: 'cm6499aqs0002gu1ae4k1a7ls',    // Evento aprobado
    // Agregar más etapas según sea necesario
} as const;

export type EventoEtapaId = typeof EVENTO_ETAPAS[keyof typeof EVENTO_ETAPAS];

// Función para validar si un ID de etapa es válido
export function isValidEventoEtapaId(etapaId: string): etapaId is EventoEtapaId {
    return Object.values(EVENTO_ETAPAS).includes(etapaId as EventoEtapaId);
}

// Mapeo de nombres a IDs para facilitar el uso
export const EVENTO_ETAPA_NAMES = {
    'nuevo': EVENTO_ETAPAS.NUEVO,
    'seguimiento': EVENTO_ETAPAS.SEGUIMIENTO,
    'aprobado': EVENTO_ETAPAS.APROBADO,
} as const;

// Función para obtener ID de etapa por nombre
export function getEventoEtapaId(nombre: keyof typeof EVENTO_ETAPA_NAMES): string {
    return EVENTO_ETAPA_NAMES[nombre];
}
