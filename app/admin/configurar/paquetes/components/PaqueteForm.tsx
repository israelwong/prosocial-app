// Ruta: app/admin/configurar/paquetes/components/PaqueteForm.tsx

'use client';

import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PaqueteSchema, type PaqueteForm } from '@/app/admin/_lib/actions/paquetes/paquetes.schemas';
import { actualizarPaquete, eliminarPaquete, obtenerPaquetesAgrupados } from '@/app/admin/_lib/actions/paquetes/paquetes.actions';
import { type Paquete, type EventoTipo, type Servicio, type ServicioCategoria, type Configuracion, type CondicionesComerciales, type MetodoPago } from '@prisma/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2, PlusCircle, MinusCircle } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { obtenerCondicionesComerciales } from '@/app/admin/_lib/actions/condicionesComerciales/condicionesComerciales.actions';
import { obtenerMetodosPago } from '@/app/admin/_lib/actions/metodoPago/metodoPago.actions';
import { obtenerConfiguracionActiva } from '@/app/admin/_lib/actions/configuracion/configuracion.actions';
import { calcularPaquete, calcularServicioDesdeBase, type ServicioCantidad } from '@/app/admin/_lib/actions/pricing/calculos';
import { formatearMoneda } from '@/app/admin/_lib/utils/moneda';

// Estructuras de datos existentes
type CategoriaConServicios = ServicioCategoria & { Servicio: Servicio[] };
// Nueva estructura jerárquica (catálogo completo)
interface CatalogoSeccion {
    id: string;
    nombre: string;
    posicion: number | null;
    seccionCategorias: {
        ServicioCategoria: (ServicioCategoria & { Servicio: Servicio[] })
    }[];
}

type CondicionExtendida = CondicionesComerciales & { CondicionesComercialesMetodoPago?: { metodoPagoId: string }[] };

interface Props {
    paquete: (Paquete & { PaqueteServicio: { servicioId: string, cantidad: number }[] });
    tiposEvento: EventoTipo[];
    tipoEventoNombre?: string; // Nombre del tipo de evento para mostrar en cabecera
    serviciosDisponibles?: CategoriaConServicios[]; // legacy (categoría plana)
    catalogo?: CatalogoSeccion[]; // nuevo (sección -> categoría -> servicios)
    configuracion: Configuracion | null;
    condiciones?: CondicionExtendida[]; // condiciones con posible relación a métodos
    metodosPago?: MetodoPago[]; // métodos de pago activos
}

