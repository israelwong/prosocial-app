// Ruta: app/admin/configurar/metodoPago/components/MetodoPagoForm.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MetodoPagoSchema, type MetodoPagoForm } from '@/app/admin/_lib/actions/metodoPago/metodoPago.schemas';
import { crearMetodoPago, actualizarMetodoPago, eliminarMetodoPago } from '@/app/admin/_lib/actions/metodoPago/metodoPago.actions';
import { type MetodoPago } from '@prisma/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Trash } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface Props {
    // Si `metodo` existe, estamos en modo edición. Si no, en modo creación.
    metodo?: MetodoPago | null;
}

export default function MetodoPagoForm({ metodo }: Props) {
    const router = useRouter();
    const isEditMode = !!metodo;

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<MetodoPagoForm>({
        resolver: zodResolver(MetodoPagoSchema),
        defaultValues: {
            id: metodo?.id,
            metodo_pago: metodo?.metodo_pago ?? '',
            comision_porcentaje_base: String(metodo?.comision_porcentaje_base ?? ''),
            comision_fija_monto: String(metodo?.comision_fija_monto ?? ''),
            num_msi: String(metodo?.num_msi ?? ''),
            comision_msi_porcentaje: String(metodo?.comision_msi_porcentaje ?? ''),
            payment_method: metodo?.payment_method ?? '',
            status: metodo?.status === 'inactive' ? 'inactive' : 'active',
        },
    });

    const onSubmit = async (data: MetodoPagoForm) => {
        const action = isEditMode ? actualizarMetodoPago : crearMetodoPago;
        const toastMessage = isEditMode ? 'Actualizando...' : 'Creando...';

        toast.loading(toastMessage);
        const result = await action(data);
        toast.dismiss();

        if (result?.success === false) {
            toast.error(result.message || 'Hubo un error.');
        } else {
            toast.success(`¡Método de pago ${isEditMode ? 'actualizado' : 'creado'}!`);
            // El redirect en la server action se encargará de la navegación.
        }
    };

    const handleDelete = async () => {
        if (!metodo?.id) return;
        if (confirm('¿Estás seguro de que quieres eliminar este método de pago?')) {
            toast.loading('Eliminando...');
            await eliminarMetodoPago(metodo.id);
            toast.dismiss();
            toast.success('Método de pago eliminado.');
        }
    }

    return (
        <div className="max-w-xl mx-auto">
            <div className='flex justify-between items-center mb-6 pb-4 border-b border-zinc-700'>
                <h1 className='text-2xl font-semibold text-zinc-100'>
                    {isEditMode ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
                </h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="metodo_pago" className="block text-sm font-medium text-zinc-300 mb-1.5">Nombre del Método</label>
                        <input id="metodo_pago" type="text" {...register('metodo_pago')}
                            className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" />
                        {errors.metodo_pago && <p className="text-red-400 text-xs mt-1.5">{errors.metodo_pago.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="payment_method" className="block text-sm font-medium text-zinc-300 mb-1.5">ID de Stripe (ej. card, oxxo)</label>
                        <input id="payment_method" type="text" {...register('payment_method')}
                            className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" />
                    </div>
                </div>

                <div className="p-4 rounded-lg border border-zinc-700/70 bg-zinc-800/50 space-y-4">
                    <h3 className="text-base font-medium text-zinc-200">Comisiones</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="comision_porcentaje_base" className="block text-sm font-medium text-zinc-300 mb-1.5">Comisión Base (%)</label>
                            <input id="comision_porcentaje_base" type="text" {...register('comision_porcentaje_base')}
                                className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" />
                        </div>
                        <div>
                            <label htmlFor="comision_fija_monto" className="block text-sm font-medium text-zinc-300 mb-1.5">Comisión Fija ($)</label>
                            <input id="comision_fija_monto" type="text" {...register('comision_fija_monto')}
                                className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg border border-zinc-700/70 bg-zinc-800/50 space-y-4">
                    <h3 className="text-base font-medium text-zinc-200">Meses Sin Intereses (MSI)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="num_msi" className="block text-sm font-medium text-zinc-300 mb-1.5">Número de Meses</label>
                            <input id="num_msi" type="text" {...register('num_msi')}
                                className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" />
                        </div>
                        <div>
                            <label htmlFor="comision_msi_porcentaje" className="block text-sm font-medium text-zinc-300 mb-1.5">Comisión MSI (%)</label>
                            <input id="comision_msi_porcentaje" type="text" {...register('comision_msi_porcentaje')}
                                className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" />
                        </div>
                    </div>
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
                        <Button type="button" variant="secondary" onClick={() => router.back()}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear Método')}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
