// Ruta: app/admin/configurar/tipoEvento/components/TiposEventoCliente.tsx

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EventoTipoCreateSchema, type EventoTipoForm } from '@/app/admin/_lib/actions/evento/tipo/eventoTipo.schemas';
import { crearTipoEvento, actualizarTipoEvento, eliminarTipoEvento, actualizarPosicionTipoEvento, verificarSiPuedeEliminarTipoEvento } from '@/app/admin/_lib/actions/evento/tipo/eventoTipo.actions';
import { type EventoTipo } from '@prisma/client';
import toast from 'react-hot-toast';
import { GripVertical, Trash2, Loader2 } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRouter } from 'next/navigation'; // Importamos useRouter

// Componente para un solo item de la lista
function SortableItem({ item, onUpdate, onDelete }: { item: EventoTipo, onUpdate: (id: string, newName: string) => void, onDelete: (id: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const [name, setName] = useState(item.nombre);
    const [canDelete, setCanDelete] = useState(true);
    const [deleteReason, setDeleteReason] = useState<string | null>(null);

    // Verificar si se puede eliminar al cargar el componente
    useEffect(() => {
        const checkCanDelete = async () => {
            const result = await verificarSiPuedeEliminarTipoEvento(item.id);
            setCanDelete(result.puedeEliminar);
            setDeleteReason(result.razon);
        };
        checkCanDelete();
    }, [item.id]);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleBlur = () => {
        if (name.trim() && name !== item.nombre) {
            onUpdate(item.id, name);
        } else {
            setName(item.nombre);
        }
    };

    const handleDeleteClick = () => {
        if (!canDelete) {
            toast.error(deleteReason || 'No se puede eliminar este tipo de evento');
            return;
        }
        onDelete(item.id);
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
            <button
                onClick={handleDeleteClick}
                disabled={!canDelete}
                title={!canDelete ? deleteReason || 'No se puede eliminar' : 'Eliminar tipo de evento'}
                className={`p-2 rounded-md transition-colors ${canDelete
                    ? 'text-red-500 hover:bg-red-500/10'
                    : 'text-zinc-500 cursor-not-allowed opacity-50'
                    }`}
            >
                <Trash2 size={16} />
            </button>
        </li>
    );
}

// Componente principal
export default function TiposEventoCliente({ initialItems }: { initialItems: EventoTipo[] }) {
    const router = useRouter(); // Inicializamos el router
    const [items, setItems] = useState(initialItems);
    const [isMounted, setIsMounted] = useState(false);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Sincroniza el estado si las props iniciales cambian
    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EventoTipoForm>({
        resolver: zodResolver(EventoTipoCreateSchema),
    });

    const handleCreate = async (data: EventoTipoForm) => {
        const result = await crearTipoEvento(data);
        if (result.success) {
            toast.success('Tipo de evento creado.');
            reset({ nombre: '' });
            router.refresh(); // SOLUCIÓN: Refresca los datos del servidor
        } else {
            toast.error(result.message || 'Error al crear.');
        }
    };

    const handleUpdate = async (id: string, newName: string) => {
        toast.loading('Actualizando...');
        await actualizarTipoEvento({ id, nombre: newName });
        toast.dismiss();
        toast.success('Nombre actualizado.');
        router.refresh(); // SOLUCIÓN: Refresca los datos del servidor
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro?')) {
            toast.loading('Eliminando...');
            const result = await eliminarTipoEvento(id);
            toast.dismiss();
            if (result.success) {
                toast.success('Tipo de evento eliminado.');
                router.refresh(); // SOLUCIÓN: Refresca los datos del servidor
            } else {
                toast.error(result.message || 'Error al eliminar.');
            }
        }
    };

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = items.findIndex((i) => i.id === active.id);
            const newIndex = items.findIndex((i) => i.id === over.id);
            const reorderedItems = arrayMove(items, oldIndex, newIndex);
            setItems(reorderedItems);

            setIsSavingOrder(true);
            const updatedPositions = reorderedItems.map((item, index) => ({ id: item.id, posicion: index + 1 }));
            await actualizarPosicionTipoEvento(updatedPositions);
            setIsSavingOrder(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto">
            <div className='flex justify-between items-center mb-6 pb-4 border-b border-zinc-700'>
                <div className="flex items-center gap-3">
                    <h1 className='text-2xl font-semibold text-zinc-100'>Tipos de Evento</h1>
                    {isSavingOrder && <Loader2 size={16} className="animate-spin text-zinc-400" />}
                </div>
            </div>

            <form onSubmit={handleSubmit(handleCreate)} className="flex items-start gap-3 mb-6">
                <div className="flex-grow">
                    <input
                        {...register('nombre')}
                        placeholder="Nombre del nuevo tipo de evento"
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
                    <SortableContext items={items} strategy={verticalListSortingStrategy}>
                        <ul className="space-y-3">
                            {items.map(item => (
                                <SortableItem
                                    key={item.id}
                                    item={item}
                                    onUpdate={handleUpdate}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </ul>
                    </SortableContext>
                </DndContext>
            ) : (
                <div className="space-y-3">
                    {initialItems.map(item => (
                        <div key={item.id} className="h-[52px] bg-zinc-800 rounded-md animate-pulse"></div>
                    ))}
                </div>
            )}

            {items.length === 0 && isMounted && (
                <p className="text-center text-zinc-500 py-10">
                    No hay tipos de evento definidos.
                </p>
            )}
        </div>
    );
}
