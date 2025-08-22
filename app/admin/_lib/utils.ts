// =====================================
// UTILIDADES DE FORMATO
// =====================================

export function formatearMoneda(cantidad: number): string {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(cantidad);
}

export function formatearFecha(fecha: Date | string): string {
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;

    return new Intl.DateTimeFormat('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(fechaObj);
}

export function formatearFechaCompleta(fecha: Date | string): string {
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;

    return new Intl.DateTimeFormat('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(fechaObj);
}

export function formatearPorcentaje(valor: number): string {
    return new Intl.NumberFormat('es-MX', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(valor / 100);
}

export function formatearNumero(valor: number): string {
    return new Intl.NumberFormat('es-MX').format(valor);
}
