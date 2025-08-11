// Ruta: app/admin/configurar/parametros/components/ConfiguracionForm.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ConfiguracionSchema, type ConfiguracionForm } from '@/app/admin/_lib/actions/configuracion/configuracion.schemas';
import { updateGlobalConfiguracion } from '@/app/admin/_lib/actions/configuracion/configuracion.actions';
import { type Configuracion } from '@prisma/client';
import toast from 'react-hot-toast';
// useEffect ya no es necesario para resetear el formulario.
import { useEffect } from 'react';

interface Props {
    config: Configuracion;
}

export default function ConfiguracionForm({ config }: Props) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm<ConfiguracionForm>({
        resolver: zodResolver(ConfiguracionSchema),
        defaultValues: {
            id: config.id,
            nombre: config.nombre ?? '',
            utilidad_servicio: String((config.utilidad_servicio ?? 0) * 100),
            utilidad_producto: String((config.utilidad_producto ?? 0) * 100),
            comision_venta: String((config.comision_venta ?? 0) * 100),
            sobreprecio: String((config.sobreprecio ?? 0) * 100),
            status: config.status === 'inactive' ? 'inactive' : 'active',
            claveAutorizacion: config.claveAutorizacion ?? '',
            numeroMaximoServiciosPorDia: String(config.numeroMaximoServiciosPorDia ?? 1),
        },
    });

    // SOLUCIÓN: Se ha eliminado el hook useEffect que causaba el bucle de multiplicación.
    // La revalidación de la página se encarga de proporcionar los nuevos `defaultValues`
    // al formulario en cada render después de guardar, lo que simplifica el flujo de datos.

    const onSubmit = async (data: ConfiguracionForm) => {
        toast.loading('Guardando cambios...');
        const result = await updateGlobalConfiguracion(data);
        toast.dismiss();

        if (result.success) {
            toast.success('¡Configuración guardada con éxito!');
        } else {
            const fieldErrors = result.error ? Object.values(result.error).flat() : [];
            const errorMessage = fieldErrors[0] || 'Hubo un error al guardar. Inténtalo de nuevo.';
            toast.error(errorMessage);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>

                <form onSubmit={handleSubmit(onSubmit)} className='lg:col-span-2 space-y-6 p-6 rounded-xl border border-zinc-700 bg-zinc-800/70'>

                    <div className='lg:col-span-1 text-sm text-zinc-400 space-y-4'>
                        <h2 className="text-lg font-semibold text-zinc-100">Parámetros Base</h2>
                        <p>Estos valores definen los cálculos de precios y comisiones en todo el sistema.</p>
                    </div>

                    <input type="hidden" {...register('id')} />

                    <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-zinc-300 mb-1.5">Nombre</label>
                        <input disabled readOnly id="nombre" type="text" {...register('nombre')}
                            className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-400" />
                        {errors.nombre && <p className="text-red-400 text-xs mt-1.5">{errors.nombre.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                        <div>
                            <label htmlFor="utilidad_servicio" className="block text-sm font-medium text-zinc-300 mb-1.5">Utilidad Servicios (%)</label>
                            <input id="utilidad_servicio" type="text" {...register('utilidad_servicio')}
                                className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" />
                            {errors.utilidad_servicio && <p className="text-red-400 text-xs mt-1.5">{errors.utilidad_servicio.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="utilidad_producto" className="block text-sm font-medium text-zinc-300 mb-1.5">Utilidad Productos (%)</label>
                            <input id="utilidad_producto" type="text" {...register('utilidad_producto')}
                                className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" />
                            {errors.utilidad_producto && <p className="text-red-400 text-xs mt-1.5">{errors.utilidad_producto.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="comision_venta" className="block text-sm font-medium text-zinc-300 mb-1.5">Comisión Ventas (%)</label>
                            <input id="comision_venta" type="text" {...register('comision_venta')}
                                className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" />
                            {errors.comision_venta && <p className="text-red-400 text-xs mt-1.5">{errors.comision_venta.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="sobreprecio" className="block text-sm font-medium text-zinc-300 mb-1.5">Sobreprecio (%)</label>
                            <input id="sobreprecio" type="text" {...register('sobreprecio')}
                                className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" />
                            {errors.sobreprecio && <p className="text-red-400 text-xs mt-1.5">{errors.sobreprecio.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="claveAutorizacion" className="block text-sm font-medium text-zinc-300 mb-1.5">Clave de Autorización</label>
                        <input id="claveAutorizacion" type="text" {...register('claveAutorizacion')}
                            className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" />
                        {errors.claveAutorizacion && <p className="text-red-400 text-xs mt-1.5">{errors.claveAutorizacion.message}</p>}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-zinc-700/50">
                        <button type="submit" disabled={isSubmitting}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