export default function PaqueteForm({ paquete, tiposEvento, tipoEventoNombre, serviciosDisponibles, catalogo, configuracion, condiciones = [], metodosPago = [] }: Props) {
    const router = useRouter();
    const isEditMode = !!paquete;
    const basePath = '/admin/configurar/paquetes';
    const [nombreError, setNombreError] = useState<string>('');

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<PaqueteForm>({
        resolver: zodResolver(PaqueteSchema),
        defaultValues: {
            id: paquete.id,
            nombre: paquete.nombre,
            eventoTipoId: paquete.eventoTipoId,
            precio: String(paquete.precio),
            status: paquete.status as 'active' | 'inactive',
            servicios: paquete.PaqueteServicio.map(s => ({ ...s, cantidad: String(s.cantidad) })) ?? [],
        },
    });

    // Watch del nombre para validación en tiempo real
    const nombreActual = watch('nombre');

    // Validación de nombre único en tiempo real
    useEffect(() => {
        const validarNombreUnico = async () => {
            if (!nombreActual || nombreActual.length < 3) {
                setNombreError('');
                return;
            }

            try {
                const grupos = await obtenerPaquetesAgrupados();
                const tipoEvento = grupos.find(g => g.id === paquete.eventoTipoId);
                const paquetesDelMismoTipo = tipoEvento?.Paquete || [];

                // Verificar si existe otro paquete con el mismo nombre (excluyendo el actual)
                const nombreDuplicado = paquetesDelMismoTipo.some(p =>
                    p.nombre.toLowerCase() === nombreActual.toLowerCase() && p.id !== paquete.id
                );

                if (nombreDuplicado) {
                    setNombreError(`Ya existe un paquete con el nombre "${nombreActual}" en ${tipoEventoNombre}`);
                } else {
                    setNombreError('');
                }
            } catch (error) {
                console.error('Error validando nombre único:', error);
            }
        };

        // Debounce la validación
        const timeoutId = setTimeout(validarNombreUnico, 500);
        return () => clearTimeout(timeoutId);
    }, [nombreActual, paquete.eventoTipoId, paquete.id, tipoEventoNombre]);

    // Helper para calcular precio correcto de un servicio
    const calcularPrecioCorrectoServicio = (servicio: Servicio): number => {
        if (!configuracion) return servicio.precio_publico;

        const resultado = calcularServicioDesdeBase({
            costo: servicio.costo,
            gastos: servicio.gasto || 0,
            tipo_utilidad: (servicio.tipo_utilidad === 'producto' ? 'producto' : 'servicio'),
            configuracion
        });

        return resultado.precioSistema;
    };

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "servicios",
    });

    const watchedServicios = useWatch({ control, name: 'servicios' });
    const watchedPrecioVenta = useWatch({ control, name: 'precio' });

    // Estado local para selección de condición y método (no persistidos aún)
    const [condicionId, setCondicionId] = useState<string>('');
    const [metodoPagoId, setMetodoPagoId] = useState<string>('');
    // Normalizamos a secciones
    const secciones = useMemo(() => {
        if (catalogo && catalogo.length > 0) return catalogo;
        // Fallback: construir una seccion "General" con las categorias existentes
        if (serviciosDisponibles) {
            return [{
                id: 'general',
                nombre: 'General',
                posicion: 0,
                seccionCategorias: serviciosDisponibles.map(cat => ({ ServicioCategoria: cat }))
            }] as CatalogoSeccion[];
        }
        return [] as CatalogoSeccion[];
    }, [catalogo, serviciosDisponibles]);

    const allServiciosFlat = useMemo(() => secciones.flatMap(sec => sec.seccionCategorias.flatMap(sc => sc.ServicioCategoria.Servicio)), [secciones]);

    const serviciosEnPaquete = useMemo(() => {
        return watchedServicios?.map(s => {
            const servicioDetails = allServiciosFlat.find(db => db.id === s.servicioId);
            return { ...s, ...servicioDetails };
        }) || [];
    }, [watchedServicios, allServiciosFlat]);

    // Agrupamos seleccionados por Sección -> Categoría
    const wishlistAgrupada = useMemo(() => {
        return secciones.map(sec => {
            const categoriasConSeleccionados = sec.seccionCategorias.map(sc => {
                const categoria = sc.ServicioCategoria;
                const serviciosCat = serviciosEnPaquete
                    .filter(s => s.servicioCategoriaId === categoria.id)
                    .sort((a, b) => (a.posicion ?? 0) - (b.posicion ?? 0));
                return { categoria, servicios: serviciosCat };
            }).filter(entry => entry.servicios.length > 0);
            return { seccion: sec, categorias: categoriasConSeleccionados };
        }).filter(sec => sec.categorias.length > 0);
    }, [secciones, serviciosEnPaquete]);

    const {
        totalCosto,
        totalGasto,
        totalUtilidad,
        precioSistema,
        comisionVentaCalculada,
        sobreprecioCalculado,
        gananciaNeta,
        desviacionVsSistema,
        margenNetoPorcentaje,
        extraSobreBase,
        precioVentaFinal,
        descuentoAplicado,
        comisionesMetodoPago,
        gananciaNetaSistema,
        margenNetoSistema
    } = useMemo(() => {
        const precioVentaNum = parseFloat(watchedPrecioVenta || '0');
        // Adaptamos servicios al tipo ServicioCantidad requerido por la librería
        const serviciosCantidad: ServicioCantidad[] = (serviciosEnPaquete || []).map(s => {
            // Aseguramos que s tiene todas las propiedades requeridas de Servicio
            const servicio: Servicio | undefined = allServiciosFlat.find(db => db.id === s.servicioId);
            return {
                costo: Number(s.costo) || 0,
                gasto: Number(s.gasto) || 0,
                utilidad: Number(s.utilidad) || 0,
                precio_publico: servicio ? calcularPrecioCorrectoServicio(servicio) : 0, // Solo si es un Servicio válido
                cantidad: parseInt(s.cantidad || '1', 10),
                tipo_utilidad: (servicio?.tipo_utilidad ?? (s as any).tipo_utilidad) || 'servicio'
            };
        });

        const condicion = condiciones.find(c => c.id === condicionId) || null;
        // Filtrar métodos permitidos por la condición seleccionada
        const metodoIdsPermitidos = condicion?.CondicionesComercialesMetodoPago?.map(r => r.metodoPagoId) || null;
        const metodo = metodosPago.find(m => m.id === metodoPagoId && (!metodoIdsPermitidos || metodoIdsPermitidos.includes(m.id))) || null;

        // Aplicar descuento real si hay condición
        const descuentoFraccion = condicion?.descuento ? (condicion.descuento / 100) : 0;
        const res = calcularPaquete({
            servicios: serviciosCantidad,
            configuracion,
            precioVenta: precioVentaNum,
            descuentoPorcentaje: descuentoFraccion,
            metodoPago: metodo,
            condicion,
            usarSumaPreciosServicio: true
        });

        const totalUtilidad = res.totales.totalUtilidadBase; // utilidad base agregada
        const extraSobreBase = res.gananciaNeta - totalUtilidad; // muestra cuánto se gana arriba de la utilidad base

        return {
            totalCosto: res.totales.totalCosto,
            totalGasto: res.totales.totalGasto,
            totalUtilidad,
            precioSistema: res.precioSistemaPaquete,
            comisionVentaCalculada: res.comisionVenta,
            sobreprecioCalculado: res.sobreprecio,
            gananciaNeta: res.gananciaNeta,
            desviacionVsSistema: res.desviacionVsSistema,
            margenNetoPorcentaje: res.margenNetoPorcentaje,
            extraSobreBase,
            precioVentaFinal: res.precioVentaFinal,
            descuentoAplicado: res.descuentoAplicado,
            comisionesMetodoPago: res.comisionesMetodoPago,
            // Cálculo base hipotético vendiendo exactamente al precio sistema sin descuentos ni método de pago
            gananciaNetaSistema: (() => {
                const comisionPct = configuracion?.comision_venta ?? 0;
                const sobreprecioPct = configuracion?.sobreprecio ?? 0;
                const comisionSistema = res.precioSistemaPaquete * comisionPct;
                const sobreprecioSistema = res.precioSistemaPaquete * sobreprecioPct;
                return res.precioSistemaPaquete - res.totales.totalCosto - res.totales.totalGasto - comisionSistema - sobreprecioSistema;
            })(),
            margenNetoSistema: (() => {
                const comisionPct = configuracion?.comision_venta ?? 0;
                const sobreprecioPct = configuracion?.sobreprecio ?? 0;
                const comisionSistema = res.precioSistemaPaquete * comisionPct;
                const sobreprecioSistema = res.precioSistemaPaquete * sobreprecioPct;
                const gananciaSistema = res.precioSistemaPaquete - res.totales.totalCosto - res.totales.totalGasto - comisionSistema - sobreprecioSistema;
                return res.precioSistemaPaquete > 0 ? (gananciaSistema / res.precioSistemaPaquete) * 100 : 0;
            })()
        };
    }, [serviciosEnPaquete, configuracion, watchedPrecioVenta, condicionId, metodoPagoId, condiciones, metodosPago]);

    // Recalcular métodos filtrados según condición
    const metodosFiltrados = useMemo(() => {
        const condicion = condiciones.find(c => c.id === condicionId);
        if (!condicion || !condicion.CondicionesComercialesMetodoPago?.length) return metodosPago;
        const permitidos = new Set(condicion.CondicionesComercialesMetodoPago.map(r => r.metodoPagoId));
        // Reset selección si ya no es válida
        if (metodoPagoId && !permitidos.has(metodoPagoId)) setMetodoPagoId('');
        return metodosPago.filter(m => permitidos.has(m.id));
    }, [condicionId, condiciones, metodosPago, metodoPagoId]);

    // Análisis de distribución del presupuesto
    const analisisPresupuesto = useMemo(() => {
        if (!serviciosEnPaquete.length) return { serviciosPorCosto: [], distribucion: [], totalPresupuesto: 0 };

        const serviciosConCostoTotal = serviciosEnPaquete.map(s => {
            const cantidad = parseInt(s.cantidad || '1', 10);
            const costoTotal = (Number(s.costo) || 0) * cantidad;
            const gastoTotal = (Number(s.gasto) || 0) * cantidad;
            const utilidadTotal = (Number(s.utilidad) || 0) * cantidad;
            // Buscar el Servicio completo para pasar a la función
            const servicioDb = allServiciosFlat.find(db => db.id === s.servicioId);
            const precioTotal = servicioDb ? calcularPrecioCorrectoServicio(servicioDb) * cantidad : 0;

            return {
                ...s,
                cantidad,
                costoTotal,
                gastoTotal,
                utilidadTotal,
                precioTotal,
                costoTotalCompleto: costoTotal + gastoTotal + utilidadTotal
            };
        }).sort((a, b) => b.costoTotalCompleto - a.costoTotalCompleto);

        const totalPresupuesto = serviciosConCostoTotal.reduce((sum, s) => sum + s.costoTotalCompleto, 0);

        const distribucion = serviciosConCostoTotal.map(s => ({
            ...s,
            porcentaje: totalPresupuesto > 0 ? (s.costoTotalCompleto / totalPresupuesto) * 100 : 0
        }));

        return {
            serviciosPorCosto: serviciosConCostoTotal.slice(0, 5), // Top 5 más costosos
            distribucion,
            totalPresupuesto
        };
    }, [serviciosEnPaquete]);

    const onSubmit = async (data: PaqueteForm) => {
        // Validar nombre único antes de enviar
        if (nombreError) {
            toast.error("Por favor corrige los errores antes de continuar.");
            return;
        }

        toast.loading("Actualizando paquete...");
        await actualizarPaquete(data);
        toast.dismiss();
        toast.success("Paquete actualizado.");
        router.refresh();
    };

    const handleAddServicio = (servicio: Servicio) => {
        const existingIndex = fields.findIndex(f => f.servicioId === servicio.id);
        if (existingIndex > -1) {
            const currentQty = parseInt(fields[existingIndex].cantidad, 10);
            update(existingIndex, { ...fields[existingIndex], cantidad: String(currentQty + 1) });
        } else {
            append({ servicioId: servicio.id, cantidad: '1' });
        }
        toast.success(`${servicio.nombre} agregado.`);
    };

    const handleUpdateQty = (servicioId: string, newQty: number) => {
        const fieldIndex = fields.findIndex(f => f.servicioId === servicioId);
        if (fieldIndex === -1) return;

        if (newQty < 1) {
            remove(fieldIndex);
        } else {
            update(fieldIndex, { ...fields[fieldIndex], cantidad: String(newQty) });
        }
    }

    const handleDelete = async () => {
        if (confirm('¿Seguro que quieres eliminar este paquete?')) {
            await eliminarPaquete(paquete.id);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-full mx-auto">
            <div className='flex items-center gap-4 mb-6 pb-4 border-b border-zinc-700'>
                <div className="flex-1">
                    {tipoEventoNombre && (
                        <div className="text-sm text-zinc-500 mb-2">
                            Paquete para: <span className="text-yellow-400 font-medium">{tipoEventoNombre}</span>
                        </div>
                    )}
                    <input {...register('nombre')} className="w-full text-2xl font-semibold text-zinc-100 bg-transparent border-none focus:ring-0 p-0" />
                    {errors.nombre && <p className="text-red-400 text-sm mt-1">{errors.nombre.message}</p>}
                    {nombreError && <p className="text-red-400 text-sm mt-1">{nombreError}</p>}
                </div>
                <div className="flex items-center gap-3">
                    <button type="button" onClick={() => router.push(basePath)}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 bg-zinc-700 text-zinc-100 hover:bg-zinc-600">
                        Cancelar
                    </button>
                    <button type="submit" disabled={isSubmitting || !!nombreError}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                        {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
                        Actualizar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* --- Columna 1: Detalles --- */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-3 rounded-lg border border-zinc-600/70 bg-zinc-800/40 space-y-2 text-[11px] text-zinc-400">
                        <h4 className="text-sm font-semibold text-zinc-100 mb-2">Precio Sistema</h4>
                        <div className="flex justify-between text-sm border border-yellow-500/60 bg-yellow-900/20 rounded-md px-2 py-1.5">
                            <span className="text-zinc-300">Precio Sistema</span>
                            <span className="font-semibold text-yellow-300">{precioSistema.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                        </div>
                    </div>

                    {/* Precio de Venta editable */}
                    <div>
                        <label htmlFor="precio" className="block text-sm font-medium text-zinc-300 mb-1.5">Precio de Venta</label>
                        <input id="precio" type="text" {...register('precio')} className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm" />
                        {errors.precio && <p className="text-red-400 text-xs mt-1.5">{errors.precio.message}</p>}
                    </div>

                    {/* Impacto Comercial */}
                    <div className="p-3 rounded-lg border border-blue-700/50 bg-blue-950/20 space-y-2 text-xs text-blue-200/80">
                        <h4 className="text-sm font-medium text-blue-200 mb-2 flex items-center justify-between">
                            <span>Impacto Comercial</span>
                            <span className="text-[10px] uppercase tracking-wider text-blue-300/60">Actual</span>
                        </h4>
                        <div className="flex justify-between"><span>Precio final:</span><span className="font-medium">{precioVentaFinal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span></div>
                        <div className="flex justify-between"><span>Comisión de venta:</span><span>{comisionVentaCalculada.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span></div>
                        <div className="flex justify-between"><span>Descuento aplicado:</span><span>{descuentoAplicado.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span></div>
                        <div className="flex justify-between"><span>Margen Neto real:</span><span className={margenNetoPorcentaje < 0 ? 'text-red-300 font-medium' : 'font-medium text-blue-100'}>{margenNetoPorcentaje.toFixed(1)}%</span></div>
                        <div className="flex justify-between"><span>Utilidad Neta real:</span><span className={gananciaNeta < totalUtilidad ? 'text-yellow-300 font-medium' : 'font-medium text-blue-100'}>{gananciaNeta.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span></div>
                        {comisionesMetodoPago > 0 && (
                            <div className="flex justify-between"><span>Comisiones método pago:</span><span>{comisionesMetodoPago.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span></div>
                        )}
                    </div>
                </div>

                {/* --- Columna 2: Wishlist --- */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-medium text-zinc-300">Servicios en el Paquete</h2>
                    <div className="max-h-[70vh] overflow-y-auto">
                        {fields.length === 0 ? <p className="text-zinc-500 text-sm py-10 text-center border border-dashed border-zinc-700 rounded-lg">Agrega servicios desde la lista de la derecha.</p> : (
                            <div className="space-y-5">
                                {wishlistAgrupada.map(sec => (
                                    <div key={sec.seccion.id} className="border border-zinc-700/60 rounded-lg p-4 bg-zinc-900/40 space-y-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-base font-semibold text-zinc-300 tracking-tight">{sec.seccion.nombre}</h3>
                                            <span className="text-[10px] uppercase tracking-wider text-zinc-500">{sec.categorias.reduce((acc, c) => acc + c.servicios.length, 0)} ítems</span>
                                        </div>
                                        <div className="space-y-4">
                                            {sec.categorias.map(catEntry => (
                                                <div key={catEntry.categoria.id} className="border border-zinc-700/40 rounded-md p-3 bg-zinc-800/40 space-y-2">
                                                    <h4 className="text-sm font-medium text-zinc-400 flex items-center justify-between">
                                                        <span>{catEntry.categoria.nombre}</span>
                                                        <span className="text-[10px] font-normal text-zinc-500">{catEntry.servicios.length}</span>
                                                    </h4>
                                                    <ul className="space-y-1.5">
                                                        {catEntry.servicios.map(servicio => {
                                                            const fieldIndex = fields.findIndex(f => f.servicioId === servicio.id);
                                                            if (fieldIndex === -1) return null;
                                                            return (
                                                                <li key={servicio.id} className="p-2 rounded-md bg-zinc-800/80 hover:bg-zinc-700/70 transition flex justify-between items-center text-sm group">
                                                                    <span className="text-zinc-300 flex-grow truncate pr-2">{servicio.nombre}</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <button type="button" aria-label="Disminuir" onClick={() => handleUpdateQty(servicio.servicioId, parseInt(servicio.cantidad, 10) - 1)} className="opacity-70 hover:opacity-100"><MinusCircle size={16} className="text-zinc-400" /></button>
                                                                        <input value={servicio.cantidad} onChange={e => handleUpdateQty(servicio.servicioId, parseInt(e.target.value || '1', 10) || 1)} className="w-10 text-center bg-zinc-900 rounded-md h-7 border border-zinc-700/60 focus:outline-none focus:ring-1 focus:ring-blue-600" />
                                                                        <button type="button" aria-label="Incrementar" onClick={() => handleUpdateQty(servicio.servicioId, parseInt(servicio.cantidad ?? '1', 10) + 1)} className="opacity-70 hover:opacity-100"><PlusCircle size={16} className="text-zinc-400" /></button>
                                                                    </div>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Columna 3: Servicios Disponibles --- */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-medium text-zinc-300 sticky top-0">Servicios Disponibles</h2>
                    <div className="max-h-[70vh] overflow-y-auto space-y-4">
                        {secciones.map(sec => (
                            <div key={sec.id} className="border border-zinc-700/60 rounded-lg p-4 bg-zinc-900/30 space-y-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold text-zinc-300 tracking-tight">{sec.nombre}</h3>
                                    <span className="text-[10px] uppercase tracking-wider text-zinc-500">
                                        {sec.seccionCategorias.reduce((acc, sc) => acc + sc.ServicioCategoria.Servicio.length, 0)} ítems
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    {sec.seccionCategorias.map(sc => (
                                        <div key={sc.ServicioCategoria.id} className="space-y-2 border border-zinc-700/40 rounded-md p-3 bg-zinc-800/40">
                                            <h4 className="text-sm font-medium text-zinc-400 flex items-center justify-between">
                                                <span>{sc.ServicioCategoria.nombre}</span>
                                                <span className="text-[10px] font-normal text-zinc-500">{sc.ServicioCategoria.Servicio.length}</span>
                                            </h4>
                                            <ul className="space-y-1.5">
                                                {sc.ServicioCategoria.Servicio.map(servicio => (
                                                    <li key={servicio.id} onClick={() => handleAddServicio(servicio)}
                                                        className="p-2.5 rounded-md border border-zinc-800 bg-zinc-900/80 flex justify-between items-center cursor-pointer hover:border-blue-500 hover:bg-zinc-800/80 transition group">
                                                        <span className="text-sm text-zinc-200 truncate pr-2 group-hover:text-white">{servicio.nombre}</span>
                                                        <span className="text-xs text-zinc-400 group-hover:text-zinc-300">{calcularPrecioCorrectoServicio(servicio).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-zinc-700">
                <div>
                    {isEditMode && (
                        <button type="button" onClick={handleDelete} className="flex items-center text-sm text-red-500 hover:text-red-400">
                            <Trash2 size={16} className="mr-2" />
                            Eliminar Paquete
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <button type="button" onClick={() => router.push(basePath)} className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-zinc-700 text-zinc-100 hover:bg-zinc-600">Cancelar</button>
                    <button type="submit" disabled={isSubmitting || !!nombreError}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                        {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
                        Actualizar Paquete
                    </button>
                </div>
            </div>
        </form>
    );
}
