'use client';

import { type Servicio } from '@prisma/client';
import { GripVertical, Pencil, Copy, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { duplicarServicio } from '@/app/admin/_lib/actions/servicios/servicios.actions';

type ServicioItemData = Servicio & { precio_publico: number | null };

interface Props {
    servicio: ServicioItemData;
}

export function ServicioCard({ servicio }: Props) {
    const router = useRouter();
    const [isCloning, setIsCloning] = useState(false);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: servicio.id,
        data: { type: 'servicio', parentId: servicio.servicioCategoriaId, item: servicio },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    const handleClone = async () => {
        setIsCloning(true);
        const toastId = toast.loading('Clonando...');
        try {
            await duplicarServicio(servicio.id);
            toast.success('Servicio clonado.', { id: toastId });
            router.refresh();
        } catch (error) {
            toast.error('Error al clonar.', { id: toastId });
        } finally {
            setIsCloning(false);
        }
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center w-full">
            <div className="flex items-center justify-between text-sm w-full p-2 bg-zinc-800 border border-zinc-700/50 rounded-md">
                <div className="flex items-center gap-2 overflow-hidden">
                    <button {...attributes} {...listeners} className="cursor-grab text-zinc-500"><GripVertical size={16} /></button>
                    <span className="text-zinc-300 truncate">{servicio.nombre}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-zinc-400">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(servicio.precio_publico || 0)}</span>
                    <button onClick={() => router.push(`/admin/configurar/servicios/${servicio.id}`)} className="text-zinc-400 hover:text-white"><Pencil size={14} /></button>
                    <button onClick={handleClone} disabled={isCloning} className="text-zinc-400 hover:text-white disabled:opacity-50">{isCloning ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}</button>
                </div>
            </div>
        </div>
    );
}
