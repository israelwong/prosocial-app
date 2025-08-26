// Ruta: app/admin/configurar/servicios/components/ServicioForm.tsx

'use client';

import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ServicioSchema, type ServicioForm } from '@/app/admin/_lib/actions/servicios/servicios.schemas';
import { crearServicio, actualizarServicio, eliminarServicio } from '@/app/admin/_lib/actions/servicios/servicios.actions';
import { type Servicio, type ServicioCategoria, type ServicioGasto, type Configuracion } from '@prisma/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Props {
    servicio?: (Servicio & { ServicioGasto: ServicioGasto[] }) | null;
    categorias: ServicioCategoria[];
    configuracion: Configuracion | null;
    initialCategoriaId?: string; // nueva prop para preseleccionar categoría en creación
}

export default function ServicioForm({ servicio, categorias, configuracion, initialCategoriaId }: Props) {
    const router = useRouter();
    const isEditMode = !!servicio;
    const basePath = '/admin/configurar/catalogo';

    const [gastoNombre, setGastoNombre] = useState('');
    const [gastoCosto, setGastoCosto] = useState('');

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting }
    } = useForm<ServicioForm>({
        resolver: zodResolver(ServicioSchema),
        defaultValues: {
            id: servicio?.id,
            nombre: servicio?.nombre ?? '',
            servicioCategoriaId: servicio?.servicioCategoriaId ?? (initialCategoriaId && categorias.some(c => c.id === initialCategoriaId) ? initialCategoriaId : ''),
            costo: String(servicio?.costo ?? ''),
            tipo_utilidad: (servicio?.tipo_utilidad as 'servicio' | 'producto' | undefined) ?? 'servicio',
            visible_cliente: servicio?.visible_cliente ?? true,
            gastos: servicio?.ServicioGasto.map(g => ({ ...g, costo: String(g.costo) })) ?? [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "gastos",
    });

    const watchedFields = useWatch({ control });

    const {
        precioSistema,
        comisionVentaMonto,
        sobreprecioMonto,
        utilidadBase,
        totalGastos,
    } = useMemo(() => {

        const costo = parseFloat(watchedFields.costo || '0');
        const gastos = watchedFields.gastos || [];
        const tipoUtilidad = watchedFields.tipo_utilidad;

        const totalGastos = parseFloat((gastos.reduce((acc, gasto) => acc + parseFloat(gasto.costo || '0'), 0)).toFixed(2));
        // Valores en configuracion ya están persistidos como fracciones (ej: 0.125 para 12.5%)
        const utilidadPorcentaje = (tipoUtilidad === 'servicio' ? (configuracion?.utilidad_servicio ?? 0) : (configuracion?.utilidad_producto ?? 0));
        const comisionPorcentaje = (configuracion?.comision_venta ?? 0);
        const sobreprecioPorcentaje = (configuracion?.sobreprecio ?? 0);

        const utilidadBase = parseFloat((costo * utilidadPorcentaje).toFixed(2));
        // Calculamos el subtotal, que es la suma del costo, gastos y utilidad
        const subtotal = parseFloat((costo + totalGastos + utilidadBase).toFixed(2));

        // Primero aplicamos el sobreprecio (markup) al subtotal
        const sobreprecioMonto = parseFloat((sobreprecioPorcentaje * subtotal).toFixed(2));
        const montoTrasSobreprecio = parseFloat((subtotal + sobreprecioMonto).toFixed(2));
        // Luego calculamos el precio objetivo que cubre comisión
        const denominador = 1 - comisionPorcentaje;
        const precioSistema = denominador > 0 ? parseFloat((montoTrasSobreprecio / denominador).toFixed(2)) : Infinity;
        const comisionVentaMonto = parseFloat((precioSistema * comisionPorcentaje).toFixed(2));

        return { precioSistema, comisionVentaMonto, sobreprecioMonto, utilidadBase, totalGastos };
    }, [watchedFields, configuracion]);

    const onSubmit = async (data: ServicioForm) => {
        const action = isEditMode ? actualizarServicio : crearServicio;
        const toastMessage = isEditMode ? 'Actualizando...' : 'Creando...';

        toast.loading(toastMessage);
        const result = await action(data);
        toast.dismiss();

        if (result && result.success === false) {
            // Check if result has an 'error' property before accessing it
            const error =
                'error' in result && result.error
                    ? Object.values(result.error).flat()[0]
                    : (result as any).message;
            toast.error(error || 'Hubo un error al guardar.');
        } else {
            toast.success(`¡Servicio ${isEditMode ? 'actualizado' : 'creado'}!`);
            if (isEditMode) {
                router.back();
            }
        }
    };

    const handleDelete = async () => {
        if (!servicio?.id) return;
        if (confirm('¿Seguro que quieres eliminar este servicio?')) {
            try {
                const result = await eliminarServicio(servicio.id);
                if (result && result.success === false) {
                    const error =
                        'error' in result && result.error
                            ? Object.values(result.error).flat()[0]
                            : (result as any).message;
                    alert(error || 'Hubo un error al eliminar.');
                    toast.error(error || 'Error al eliminar el servicio.');
                } else {
                    toast.success('¡Servicio eliminado!');
                    router.push(basePath);
                }
            } catch (error) {
                alert('Error al eliminar el servicio.');
                toast.error('Error al eliminar el servicio.');
            }
        }
    }

    const handleAddGasto = () => {
        if (gastoNombre.trim() && !isNaN(parseFloat(gastoCosto))) {
            append({ nombre: gastoNombre, costo: gastoCosto });
            setGastoNombre('');
            setGastoCosto('');
        } else {
            toast.error('Ingresa un concepto y un monto válido.');
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className='flex justify-between items-center mb-6 pb-4 border-b border-zinc-700'>
                <h1 className='text-2xl font-semibold text-zinc-100'>
                    {isEditMode ? 'Editar Servicio' : 'Nuevo Servicio'}
                </h1>
                {/* <div className="flex items-center gap-3">
                    <label htmlFor="visible_cliente" className="text-sm text-zinc-400">Visible al cliente</label>
                    <input
                        id="visible_cliente"
                        type="checkbox"
                        {...register('visible_cliente')}
                        className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-blue-600 focus:ring-blue-500"
                    />
                </div> */}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="servicioCategoriaId" className="block text-sm font-medium text-zinc-300 mb-1.5">Categoría</label>
                        <select id="servicioCategoriaId" {...register('servicioCategoriaId')}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
                            <option value="">-- Selecciona una categoría --</option>
                            {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                        </select>
                        {errors.servicioCategoriaId && <p className="text-red-400 text-xs mt-1.5">{errors.servicioCategoriaId.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="tipo_utilidad" className="block text-sm font-medium text-zinc-300 mb-1.5">Tipo de Utilidad</label>
                        <select id="tipo_utilidad" {...register('tipo_utilidad')}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
                            <option value="servicio">Servicio</option>
                            <option value="producto">Producto</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-zinc-300 mb-1.5">Nombre / Descripción del Servicio</label>
                    <textarea id="nombre" {...register('nombre')} rows={3}
                        className="flex w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" />
                    {errors.nombre && <p className="text-red-400 text-xs mt-1.5">{errors.nombre.message}</p>}
                </div>

                <div className="p-4 rounded-lg border border-zinc-700/70 bg-zinc-800/50 space-y-4">
                    <h3 className="text-base font-medium text-zinc-200">Gastos Fijos Asociados</h3>
                    <div className="space-y-2">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2">
                                <input {...register(`gastos.${index}.nombre`)} placeholder="Concepto" className="flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm" />
                                <input {...register(`gastos.${index}.costo`)} placeholder="Monto" type="text" className="flex h-9 w-28 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm" />
                                <button type="button" onClick={() => remove(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-md"><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-zinc-700/50">
                        <input value={gastoNombre} onChange={e => setGastoNombre(e.target.value)} placeholder="Nuevo concepto" className="flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm" />
                        <input value={gastoCosto} onChange={e => setGastoCosto(e.target.value)} placeholder="Monto" type="text" className="flex h-9 w-28 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm" />
                        <button type="button" onClick={handleAddGasto} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-md"><Plus size={16} /></button>
                    </div>
                </div>

                {/* --- SECCIÓN DE PRECIOS REESTRUCTURADA --- */}
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="costo" className="block text-sm font-medium text-zinc-300 mb-1.5">Costo Base del Servicio</label>
                            <input
                                id="costo"
                                type="text"
                                {...register('costo')}
                                className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                            />
                            {errors.costo && (
                                <p className="text-red-400 text-xs mt-1.5">{errors.costo.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Precio Sistema (Sugerido)</label>
                            <div className="flex h-10 w-full items-center rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-400">
                                {precioSistema.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg border border-zinc-700/70 bg-zinc-800/50 space-y-4">
                        <h3 className="text-base font-medium text-zinc-200">Desglose de Cálculo</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-zinc-400 text-center">
                            <div>
                                <span className="font-medium text-zinc-300 block">Utilidad Base</span>
                                <span>{utilidadBase.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                            </div>
                            <div>
                                <span className="font-medium text-zinc-300 block">Gastos Totales</span>
                                <span>{totalGastos.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                            </div>
                            <div>
                                <span className="font-medium text-zinc-300 block">Sobreprecio</span>
                                <span>{sobreprecioMonto.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                            </div>
                            <div>
                                <span className="font-medium text-zinc-300 block">Comisión Venta</span>
                                <span>{comisionVentaMonto.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-zinc-700">
                    <div>
                        {isEditMode && (
                            <button type="button" onClick={handleDelete} className="flex items-center text-sm text-red-500 hover:text-red-400">
                                <Trash2 size={16} className="mr-2" />
                                Eliminar Servicio
                            </button>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <button type="button" onClick={() => router.push(basePath)}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-zinc-700 text-zinc-100 hover:bg-zinc-600">
                            {isEditMode ? 'Cerrar' : 'Cancelar'}
                        </button>
                        <button type="submit" disabled={isSubmitting}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                            {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
                            {isEditMode ? 'Actualizar Servicio' : 'Crear Servicio'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
