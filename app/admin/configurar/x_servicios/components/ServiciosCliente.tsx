// Ruta: app/admin/configurar/servicios/components/ServiciosCliente.tsx

'use client';

import { useState, useMemo, useEffect } from 'react';
import { type Servicio, type ServicioCategoria } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { Pencil, Copy, Eye, EyeOff, GripVertical, Loader2 } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { actualizarPosicionServicio, duplicarServicio, actualizarVisibilidadCliente } from '@/app/admin/_lib/actions/servicios/servicios.actions';
import toast from 'react-hot-toast';

type CategoriaConServicios = ServicioCategoria & {
    Servicio: Servicio[];
};

interface Props {
    initialData: CategoriaConServicios[];
}

function SortableServiceRow({ servicio, onDuplicate, onToggleVisibility }: { servicio: Servicio, onDuplicate: () => void, onToggleVisibility: () => void }) {
    const router = useRouter();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: servicio.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <tr ref={setNodeRef} style={style} className="odd:bg-zinc-800 even:bg-zinc-900/50 hover:bg-zinc-700/50 text-zinc-300">
            <td className="p-3 text-wrap max-w-xs pr-5">
                <div className="flex items-center gap-3">
                    <span {...attributes} {...listeners} className="cursor-grab touch-none text-zinc-500">
                        <GripVertical size={16} />
                    </span>
                    <span
                        onClick={() => router.push(`/admin/configurar/servicios/${servicio.id}`)}
                        className="hover:underline cursor-pointer"
                    >
                        {servicio.nombre}
                    </span>
                    <p className="text-xs text-zinc-500 ml-2">
                        {servicio.updatedAt
                            ? `Actualizado: ${new Date(servicio.updatedAt).toLocaleDateString('es-MX', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}`
                            : ''}
                    </p>
                </div>
            </td>
            <td className="p-3 truncate text-center">{servicio.precio_publico.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
            <td className="p-3 truncate text-center">{servicio.costo.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
            <td className="p-3 truncate text-center">{servicio.gasto.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
            <td className="p-3 truncate text-center font-medium text-green-400">{servicio.utilidad.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
            <td className="p-3">
                <div className="flex gap-3 justify-center items-center">
                    <button onClick={onToggleVisibility} className="hover:text-white">
                        {servicio.visible_cliente ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    {/* <button onClick={() => router.push(`/admin/configurar/servicios/${servicio.id}`)} className="hover:text-white">
                        <Pencil size={16} />
                    </button> */}
                    <button onClick={onDuplicate} className="hover:text-white">
                        <Copy size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
}

function CategoriaTable({ categoria, searchTerm }: { categoria: CategoriaConServicios, searchTerm: string }) {
    const router = useRouter();
    const [servicios, setServicios] = useState(categoria.Servicio);
    const [isSaving, setIsSaving] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setServicios(categoria.Servicio);
    }, [categoria.Servicio]);

    const filteredServicios = useMemo(() => {
        return servicios.filter(servicio => servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [servicios, searchTerm]);

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = servicios.findIndex((s) => s.id === active.id);
            const newIndex = servicios.findIndex((s) => s.id === over.id);
            const reorderedServicios = arrayMove(servicios, oldIndex, newIndex);
            setServicios(reorderedServicios);

            setIsSaving(true);
            const updatedPositions = reorderedServicios.map((item, index) => ({ id: item.id, posicion: index + 1 }));
            await actualizarPosicionServicio(updatedPositions);
            setIsSaving(false);
            toast.success(`Orden de "${categoria.nombre}" guardado.`);
        }
    };

    const handleDuplicate = async (id: string) => {
        await duplicarServicio(id);
        toast.success('Servicio duplicado.');
        router.refresh();
    };

    const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
        await actualizarVisibilidadCliente(id, !currentVisibility);
        toast.success('Visibilidad actualizada.');
        router.refresh();
    };

    return (
        <div key={categoria.id}>
            <div className="flex items-center gap-3 mb-3">
                <h2 className="text-lg font-semibold text-zinc-200">{categoria.nombre}</h2>
                {isSaving && <Loader2 size={16} className="animate-spin text-zinc-400" />}
            </div>
            <div className="border border-zinc-700 rounded-lg overflow-hidden">
                {/* SOLUCIÓN: El DndContext ahora envuelve la tabla, que es una estructura válida. */}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <table className="min-w-full bg-zinc-800 text-sm">
                        <thead className="bg-zinc-900/50">
                            <tr className="text-zinc-400">
                                <th className="p-3 text-left font-medium w-1/2">Servicio</th>
                                <th className="p-3 text-center font-medium">Precio Público</th>
                                <th className="p-3 text-center font-medium">Costo</th>
                                <th className="p-3 text-center font-medium">Gasto Fijo</th>
                                <th className="p-3 text-center font-medium">Utilidad Base</th>
                                <th className="p-3 text-center font-medium">Acciones</th>
                            </tr>
                        </thead>
                        {/* SOLUCIÓN: El SortableContext envuelve el tbody, que es su contenedor natural. */}
                        <SortableContext items={servicios.map(s => s.id)} strategy={verticalListSortingStrategy}>
                            <tbody>
                                {isMounted ? filteredServicios.map((servicio) => (
                                    <SortableServiceRow
                                        key={servicio.id}
                                        servicio={servicio}
                                        onDuplicate={() => handleDuplicate(servicio.id)}
                                        onToggleVisibility={() => handleToggleVisibility(servicio.id, servicio.visible_cliente)}
                                    />
                                )) : (
                                    // Renderizamos filas no interactivas en el servidor para evitar el mismatch
                                    categoria.Servicio.map(servicio => (
                                        <tr key={servicio.id} className="odd:bg-zinc-800 even:bg-zinc-900/50 text-zinc-300">
                                            <td className="p-3 text-wrap max-w-xs pr-5">{servicio.nombre}</td>
                                            <td className="p-3 truncate text-center">{servicio.precio_publico.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
                                            <td className="p-3 truncate text-center">{servicio.costo.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
                                            <td className="p-3 truncate text-center">{servicio.gasto.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
                                            <td className="p-3 truncate text-center font-medium text-green-400">{servicio.utilidad.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
                                            <td className="p-3">
                                                <div className="flex gap-3 justify-center items-center opacity-50">
                                                    <Eye size={16} />
                                                    <Pencil size={16} />
                                                    <Copy size={16} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </SortableContext>
                    </table>
                </DndContext>
                {filteredServicios.length === 0 && (
                    <div className="text-center text-zinc-500 py-10 px-4">
                        No se encontraron servicios para "{categoria.nombre}" con el término de búsqueda actual.
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ServiciosCliente({ initialData }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-8">
            <input
                type="text"
                placeholder="Buscar servicio por nombre en todas las categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
            />
            {initialData.map(categoria => (
                <CategoriaTable key={categoria.id} categoria={categoria} searchTerm={searchTerm} />
            ))}
            {initialData.length === 0 && (
                <p className="text-center text-zinc-500 py-10">
                    No hay categorías de servicios definidas. Ve a la sección "Categorías" para empezar.
                </p>
            )}
        </div>
    );
}
