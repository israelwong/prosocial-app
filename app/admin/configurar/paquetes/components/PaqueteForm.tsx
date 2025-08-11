// Ruta: app/admin/configurar/paquetes/components/PaqueteForm.tsx

'use client';

import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PaqueteSchema, type PaqueteForm } from '@/app/admin/_lib/actions/paquetes/paquetes.schemas';
import { actualizarPaquete, eliminarPaquete } from '@/app/admin/_lib/actions/paquetes/paquetes.actions';
import { type Paquete, type EventoTipo, type Servicio, type ServicioCategoria, type Configuracion } from '@prisma/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2, PlusCircle, MinusCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

type CategoriaConServicios = ServicioCategoria & { Servicio: Servicio[] };

interface Props {
    paquete: (Paquete & { PaqueteServicio: { servicioId: string, cantidad: number }[] });
    tiposEvento: EventoTipo[];
    serviciosDisponibles: CategoriaConServicios[];
    configuracion: Configuracion | null;
}

export default function PaqueteForm({ paquete, tiposEvento, serviciosDisponibles, configuracion }: Props) {
    const router = useRouter();
    const isEditMode = !!paquete;
    const basePath = '/admin/configurar/paquetes';

    const {
        register,
        handleSubmit,
        control,
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

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "servicios",
    });

    const watchedServicios = useWatch({ control, name: 'servicios' });
    const watchedPrecioVenta = useWatch({ control, name: 'precio' });
    const allServiciosFlat = useMemo(() => serviciosDisponibles.flatMap(c => c.Servicio), [serviciosDisponibles]);

    const serviciosEnPaquete = useMemo(() => {
        return watchedServicios?.map(s => {
            const servicioDetails = allServiciosFlat.find(db => db.id === s.servicioId);
            return { ...s, ...servicioDetails };
        }) || [];
    }, [watchedServicios, allServiciosFlat]);

    const wishlistAgrupada = useMemo(() => {
        return serviciosDisponibles.map(categoria => ({
            ...categoria,
            servicios: serviciosEnPaquete
                .filter(s => s.servicioCategoriaId === categoria.id)
                .sort((a, b) => (a.posicion ?? 0) - (b.posicion ?? 0))
        })).filter(grupo => grupo.servicios.length > 0);
    }, [serviciosEnPaquete, serviciosDisponibles]);

    const {
        totalCosto,
        totalGasto,
        totalUtilidad,
        precioSistema,
        comisionVentaCalculada,
        sobreprecioCalculado,
        gananciaNeta
    } = useMemo(() => {

        const comisionPorcentaje = (configuracion?.comision_venta ?? 0) / 100;
        const sobreprecioPorcentaje = (configuracion?.sobreprecio ?? 0) / 100;
        const precioVentaNum = parseFloat(watchedPrecioVenta || '0');

        const totals = serviciosEnPaquete.reduce((acc, servicio) => {
            const cantidad = parseInt(servicio.cantidad || '1', 10);
            acc.costo += (Number(servicio.costo) || 0) * cantidad;
            acc.gasto += (Number(servicio.gasto) || 0) * cantidad;
            acc.utilidad += (Number(servicio.utilidad) || 0) * cantidad;
            acc.precioSistema += (Number(servicio.precio_publico) || 0) * cantidad;
            return acc;
        }, { costo: 0, gasto: 0, utilidad: 0, precioSistema: 0 });

        // La comisión y el sobreprecio se calculan sobre el PRECIO DE VENTA FINAL
        const comisionVentaCalculada = precioVentaNum * comisionPorcentaje;
        const sobreprecioCalculado = precioVentaNum * sobreprecioPorcentaje;

        // La ganancia neta es el precio de venta menos todos los costos (directos, indirectos y de venta)
        const gananciaNeta = precioVentaNum - totals.costo - totals.gasto - comisionVentaCalculada - sobreprecioCalculado;

        return {
            totalCosto: totals.costo,
            totalGasto: totals.gasto,
            totalUtilidad: totals.utilidad, // Esta es la "Utilidad Base"
            precioSistema: totals.precioSistema,
            comisionVentaCalculada,
            sobreprecioCalculado,
            gananciaNeta
        };
    }, [serviciosEnPaquete, configuracion, watchedPrecioVenta]);

    const onSubmit = async (data: PaqueteForm) => {
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
            <div className='flex justify-between items-center mb-6 pb-4 border-b border-zinc-700'>
                <input {...register('nombre')} className="text-2xl font-semibold text-zinc-100 bg-transparent border-none focus:ring-0 p-0 w-full" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* --- Columna 1: Detalles --- */}
                <div className="lg:col-span-1 space-y-6">
                    <div>
                        <label htmlFor="eventoTipoId" className="block text-sm font-medium text-zinc-300 mb-1.5">Tipo de Evento</label>
                        <select id="eventoTipoId" {...register('eventoTipoId')} className="flex h-10 w-full items-center rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm">
                            {tiposEvento.map(tipo => <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-zinc-300 mb-1.5">Estatus</label>
                        <select id="status" {...register('status')} className="flex h-10 w-full items-center rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm">
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                        </select>
                    </div>

                    <div className="p-3 rounded-lg border border-zinc-700/70 bg-zinc-800/50 space-y-2 text-xs text-zinc-400">
                        <h4 className="text-sm font-medium text-zinc-200 mb-2">Desglose de Costos</h4>
                        <div className="flex justify-between"><span>Costo Total:</span> <span className="font-medium text-zinc-200">{totalCosto.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span></div>
                        <div className="flex justify-between"><span>Gasto Total:</span> <span className="font-medium text-zinc-200">{totalGasto.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span></div>
                        <div className="flex justify-between"><span>Utilidad Base Total:</span> <span className="font-medium text-zinc-200">{totalUtilidad.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span></div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Precio Sistema (Sugerido)</label>
                        <div className="flex h-10 w-full items-center rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-400">
                            {precioSistema.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="precio" className="block text-sm font-medium text-zinc-300 mb-1.5">Precio de Venta (Editable)</label>
                        <input id="precio" type="text" {...register('precio')} className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm" />
                        {errors.precio && <p className="text-red-400 text-xs mt-1.5">{errors.precio.message}</p>}
                    </div>

                    <div className="p-3 rounded-lg border border-zinc-700/70 bg-zinc-800/50 space-y-2 text-xs text-zinc-400">
                        <h4 className="text-sm font-medium text-zinc-200 mb-2">Desglose sobre Venta</h4>
                        <div className="flex justify-between"><span>Comisión Venta:</span> <span className="font-medium text-zinc-200">{comisionVentaCalculada.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span></div>
                        <div className="flex justify-between"><span>Sobreprecio:</span> <span className="font-medium text-zinc-200">{sobreprecioCalculado.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span></div>
                        <div className={`flex justify-between pt-2 border-t border-zinc-700/50 mt-2 ${gananciaNeta < totalUtilidad ? 'text-red-400' : 'text-green-400'}`}>
                            <span className="font-medium">Utilidad Neta:</span>
                            <span className="font-semibold text-base">{gananciaNeta.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                        </div>
                    </div>
                </div>

                {/* --- Columna 2: Wishlist --- */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-medium text-zinc-300">Servicios en el Paquete</h2>
                    {fields.length === 0 ? <p className="text-zinc-500 text-sm py-10 text-center border border-dashed border-zinc-700 rounded-lg">Agrega servicios desde la lista de la derecha.</p> : (
                        <div className="space-y-4">
                            {wishlistAgrupada.map(grupo => (
                                <div key={grupo.id}>
                                    <h3 className="text-base font-semibold text-zinc-400 mb-2">{grupo.nombre}</h3>
                                    <ul className="space-y-2">
                                        {grupo.servicios.map(servicio => {
                                            const fieldIndex = fields.findIndex(f => f.servicioId === servicio.id);
                                            if (fieldIndex === -1) return null;
                                            return (
                                                <li key={servicio.id} className="p-2 rounded-md bg-zinc-800 flex justify-between items-center text-sm">
                                                    <span className="text-zinc-300 flex-grow">{servicio.nombre}</span>
                                                    <div className="flex items-center gap-2">
                                                        <button type="button" onClick={() => handleUpdateQty(servicio.servicioId, parseInt(servicio.cantidad, 10) - 1)}><MinusCircle size={16} className="text-zinc-400" /></button>
                                                        <input value={servicio.cantidad} onChange={e => handleUpdateQty(servicio.servicioId, parseInt(e.target.value ?? '1', 10) || 1)} className="w-10 text-center bg-zinc-900 rounded-md h-7" />
                                                        <button type="button" onClick={() => handleUpdateQty(servicio.servicioId, parseInt(servicio.cantidad ?? '1', 10) + 1)}><PlusCircle size={16} className="text-zinc-400" /></button>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- Columna 3: Servicios Disponibles --- */}
                <div className="lg:col-span-2 space-y-4 max-h-[70vh] overflow-y-auto">
                    <h2 className="text-lg font-medium text-zinc-300 sticky top-0 bg-zinc-950 py-2">Servicios Disponibles</h2>
                    {serviciosDisponibles.map(categoria => (
                        <div key={categoria.id}>
                            <h3 className="text-base font-semibold text-zinc-400 mb-2">{categoria.nombre}</h3>
                            <ul className="space-y-2">
                                {categoria.Servicio.map(servicio => (
                                    <li key={servicio.id} onClick={() => handleAddServicio(servicio)}
                                        className="p-3 rounded-md border border-zinc-800 bg-zinc-900 flex justify-between items-center cursor-pointer hover:border-blue-500">
                                        <span className="text-sm">{servicio.nombre}</span>
                                        <span className="text-xs text-zinc-400">{servicio.precio_publico.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
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
                    <button type="submit" disabled={isSubmitting}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                        {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
                        Actualizar Paquete
                    </button>
                </div>
            </div>
        </form>
    );
}
