// Ruta: app/admin/configurar/secciones/components/SeccionesCliente.tsx

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SeccionSchema, type SeccionForm } from '@/app/admin/_lib/actions/secciones/secciones.schemas';
import { crearSeccion, actualizarSeccion, asignarCategoriaASeccion, desasignarCategoria } from '@/app/admin/_lib/actions/secciones/secciones.actions';
import { type ServicioSeccion, type ServicioCategoria } from '@prisma/client';
import toast from 'react-hot-toast';
import { DndContext, PointerSensor, useSensor, useSensors, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { useRouter } from 'next/navigation';
import { Pencil, Loader2 } from 'lucide-react';

type SeccionConCategorias = ServicioSeccion & {
    seccionCategorias: { ServicioCategoria: ServicioCategoria }[];
};

// --- Componentes Internos ---

function DraggableCategory({ categoria }: { categoria: ServicioCategoria }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: categoria.id });
    const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 10 } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}
            className="p-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 cursor-grab">
            {categoria.nombre}
        </div>
    );
}

function DroppableSection({ id, children, title, onEdit }: { id: string, children: React.ReactNode, title: string, onEdit?: () => void }) {
    const { isOver, setNodeRef } = useDroppable({ id });
    const style = {
        backgroundColor: isOver ? 'rgba(59, 130, 246, 0.1)' : undefined,
        borderColor: isOver ? 'rgb(59, 130, 246)' : 'rgb(63, 63, 70)',
    };
    return (
        <div ref={setNodeRef} style={style} className="p-4 rounded-lg border border-zinc-800 bg-zinc-900 space-y-3 transition-colors min-h-[120px]">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-zinc-200">{title}</h3>
                {onEdit && <button onClick={onEdit} className="text-zinc-400 hover:text-white"><Pencil size={14} /></button>}
            </div>
            {children}
        </div>
    );
}

function SeccionModal({ seccion, onClose, onSave }: { seccion: Partial<SeccionForm> | null, onClose: () => void, onSave: () => void }) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SeccionForm>({
        resolver: zodResolver(SeccionSchema),
        defaultValues: seccion || { nombre: '', descripcion: '' },
    });

    const handleFormSubmit = async (data: SeccionForm) => {
        const action = data.id ? actualizarSeccion : crearSeccion;
        const result = await action(data);
        if (result.success) {
            toast.success(`Sección ${data.id ? 'actualizada' : 'creada'}.`);
            onSave();
        } else {
            toast.error(result.message || 'Hubo un error.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-zinc-900 p-6 rounded-lg w-full max-w-md space-y-4 border border-zinc-700">
                <h2 className="text-lg font-medium text-white">{seccion?.id ? 'Editar Sección' : 'Crear Nueva Sección'}</h2>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-zinc-300 mb-1.5">Nombre</label>
                        <input id="nombre" {...register('nombre')} className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 text-sm" />
                        {errors.nombre && <p className="text-red-400 text-xs mt-1.5">{errors.nombre.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="descripcion" className="block text-sm font-medium text-zinc-300 mb-1.5">Descripción (Opcional)</label>
                        <textarea id="descripcion" {...register('descripcion')} rows={3} className="flex w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 text-sm" />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 bg-zinc-700 text-zinc-100 hover:bg-zinc-600">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 bg-blue-600 text-white hover:bg-blue-700">
                            {isSubmitting && <Loader2 size={14} className="animate-spin mr-2" />}
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- Componente Principal ---
export default function SeccionesCliente({ initialSecciones, initialCategoriasHuerfanas }: { initialSecciones: SeccionConCategorias[], initialCategoriasHuerfanas: ServicioCategoria[] }) {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSeccion, setEditingSeccion] = useState<Partial<SeccionForm> | null>(null);
    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => setIsMounted(true), []);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const categoriaId = String(active.id);
        const seccionId = String(over.id);

        // Evita hacer la llamada si se suelta en el mismo lugar de origen
        const originSeccion = initialSecciones.find(s => s.seccionCategorias.some(sc => sc.ServicioCategoria.id === categoriaId));
        if (originSeccion?.id === seccionId) return;

        if (seccionId === 'huerfanas-droppable') {
            await desasignarCategoria(categoriaId);
            toast.success(`Categoría desasignada.`);
        } else {
            await asignarCategoriaASeccion({ categoriaId, seccionId });
            toast.success(`Categoría asignada.`);
        }
        router.refresh();
    };

    const openModalForCreate = () => {
        setEditingSeccion({});
        setIsModalOpen(true);
    };

    const openModalForEdit = (seccion: SeccionConCategorias) => {
        setEditingSeccion({
            id: seccion.id,
            nombre: seccion.nombre,
            descripcion: seccion.descripcion ?? undefined,
        });
        setIsModalOpen(true);
    };

    // Renderiza un esqueleto de carga en el servidor y antes de la hidratación
    if (!isMounted) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
                <div className="lg:col-span-2 space-y-6">
                    {initialSecciones.map(seccion => (
                        <div key={seccion.id} className="h-32 bg-zinc-900 rounded-lg"></div>
                    ))}
                    <div className="h-12 bg-zinc-900 rounded-lg"></div>
                </div>
                <div className="lg:col-span-1">
                    <div className="h-64 bg-zinc-900 rounded-lg"></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {initialSecciones.map(seccion => (
                            <DroppableSection key={seccion.id} id={seccion.id} title={seccion.nombre} onEdit={() => openModalForEdit(seccion)}>
                                {seccion.seccionCategorias.length > 0 ? (
                                    seccion.seccionCategorias.map(sc => (
                                        <DraggableCategory key={sc.ServicioCategoria.id} categoria={sc.ServicioCategoria} />
                                    ))
                                ) : <p className="text-xs text-zinc-500">Arrastra una categoría aquí.</p>}
                            </DroppableSection>
                        ))}
                        <button onClick={openModalForCreate} className="w-full p-4 rounded-lg border border-dashed border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300 transition-colors">
                            + Crear Nueva Sección
                        </button>
                    </div>

                    <div className="lg:col-span-1">
                        <DroppableSection id="huerfanas-droppable" title="Categorías Sin Asignar">
                            {initialCategoriasHuerfanas.length > 0 ? (
                                initialCategoriasHuerfanas.map(cat => (
                                    <DraggableCategory key={cat.id} categoria={cat} />
                                ))
                            ) : <p className="text-xs text-zinc-500">¡Todo organizado!</p>}
                        </DroppableSection>
                    </div>
                </div>
            </DndContext>
            {isModalOpen && <SeccionModal seccion={editingSeccion} onClose={() => setIsModalOpen(false)} onSave={() => { setIsModalOpen(false); router.refresh(); }} />}
        </>
    );
}
