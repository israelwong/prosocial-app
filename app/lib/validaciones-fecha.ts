/**
 * Utilidades para validar fechas de eventos y tiempo mínimo de contratación
 */

export interface ValidacionFecha {
    esValida: boolean
    diasRestantes: number
    mensaje: string
    diasMinimosRequeridos?: number
    fechaLimiteContratacion?: Date
    mensajeFechaLimite?: string
}

/**
 * Valida si la fecha del evento cumple con los días mínimos de contratación
 */
export function validarFechaEvento(
    fechaEvento: string | Date | null | undefined,
    diasMinimosContratacion: number | null | undefined,
    explicacion?: string | null
): ValidacionFecha {
    // Si no hay fecha del evento o no hay requisito de días mínimos, no aplicar validación
    if (!fechaEvento || !diasMinimosContratacion) {
        return {
            esValida: true,
            diasRestantes: 0,
            mensaje: ''
        }
    }

    const fechaEventoDate = new Date(fechaEvento)
    const fechaActual = new Date()

    // Normalizar las fechas para comparar solo días (sin horas)
    fechaActual.setHours(0, 0, 0, 0)
    fechaEventoDate.setHours(0, 0, 0, 0)

    const diferenciaTiempo = fechaEventoDate.getTime() - fechaActual.getTime()
    const diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24))

    // Calcular la fecha límite para contratar (fecha del evento - días mínimos)
    const fechaLimiteContratacion = new Date(fechaEventoDate)
    fechaLimiteContratacion.setDate(fechaLimiteContratacion.getDate() - diasMinimosContratacion)

    // Calcular días hasta la fecha límite de contratación
    const diasHastaLimiteContratacion = Math.ceil((fechaLimiteContratacion.getTime() - fechaActual.getTime()) / (1000 * 3600 * 24))

    const esValida = diasRestantes >= diasMinimosContratacion

    const mensajeFechaLimite = diasHastaLimiteContratacion > 0
        ? `Tienes hasta el ${formatearFechaLegible(fechaLimiteContratacion)} para contratar y asegurar la cobertura de tu evento.`
        : `La fecha límite para contratar era el ${formatearFechaLegible(fechaLimiteContratacion)}.`

    if (!esValida) {
        const diasFaltantes = diasMinimosContratacion - diasRestantes
        return {
            esValida: false,
            diasRestantes,
            diasMinimosRequeridos: diasMinimosContratacion,
            fechaLimiteContratacion,
            mensajeFechaLimite,
            mensaje: `El evento está programado para dentro de ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}, pero este paquete requiere un mínimo de ${diasMinimosContratacion} días de anticipación. Faltan ${diasFaltantes} día${diasFaltantes !== 1 ? 's' : ''} para cumplir este requerimiento.`
        }
    }

    return {
        esValida: true,
        diasRestantes,
        diasMinimosRequeridos: diasMinimosContratacion,
        fechaLimiteContratacion,
        mensajeFechaLimite,
        mensaje: `El evento está programado para dentro de ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}, cumpliendo con el tiempo mínimo requerido.`
    }
}

/**
 * Obtiene la explicación por defecto para días mínimos de contratación
 */
export function obtenerExplicacionPorDefecto(): string {
    return "Tiempo mínimo requerido para garantizar la disponibilidad y coordinación del evento"
}

/**
 * Formatea los días mínimos para mostrar al usuario
 */
export function formatearDiasMinimos(dias: number): string {
    return `${dias} día${dias !== 1 ? 's' : ''} naturales mínimo`
}

/**
 * Calcula los días restantes hasta una fecha
 */
export function calcularDiasRestantes(fechaEvento: string | Date): number {
    const fechaEventoDate = new Date(fechaEvento)
    const fechaActual = new Date()

    // Normalizar las fechas para comparar solo días
    fechaActual.setHours(0, 0, 0, 0)
    fechaEventoDate.setHours(0, 0, 0, 0)

    const diferenciaTiempo = fechaEventoDate.getTime() - fechaActual.getTime()
    return Math.ceil(diferenciaTiempo / (1000 * 3600 * 24))
}

/**
 * Formatea una fecha para mostrarla de manera legible al usuario
 */
export function formatearFechaLegible(fecha: Date): string {
    return fecha.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

/**
 * Calcula la fecha límite para contratar un paquete
 */
export function calcularFechaLimiteContratacion(
    fechaEvento: string | Date,
    diasMinimosContratacion: number
): Date {
    const fechaEventoDate = new Date(fechaEvento)
    fechaEventoDate.setHours(0, 0, 0, 0)

    const fechaLimite = new Date(fechaEventoDate)
    fechaLimite.setDate(fechaLimite.getDate() - diasMinimosContratacion)

    return fechaLimite
}