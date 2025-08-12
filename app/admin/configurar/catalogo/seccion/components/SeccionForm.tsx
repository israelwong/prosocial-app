'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SeccionSchema, type SeccionForm } from '@/app/admin/_lib/actions/secciones/secciones.schemas';
import { crearSeccion, actualizarSeccion, eliminarSeccion } from '@/app/admin/_lib/actions/secciones/secciones.actions';
import { useRouter } from 'next/navigation';
import { Loader2, Trash } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/app/components/ui/button';

interface Props {
    seccion?: { id: string; nombre: string; descripcion: string | null } | null;
}

export default function SeccionForm({ seccion }: Props) {
    const router = useRouter();
    const isEditMode = !!seccion;

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SeccionForm>({
        resolver: zodResolver(SeccionSchema),
        defaultValues: { id: seccion?.id, nombre: seccion?.nombre ?? '', descripcion: seccion?.descripcion ?? '' }
    });

    const onSubmit = async (data: SeccionForm) => {
        const action = isEditMode ? actualizarSeccion : crearSeccion;
        const toastId = toast.loading(isEditMode ? 'Actualizando...' : 'Creando...');
        const result = await action(data);
        if (result.success) {
            toast.success(isEditMode ? 'Sección actualizada.' : 'Sección creada.', { id: toastId });
            router.push('/admin/configurar/catalogo');
            router.refresh();
        } else {
            toast.error(result.message || 'Error al guardar', { id: toastId });
        }
    };

    const handleDelete = async () => {
        if (!seccion?.id) return;
        if (!confirm('¿Eliminar sección? Esta acción es irreversible.')) return;
        const toastId = toast.loading('Eliminando...');
        const res = await eliminarSeccion(seccion.id);
        if (res.success) {
            toast.success('Sección eliminada.', { id: toastId });
            router.push('/admin/configurar/catalogo');
            router.refresh();
        } else {
            toast.error(res.message || 'No se pudo eliminar', { id: toastId });
        }
    };

    return (
        <div className='max-w-xl mx-auto'>
            <div className='flex justify-between items-center mb-6 pb-4 border-b border-zinc-700'>
                <h1 className='text-2xl font-semibold text-zinc-100'>{isEditMode ? 'Editar Sección' : 'Nueva Sección'}</h1>
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
                <div>
                    <label className='block text-sm font-medium text-zinc-300 mb-1.5'>Descripción</label>
                    <textarea rows={3} {...register('descripcion')} className='flex w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100' />
                </div>

                <div className='flex justify-end gap-4 pt-6 border-t border-zinc-700'>
                    <Button type='button' variant='secondary' onClick={() => router.back()}>Cancelar</Button>
                    <Button type='submit' disabled={isSubmitting} className='min-w-32'>
                        {isSubmitting ? <Loader2 className='animate-spin size-4' /> : isEditMode ? 'Actualizar' : 'Crear Sección'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
