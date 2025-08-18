/**
 * Utilidades para manejo de fechas evitando problemas de zona horaria
 */

/**
 * Crea una fecha local a partir de un string o Date, evitando problemas de zona horaria
 * @param fecha - Fecha como string (YYYY-MM-DD) o objeto Date
 * @returns Date objeto en zona horaria local
 */
export const crearFechaLocal = (fecha: Date | string): Date => {
    if (typeof fecha === 'string') {
        // Si es un string en formato YYYY-MM-DD sin tiempo, crear fecha local
        if (!fecha.includes('T') && !fecha.includes(' ')) {
            const [year, month, day] = fecha.split('-').map(Number);
            return new Date(year, month - 1, day);
        } else {
            // Si incluye tiempo, extraer solo la fecha y crear fecha local
            const fechaString = fecha.split('T')[0]; // Tomar solo la parte de fecha
            const [year, month, day] = fechaString.split('-').map(Number);
            return new Date(year, month - 1, day);
        }
    } else {
        // Si es un objeto Date, extraer año, mes y día y crear fecha local
        // Esto evita problemas cuando el Date viene con zona horaria UTC
        const year = fecha.getUTCFullYear();
        const month = fecha.getUTCMonth();
        const day = fecha.getUTCDate();
        return new Date(year, month, day);
    }
}

/**
 * Formatea una fecha para mostrar en español
 * @param fecha - Fecha como string o Date
 * @param opciones - Opciones de formato (opcional)
 * @returns String formateado en español
 */
export const formatearFecha = (
    fecha: Date | string,
    opciones: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }
): string => {
    const fechaLocal = crearFechaLocal(fecha);
    return fechaLocal.toLocaleDateString('es-ES', opciones);
}

/**
 * Formatea fecha en formato corto (ej: "vie, 29 ago")
 * @param fecha - Fecha como string o Date
 * @returns String formateado corto
 */
export const formatearFechaCorta = (fecha: Date | string): string => {
    return formatearFecha(fecha, {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    });
}

/**
 * Calcula los días restantes desde hoy hasta una fecha
 * @param fecha - Fecha objetivo
 * @returns Número de días restantes (positivo si es futuro, negativo si es pasado)
 */
export const calcularDiasRestantes = (fecha: Date | string): number => {
    const fechaObjetivo = crearFechaLocal(fecha);
    const hoy = new Date();
    const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const fechaObjetivoSinHora = new Date(fechaObjetivo.getFullYear(), fechaObjetivo.getMonth(), fechaObjetivo.getDate());

    const diferenciaMilisegundos = fechaObjetivoSinHora.getTime() - hoySinHora.getTime();
    return Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
}

/**
 * Obtiene el nombre del mes en español
 * @param fecha - Fecha como string o Date
 * @returns Nombre del mes en español
 */
export const obtenerMes = (fecha: Date | string): string => {
    const fechaLocal = crearFechaLocal(fecha);
    return fechaLocal.toLocaleDateString('es-ES', { month: 'long' });
}

/**
 * Obtiene el año de una fecha
 * @param fecha - Fecha como string o Date
 * @returns Año como número
 */
export const obtenerAnio = (fecha: Date | string): number => {
    const fechaLocal = crearFechaLocal(fecha);
    return fechaLocal.getFullYear();
}

/**
 * Compara dos fechas para ordenamiento
 * @param fechaA - Primera fecha
 * @param fechaB - Segunda fecha
 * @returns Número para sort: negativo si A < B, positivo si A > B, 0 si iguales
 */
export const compararFechas = (fechaA: Date | string, fechaB: Date | string): number => {
    const fechaLocalA = crearFechaLocal(fechaA);
    const fechaLocalB = crearFechaLocal(fechaB);
    return fechaLocalA.getTime() - fechaLocalB.getTime();
}

/**
 * Verifica si una fecha es válida
 * @param fecha - Fecha a validar
 * @returns true si la fecha es válida
 */
export const esFechaValida = (fecha: Date | string): boolean => {
    try {
        const fechaLocal = crearFechaLocal(fecha);
        return !isNaN(fechaLocal.getTime());
    } catch {
        return false;
    }
}
