// Ruta: app/admin/configurar/categorias/components/CategoriasCliente.tsx

'use client';

import { useState, useEffect } from 'react'; // Importamos useEffect
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CategoriaCreateSchema, type CategoriaForm } from '@/app/admin/_lib/actions/categorias/categorias.schemas';
import { crearCategoria, actualizarCategoria, eliminarCategoria, actualizarPosicionesCategorias } from '@/app/admin/_lib/actions/categorias/categorias.actions';
import { type ServicioCategoria } from '@prisma/client';
import toast from 'react-hot-toast';
import { GripVertical, Trash2, Loader2 } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRouter } from 'next/navigation';


// Componente para un solo item de la lista, que lo hace "arrastrable"
function SortableCategoryItem({ category, onUpdate, onDelete }: { category: ServicioCategoria, onUpdate: (id: string, newName: string) => void, onDelete: (id: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: category.id });
    const [name, setName] = useState(category.nombre);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleBlur = () => {
        if (name.trim() && name !== category.nombre) {
            onUpdate(category.id, name);
        } else {
            // Si el nombre está vacío o no cambió, revertimos al original
            setName(category.nombre);
        }
    };

    return (
        <li ref={setNodeRef} style={style} className="flex items-center gap-3 p-2 rounded-md bg-zinc-800 border border-zinc-700">
            <span {...attributes} {...listeners} className="cursor-grab touch-none p-1 text-zinc-400">
                <GripVertical size={20} />
            </span>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                className="flex-grow h-9 bg-zinc-900 border border-zinc-700 rounded-md px-3 text-sm text-zinc-200"
            />
            <button onClick={() => onDelete(category.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-md">
                <Trash2 size={16} />
            </button>
        </li>
    );
}

// Componente principal que maneja el estado y la lógica
export default function CategoriasCliente({ initialCategories }: { initialCategories: ServicioCategoria[] }) {
    const [categories, setCategories] = useState(initialCategories);
    const [isMounted, setIsMounted] = useState(false);
    const [isSavingOrder, setIsSavingOrder] = useState(false); // Estado para feedback de guardado
    const sensors = useSensors(useSensor(PointerSensor));
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CategoriaForm>({
        resolver: zodResolver(CategoriaCreateSchema),
    });

    const handleCreate = async (data: CategoriaForm) => {
        const result = await crearCategoria(data);
        if (result.success) {
            toast.success('Categoría creada con éxito.');
            reset({ nombre: '' });
            router.refresh();
        } else {
            toast.error(result.message || 'Error al crear la categoría.');
        }
    };

    const handleUpdate = async (id: string, newName: string) => {
        toast.loading('Actualizando...');
        const result = await actualizarCategoria({ id, nombre: newName });
        toast.dismiss();
        if (result.success) {
            toast.success('Categoría actualizada.');
            router.refresh();
        } else {
            toast.error(result.message || 'Error al actualizar.');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro? Se eliminará la categoría.')) {
            const result = await eliminarCategoria(id);
            if (result.success) {
                toast.success('Categoría eliminada.');
                router.refresh();
            } else {
                toast.error(result.message || 'Error al eliminar.');
            }
        }
    };

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = categories.findIndex((c) => c.id === active.id);
            const newIndex = categories.findIndex((c) => c.id === over.id);
            const reorderedCategories = arrayMove(categories, oldIndex, newIndex);
            setCategories(reorderedCategories); // Actualización optimista

            // SOLUCIÓN: Añadimos estados de carga y notificaciones
            setIsSavingOrder(true);
            const savingToast = toast.loading('Actualizando posiciones...');

            const updatedPositions = reorderedCategories.map((cat, index) => ({
                id: cat.id,
                posicion: index + 1,
            }));

            const result = await actualizarPosicionesCategorias(updatedPositions);

            toast.dismiss(savingToast);
            if (result.success) {
                toast.success('¡Orden guardado correctamente!');
            } else {
                toast.error(result.message || 'No se pudo guardar el orden.');
                // En caso de error, revertimos al orden original para mantener la consistencia
                setCategories(initialCategories);
            }
            setIsSavingOrder(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto">
            <div className='flex justify-between items-center mb-6 pb-4 border-b border-zinc-700'>
                <div className="flex items-center gap-3">
                    <h1 className='text-2xl font-semibold text-zinc-100'>Categorías de Servicios</h1>
                    {/* SOLUCIÓN: Indicador visual de guardado */}
                    {isSavingOrder && (
                        <span className="text-xs text-yellow-400 flex items-center gap-1.5">
                            <Loader2 size={14} className="animate-spin" />
                            Actualizando posición...
                        </span>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit(handleCreate)} className="flex items-start gap-3 mb-6">
                <div className="flex-grow">
                    <input
                        {...register('nombre')}
                        placeholder="Nombre de la nueva categoría"
                        className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                    />
                    {errors.nombre && <p className="text-red-400 text-xs mt-1.5">{errors.nombre.message}</p>}
                </div>
                <button type="submit" disabled={isSubmitting}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                    {isSubmitting ? 'Agregando...' : 'Agregar'}
                </button>
            </form>

            {isMounted ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={categories} strategy={verticalListSortingStrategy}>
                        <ul className="space-y-3">
                            {categories.map(category => (
                                <SortableCategoryItem
                                    key={category.id}
                                    category={category}
                                    onUpdate={handleUpdate}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </ul>
                    </SortableContext>
                </DndContext>
            ) : (
                <div className="space-y-3">
                    {initialCategories.map(cat => (
                        <div key={cat.id} className="h-[52px] bg-zinc-800 rounded-md animate-pulse"></div>
                    ))}
                </div>
            )}

            {categories.length === 0 && isMounted && (
                <p className="text-center text-zinc-500 py-10">
                    No hay categorías definidas.
                </p>
            )}
        </div>
    );
}
