// Constantes para códigos de etapas del evento
// Ruta: app/admin/_lib/constants/etapas.ts

/**
 * Códigos inmutables para las etapas del pipeline de eventos
 * Estos códigos no deben cambiar para mantener la estabilidad del sistema
 */
export const ETAPA_CODES = {
    // === PIPELINE DE CONVERSIÓN ===
    NUEVO: 'nuevo',                    // Leads recién capturados
    SEGUIMIENTO: 'seguimiento',        // En proceso de seguimiento/nutrición
    PROMESA: 'promesa',               // Cliente prometió respuesta
    APROBADO: 'aprobado',             // Cotización aprobada/contratada

    // === PIPELINE DE PRODUCCIÓN ===
    EDICION: 'edicion',               // En proceso de edición
    REVISION: 'revision',             // En revisión por cliente
    GARANTIA: 'garantia',             // En período de garantía
    ENTREGADO: 'entregado',           // Trabajo finalizado y entregado
} as const;

/**
 * Tipo TypeScript para los códigos de etapa
 */
export type EtapaCodigo = typeof ETAPA_CODES[keyof typeof ETAPA_CODES];

/**
 * Helper para obtener una etapa por código
 */
export function obtenerEtapaPorCodigo(codigo: EtapaCodigo) {
    return {
        where: { codigo }
    };
}

/**
 * Helper para verificar si un código es válido
 */
export function esCodigoEtapaValido(codigo: string): codigo is EtapaCodigo {
    return Object.values(ETAPA_CODES).includes(codigo as EtapaCodigo);
}

/**
 * Mapeo de códigos a nombres por defecto (puede ser personalizado por cliente)
 */
export const ETAPA_NOMBRES_DEFAULT = {
    [ETAPA_CODES.NUEVO]: 'Nuevo',
    [ETAPA_CODES.SEGUIMIENTO]: 'Seguimiento',
    [ETAPA_CODES.PROMESA]: 'Promesa',
    [ETAPA_CODES.APROBADO]: 'Aprobado',
    [ETAPA_CODES.EDICION]: 'En edición',
    [ETAPA_CODES.REVISION]: 'En revisión por cliente',
    [ETAPA_CODES.GARANTIA]: 'En garantía',
    [ETAPA_CODES.ENTREGADO]: 'Entregado',
} as const;
