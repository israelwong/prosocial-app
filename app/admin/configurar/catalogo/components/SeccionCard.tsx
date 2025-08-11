'use client';

import { type Servicio, type ServicioCategoria, type ServicioSeccion } from '@prisma/client';
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CategoriaCard, CategoriaItemData } from './CategoriaCard';

type ServicioItemData = Servicio & { precio_publico: number | null };
export type SeccionItemData = ServicioSeccion & { categorias: (ServicioCategoria & { servicios: ServicioItemData[] })[] };

interface Props {
    seccion: SeccionItemData;
    onEdit: () => void;
    onAddCategoria: () => void;
    onEditCategoria: (categoria: CategoriaItemData) => void;
    onDelete: () => void;
    isOrdering: boolean;
    isCategoryOrdering: boolean; // Agregada esta propiedad
}

export function SeccionCard({ seccion, onEdit, onAddCategoria, onEditCategoria, onDelete, isOrdering, isCategoryOrdering }: Props) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: seccion.id,
        data: { type: 'seccion', parentId: null, item: seccion },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="w-full">
            <div className="p-4 rounded-lg bg-zinc-900/70 border border-zinc-800 w-full">
                <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <button {...attributes} {...listeners} className="cursor-grab text-zinc-400">
                            <GripVertical size={20} />
                        </button>
                        <div className="truncate">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-zinc-100 truncate">{seccion.nombre}</h2>
                                <button onClick={onEdit} className="text-zinc-500 hover:text-white">
                                    <Pencil size={14} />
                                </button>
                                <button onClick={onDelete} className="text-red-500 hover:text-red-400">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            {seccion.descripcion && <p className="text-sm text-zinc-400 truncate">{seccion.descripcion}</p>}
                        </div>
                    </div>
                    <button onClick={onAddCategoria} className="text-sm text-green-400 flex items-center gap-1 hover:text-green-300">
                        <Plus size={16} /> Categoría
                    </button>
                </div>

                {!isOrdering && (
                    <SortableContext items={seccion.categorias.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-4 ml-4">
                            {seccion.categorias.map(categoria => (
                                <CategoriaCard
                                    key={categoria.id}
                                    categoria={{ ...categoria, seccionId: seccion.id }}
                                    onEdit={() => onEditCategoria({ ...categoria, seccionId: seccion.id })}
                                    isOrdering={isDragging}
                                // isCategoryOrdering={isCategoryOrdering} // Pasamos la nueva propiedad
                                />
                            ))}
                            {seccion.categorias.length === 0 && (
                                <div className="text-sm text-zinc-500 px-2 h-10 flex items-center">Sin categorías.</div>
                            )}
                        </div>
                    </SortableContext>
                )}
            </div>
        </div>
    );
}