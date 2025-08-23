// Utilidades para cálculos de métodos de pago en el cliente

export interface MetodoPagoCliente {
    id: string
    metodo_pago: string
    num_msi: number | null
    orden: number | null
    comision_porcentaje_base?: number | null
    comision_fija_monto?: number | null
    comision_msi_porcentaje?: number | null
    payment_method?: string | null
}

// Función para calcular el precio con comisión
export function calcularPrecioConComision(monto: number, metodo: MetodoPagoCliente) {
    let precioFinal = monto

    // Debug: Ver qué comisiones vienen en los datos
    console.log('💳 Cliente - Método de pago:', {
        nombre: metodo.metodo_pago,
        num_msi: metodo.num_msi,
        comision_porcentaje_base: metodo.comision_porcentaje_base,
        comision_fija_monto: metodo.comision_fija_monto,
        comision_msi_porcentaje: metodo.comision_msi_porcentaje,
        payment_method: metodo.payment_method
    })

    // SPEI: No aplicar comisiones (se absorben)
    if (metodo.payment_method === 'spei' || metodo.metodo_pago?.toLowerCase().includes('spei')) {
        return precioFinal // Sin comisiones para SPEI
    }

    // Aplicar comisión porcentual base (ej: 3.6% para tarjeta de crédito)
    if (metodo.comision_porcentaje_base) {
        precioFinal += monto * (metodo.comision_porcentaje_base / 100)
    }

    // Aplicar comisión fija
    if (metodo.comision_fija_monto) {
        precioFinal += metodo.comision_fija_monto
    }

    // Aplicar comisión adicional por MSI (solo si tiene MSI)
    if (metodo.num_msi && metodo.num_msi > 0 && metodo.comision_msi_porcentaje) {
        precioFinal += monto * (metodo.comision_msi_porcentaje / 100)
    }

    return precioFinal
}
