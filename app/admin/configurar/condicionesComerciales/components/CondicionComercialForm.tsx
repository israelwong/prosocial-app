// Ruta: app/admin/configurar/condicionesComerciales/components/CondicionComercialForm.tsx

'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CondicionComercialSchema, type CondicionComercialForm } from '@/app/admin/_lib/actions/condicionesComerciales/condicionesComerciales.schemas';
import { crearCondicionComercial, actualizarCondicionComercial, eliminarCondicionComercial } from '@/app/admin/_lib/actions/condicionesComerciales/condicionesComerciales.actions';
import { type CondicionesComerciales, type MetodoPago } from '@prisma/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Trash } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

// Interfaz para los datos que necesita el formulario
interface FormProps {
    condicion?: (CondicionesComerciales & {
        CondicionesComercialesMetodoPago: { metodoPagoId: string }[];
    }) | null;
    metodosPagoDisponibles: MetodoPago[];
}

export default function CondicionComercialForm({ condicion, metodosPagoDisponibles }: FormProps) {
    const router = useRouter();
    const isEditMode = !!condicion;

    const {
        register,
        handleSubmit,
        control, // Necesario para componentes controlados como los checkboxes
        formState: { errors, isSubmitting },
    } = useForm<CondicionComercialForm>({
        resolver: zodResolver(CondicionComercialSchema),
        defaultValues: {
            id: condicion?.id,
            nombre: condicion?.nombre ?? '',
            descripcion: condicion?.descripcion ?? '',
            descuento: String(condicion?.descuento ?? ''),
            porcentaje_anticipo: String(condicion?.porcentaje_anticipo ?? ''),
            status: condicion?.status === 'inactive' ? 'inactive' : 'active',
            metodosPagoIds: condicion?.CondicionesComercialesMetodoPago.map(mp => mp.metodoPagoId) ?? [],
        },
    });

    const onSubmit = async (data: CondicionComercialForm) => {
        const action = isEditMode ? actualizarCondicionComercial : crearCondicionComercial;
        const toastMessage = isEditMode ? 'Actualizando...' : 'Creando...';
        toast.loading(toastMessage);
        await action(data);
    };

    const handleDelete = async () => {
        if (!condicion?.id) return;
        if (confirm('¿Estás seguro? Esta acción no se puede deshacer.')) {
            toast.loading('Eliminando...');
            await eliminarCondicionComercial(condicion.id);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className='flex justify-between items-center mb-6 pb-4 border-b border-zinc-700'>
                <h1 className='text-2xl font-semibold text-zinc-100'>
                    {isEditMode ? 'Editar Condición Comercial' : 'Nueva Condición Comercial'}
                </h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-6'>
                    <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-zinc-300 mb-1.5">Nombre</label>
                        <input id="nombre" type="text" {...register('nombre')}
                            className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" />
                        {errors.nombre && <p className="text-red-400 text-xs mt-1.5">{errors.nombre.message}</p>}
                    </div>
                </div>

                <div>
                    <label htmlFor="descripcion" className="block text-sm font-medium text-zinc-300 mb-1.5">Descripción</label>
                    <textarea id="descripcion" {...register('descripcion')} rows={3}
                        className="flex w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" />
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                    <div>
                        <label htmlFor="descuento" className="block text-sm font-medium text-zinc-300 mb-1.5">Descuento (%)</label>
                        <input id="descuento" type="text" {...register('descuento')}
                            className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" />
                    </div>
                    <div>
                        <label htmlFor="porcentaje_anticipo" className="block text-sm font-medium text-zinc-300 mb-1.5">Anticipo Requerido (%)</label>
                        <input id="porcentaje_anticipo" type="text" {...register('porcentaje_anticipo')}
                            className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" />
                    </div>
                </div>

                <div className="p-4 rounded-lg border border-zinc-700/70 bg-zinc-800/50">
                    <h3 className="text-base font-medium text-zinc-200 mb-3">
                        Métodos de Pago Aplicables
                        <span className="text-red-400 ml-1">*</span>
                    </h3>
                    <p className="text-sm text-zinc-400 mb-3">
                        Selecciona los métodos de pago que estarán disponibles para esta condición comercial
                    </p>
                    <Controller
                        name="metodosPagoIds"
                        control={control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                {metodosPagoDisponibles.map((metodo) => (
                                    <label key={metodo.id} className="flex items-center gap-3 text-sm text-zinc-300 hover:text-zinc-200 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            value={metodo.id}
                                            checked={field.value?.includes(metodo.id)}
                                            onChange={(e) => {
                                                const newValues = e.target.checked
                                                    ? [...(field.value ?? []), e.target.value]
                                                    : (field.value ?? []).filter(id => id !== e.target.value);
                                                field.onChange(newValues);
                                            }}
                                            className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-blue-600 focus:ring-blue-500 focus:ring-2"
                                        />
                                        <span className="flex-1">{metodo.metodo_pago}</span>
                                        {field.value?.includes(metodo.id) && (
                                            <span className="text-green-400 text-xs">✓ Seleccionado</span>
                                        )}
                                    </label>
                                ))}
                                {metodosPagoDisponibles.length === 0 && (
                                    <div className="text-amber-400 text-sm p-3 bg-amber-900/20 border border-amber-700/50 rounded-md">
                                        ⚠️ No hay métodos de pago disponibles.
                                        <a href="/admin/configurar/metodoPago" className="text-amber-300 underline ml-1">
                                            Crear método de pago
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    />
                    {errors.metodosPagoIds && (
                        <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                            <span>⚠️</span> {errors.metodosPagoIds.message}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-zinc-300 mb-1.5">Estatus</label>
                    <select id="status" {...register('status')}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                    </select>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-zinc-700">
                    <div>
                        {isEditMode && (
                            <Button type="button" variant="destructive" onClick={handleDelete} className="flex items-center text-sm">
                                <Trash size={16} className="mr-2" />
                                Eliminar
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => router.back()}
                            className="h-10 px-4 py-2"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-10 px-4 py-2"
                        >
                            {isSubmitting ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear Condición')}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
