// Ruta: app/admin/_lib/pricing/calculos.ts
// Utilidades reutilizables para cálculos de precios de Servicios, Paquetes y Cotizaciones.
// NOTA: Configuracion guarda porcentajes como fracciones (0.125 = 12.5%).
// MetodoPago guarda porcentajes como números con sentido porcentual (3.6 = 3.6%), por eso se divide entre 100.

import { type Configuracion, type MetodoPago, type CondicionesComerciales } from '@prisma/client';

// ---------------- Tipos ----------------
export interface ServicioBaseDatos {
    costo: number; // costo directo
    gasto?: number; // gasto agregado (ya sumado) o se puede sumar externamente
    utilidad?: number; // utilidad ya persistida (si existe)
    precio_publico?: number; // precio ya calculado del servicio individual (precioSistema)
    tipo_utilidad?: 'servicio' | 'producto';
}

export interface ServicioCantidad extends ServicioBaseDatos {
    cantidad: number; // unidades dentro de un paquete / cotización
}

export interface TotalesServicios {
    totalCosto: number;
    totalGasto: number;
    totalUtilidadBase: number; // utilidad base antes de sobreprecio/comisión
    totalPrecioSistema?: number; // suma de precio_publico * cantidad (si disponible)
    detalle?: any;
}

export interface CalculoServicioResultado {
    utilidadBase: number;
    subtotal: number; // costo + gastos + utilidadBase
    sobreprecioMonto: number;
    montoTrasSobreprecio: number;
    comisionMonto: number;
    precioSistema: number; // precio objetivo (público)
}

export interface ParametrosMetodoPagoAplicado {
    porcentajeExtra: number; // fracción adicional de comisión (ej: 0.036)
    porcentajeExtraMSI: number; // fracción adicional por MSI si aplica
    montoFijo: number; // fee fijo
}

export interface CalculoPaqueteParams {
    servicios: ServicioCantidad[];
    configuracion: Configuracion | null;
    precioVenta: number; // precio de venta elegido
    descuentoPorcentaje?: number; // fracción 0..1 aplicada al precioVenta (condición comercial)
    metodoPago?: MetodoPago | null;
    condicion?: CondicionesComerciales | null;
    usarSumaPreciosServicio?: boolean; // si true usa totalPrecioSistema como "precioSistema" paquete, si false recalcula a partir de bases
}

export interface CalculoPaqueteResultado {
    totales: TotalesServicios;
    precioSistemaPaquete: number; // sugerido
    precioVentaFinal: number; // después de descuento
    descuentoAplicado: number; // monto
    comisionVenta: number;
    sobreprecio: number;
    comisionesMetodoPago: number; // extra (porcentaje + fijo + msi)
    gananciaNeta: number;
    margenNetoPorcentaje: number; // sobre precioVentaFinal
    desviacionVsSistema: number; // precioVentaFinal - precioSistemaPaquete
    breakdown: Record<string, number>;
}

// ---------------- Funciones ----------------

export function calcularServicioDesdeBase(opts: {
    costo: number;
    gastos: number;
    tipo_utilidad: 'servicio' | 'producto';
    configuracion: Configuracion | null;
}): CalculoServicioResultado {
    const { costo, gastos, tipo_utilidad, configuracion } = opts;
    const utilidadPct = tipo_utilidad === 'servicio' ? (configuracion?.utilidad_servicio ?? 0) : (configuracion?.utilidad_producto ?? 0);
    const comisionPct = configuracion?.comision_venta ?? 0; // ya fracción
    const sobreprecioPct = configuracion?.sobreprecio ?? 0; // ya fracción

    const utilidadBase = costo * utilidadPct;
    const subtotal = costo + gastos + utilidadBase;
    const sobreprecioMonto = subtotal * sobreprecioPct;
    const montoTrasSobreprecio = subtotal + sobreprecioMonto;
    const denominador = 1 - comisionPct;
    const precioSistema = denominador > 0 ? (montoTrasSobreprecio / denominador) : Infinity;
    const comisionMonto = precioSistema * comisionPct;

    return { utilidadBase, subtotal, sobreprecioMonto, montoTrasSobreprecio, comisionMonto, precioSistema };
}

export function agregarCantidad(servicios: ServicioCantidad[]): TotalesServicios {
    return servicios.reduce<TotalesServicios>((acc, s) => {
        const cantidad = s.cantidad || 1;
        acc.totalCosto += (s.costo || 0) * cantidad;
        acc.totalGasto += (s.gasto || 0) * cantidad;
        acc.totalUtilidadBase += (s.utilidad || 0) * cantidad;
        if (s.precio_publico) {
            acc.totalPrecioSistema = (acc.totalPrecioSistema || 0) + s.precio_publico * cantidad;
        }
        return acc;
    }, { totalCosto: 0, totalGasto: 0, totalUtilidadBase: 0, totalPrecioSistema: 0 });
}

