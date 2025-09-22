/**
 * Utilidades para formato de moneda
 */

/**
 * Formatea un número como moneda en pesos mexicanos
 * @param cantidad - Cantidad a formatear
 * @param currency - Moneda a usar (por defecto MXN)
 * @returns String formateado como moneda
 */
export const formatearMoneda = (cantidad: number, currency: string = 'MXN'): string => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(cantidad);
}

/**
 * Formatea un número como moneda sin símbolo
 * @param cantidad - Cantidad a formatear
 * @returns String formateado sin símbolo de moneda
 */
export const formatearCantidad = (cantidad: number): string => {
    return new Intl.NumberFormat('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(cantidad);
}

/**
 * Formatea un número como moneda compacta (K, M, etc.)
 * @param cantidad - Cantidad a formatear
 * @param currency - Moneda a usar (por defecto MXN)
 * @returns String formateado como moneda compacta
 */
export const formatearMonedaCompacta = (cantidad: number, currency: string = 'MXN'): string => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: currency,
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(cantidad);
}
