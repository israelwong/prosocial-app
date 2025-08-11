'use client';

import { type Servicio, type ServicioCategoria } from '@prisma/client';
import { GripVertical, Pencil, Plus } from 'lucide-react';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ServicioCard } from './ServicioCard';

type ServicioItemData = Servicio & { precio_publico: number | null };
export type CategoriaItemData = ServicioCategoria & { servicios: ServicioItemData[]; seccionId: string };

interface Props {
    categoria: CategoriaItemData;
    onEdit: () => void;
    isOrdering: boolean; // Para ocultar los hijos
}

export function CategoriaCard({ categoria, onEdit, isOrdering }: Props) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: categoria.id,
        data: { type: 'categoria', parentId: categoria.seccionId, item: categoria },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="w-full">
            <div className="p-3 rounded-md bg-zinc-800/70 border border-zinc-700/80 w-full">
                <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <button {...attributes} {...listeners} className="cursor-grab text-zinc-400"><GripVertical size={18} /></button>
                        <h3 className="font-semibold text-zinc-200 truncate">{categoria.nombre}</h3>
                        <button onClick={onEdit} className="text-zinc-500 hover:text-white"><Pencil size={12} /></button>
                    </div>
                    <button className="text-xs text-blue-400 flex items-center gap-1 hover:text-blue-300"><Plus size={14} /> Servicio</button>
                </div>

                {!isOrdering && (
                    <SortableContext items={categoria.servicios.map(s => s.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2 ml-4">
                            {categoria.servicios.map(servicio => <ServicioCard key={servicio.id} servicio={servicio} />)}
                            {categoria.servicios.length === 0 && <div className="text-xs text-zinc-500 px-2 h-8 flex items-center">Sin servicios.</div>}
                        </div>
                    </SortableContext>
                )}
            </div>
        </div>
    );
}