export function extraerParametrosMetodoPago(metodo?: MetodoPago | null): ParametrosMetodoPagoAplicado {
    if (!metodo) return { porcentajeExtra: 0, porcentajeExtraMSI: 0, montoFijo: 0 };
    const porcentajeExtra = (metodo.comision_porcentaje_base ?? 0) / 100; // convertir a fracción
    const porcentajeExtraMSI = (metodo.comision_msi_porcentaje ?? 0) / 100; // fracción
    const montoFijo = metodo.comision_fija_monto ?? 0;
    return { porcentajeExtra, porcentajeExtraMSI, montoFijo };
}

export function calcularPaquete(params: CalculoPaqueteParams): CalculoPaqueteResultado {
    const { servicios, configuracion, precioVenta, descuentoPorcentaje = 0, metodoPago, condicion, usarSumaPreciosServicio = true } = params;
    const totales = agregarCantidad(servicios);

    // Precio sistema sugerido: si usamos precios individuales sumados (más rápido) o podríamos recalcular desde bases.
    let precioSistemaPaquete = usarSumaPreciosServicio && totales.totalPrecioSistema
        ? totales.totalPrecioSistema
        : (totales.totalCosto + totales.totalGasto + totales.totalUtilidadBase); // fallback simple (SIN volver a aplicar sobreprecio/ comisión a nivel paquete)

    const comisionPct = configuracion?.comision_venta ?? 0; // fracción
    const sobreprecioPct = configuracion?.sobreprecio ?? 0; // fracción

    // Aplicamos sobreprecio y comisión al precioSistemaPaquete para alinearlo al modelo de servicio.
    // Si precioSistemaPaquete proviene de suma de servicios ya incluye esos efectos; marcamos flag para evitar doble aplicación.
    const derivadoDeServicios = usarSumaPreciosServicio;
    if (!derivadoDeServicios) {
        // replicar lógica de servicio para generar precio sugerido
        const subtotal = totales.totalCosto + totales.totalGasto + totales.totalUtilidadBase;
        const sobreprecioMontoTmp = subtotal * sobreprecioPct;
        const montoTrasSobreprecio = subtotal + sobreprecioMontoTmp;
        const denominador = 1 - comisionPct;
        precioSistemaPaquete = denominador > 0 ? (montoTrasSobreprecio / denominador) : Infinity;
    }

    // Descuento por condición comercial se aplica sobre el precioVenta definido (no sobre sistema) por ahora.
    const descuentoAplicado = precioVenta * descuentoPorcentaje;
    const precioVentaFinal = precioVenta - descuentoAplicado;

    // NOTA IMPORTANTE: El precioVentaFinal es lo que recibe la empresa del cliente.
    // La comisión y sobreprecio YA ESTÁN INCLUIDOS en este precio, no son adicionales.
    // Por eso calculamos cuánto corresponde a cada concepto del precio total.

    // Extraer comisiones del precio (no sumarlas)
    const comisionVenta = precioVentaFinal * comisionPct;
    const sobreprecio = precioVentaFinal * sobreprecioPct;

    // Extra método de pago (esto sí es adicional al precio)
    const { porcentajeExtra, porcentajeExtraMSI, montoFijo } = extraerParametrosMetodoPago(metodoPago);
    const porcentajeMetodoTotal = porcentajeExtra + porcentajeExtraMSI;
    const comisionesMetodoPago = precioVentaFinal * porcentajeMetodoTotal + montoFijo;

    // Ganancia neta = lo que queda después de costos, gastos y comisiones incluidas en el precio
    // NO restamos comisionVenta ni sobreprecio porque ya están incluidos en el precioVentaFinal
    const gananciaNeta = precioVentaFinal - totales.totalCosto - totales.totalGasto - comisionesMetodoPago;
    const margenNetoPorcentaje = precioVentaFinal > 0 ? (gananciaNeta / precioVentaFinal) * 100 : 0;
    const desviacionVsSistema = precioVentaFinal - precioSistemaPaquete;

    return {
        totales,
        precioSistemaPaquete,
        precioVentaFinal,
        descuentoAplicado,
        comisionVenta,
        sobreprecio,
        comisionesMetodoPago,
        gananciaNeta,
        margenNetoPorcentaje,
        desviacionVsSistema,
        breakdown: {
            totalCosto: totales.totalCosto,
            totalGasto: totales.totalGasto,
            totalUtilidadBase: totales.totalUtilidadBase,
            comisionVenta,
            sobreprecio,
            comisionesMetodoPago,
            descuentoAplicado
        }
    };
}

// Helper para aplicar una condición comercial a un precio de lista
export function aplicarCondicionComercial(precioLista: number, condicion?: CondicionesComerciales | null): { precioConDescuento: number; descuentoMonto: number; descuentoFraccion: number } {
    if (!condicion || !condicion.descuento) return { precioConDescuento: precioLista, descuentoMonto: 0, descuentoFraccion: 0 };
    const fraccion = condicion.descuento / 100; // descuento se almacena como número porcentaje (10 = 10%)
    const descuentoMonto = precioLista * fraccion;
    return { precioConDescuento: precioLista - descuentoMonto, descuentoMonto, descuentoFraccion: fraccion };
}

import { formatearMoneda as formatearMonedaUtil } from '../../utils/moneda';

export function formatearMoneda(valor: number, currency: string = 'MXN') {
    return formatearMonedaUtil(valor, currency);
}
