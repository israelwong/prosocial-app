'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CategoriaSchema, type CategoriaForm } from '@/app/admin/_lib/actions/catalogo/catalogo.schemas';
import { upsertCategoria, deleteItem } from '@/app/admin/_lib/actions/catalogo/catalogo.actions';
import { useRouter } from 'next/navigation';
import { Loader2, Trash } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/app/components/ui/button';

interface Props {
    categoria?: { id: string; nombre: string } | null;
    seccionId?: string;
}

export default function CategoriaForm({ categoria, seccionId }: Props) {
    const router = useRouter();
    const isEditMode = !!categoria;

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CategoriaForm>({
        resolver: zodResolver(CategoriaSchema),
        defaultValues: { id: categoria?.id, nombre: categoria?.nombre ?? '' }
    });

    const onSubmit = async (data: CategoriaForm) => {
        if (!isEditMode && !seccionId) {
            toast.error('Falta el seccionId para crear la categoría.');
            return;
        }
        const toastId = toast.loading(isEditMode ? 'Actualizando...' : 'Creando...');
        try {
            await upsertCategoria({ id: categoria?.id, nombre: data.nombre, seccionId });
            toast.success(isEditMode ? 'Categoría actualizada.' : 'Categoría creada.', { id: toastId });
            router.push('/admin/configurar/catalogo');
            router.refresh();
        } catch (e: any) {
            toast.error(e?.message || 'Error al guardar', { id: toastId });
        }
    };

    const handleDelete = async () => {
        if (!categoria?.id) return;
        if (!confirm('¿Eliminar categoría? Esta acción es irreversible.')) return;
        const toastId = toast.loading('Eliminando...');
        try {
            await deleteItem(categoria.id, 'categoria');
            toast.success('Categoría eliminada.', { id: toastId });
            router.push('/admin/configurar/catalogo');
            router.refresh();
        } catch (e: any) {
            toast.error(e?.message || 'No se pudo eliminar', { id: toastId });
        }
    };

    return (
        <div className='max-w-xl mx-auto'>
            <div className='flex justify-between items-center mb-6 pb-4 border-b border-zinc-700'>
                <h1 className='text-2xl font-semibold text-zinc-100'>{isEditMode ? 'Editar Categoría' : 'Nueva Categoría'}</h1>
                {isEditMode && (
                    <Button type='button' variant='destructive' onClick={handleDelete} className='flex items-center gap-2'>
                        <Trash size={16} />
                        Eliminar
                    </Button>
                )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div>
                    <label className='block text-sm font-medium text-zinc-300 mb-1.5'>Nombre</label>
                    <input {...register('nombre')} className='flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100' />
                    {errors.nombre && <p className='text-red-400 text-xs mt-1.5'>{errors.nombre.message}</p>}
                </div>

                <div className='flex justify-end gap-4 pt-6 border-t border-zinc-700'>
                    <Button type='button' variant='secondary' onClick={() => router.back()}>Cancelar</Button>
                    <Button type='submit' disabled={isSubmitting} className='min-w-32'>
                        {isSubmitting ? <Loader2 className='animate-spin size-4' /> : isEditMode ? 'Actualizar' : 'Crear Categoría'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
