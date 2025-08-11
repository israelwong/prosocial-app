// Ruta: app/admin/configurar/paquetes/components/PaquetesDashboard.tsx

'use client';

import { useState, useEffect } from 'react';
import { type Paquete, type EventoTipo } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { crearPaquete, clonarPaquete, actualizarOrdenPaquetes } from '@/app/admin/_lib/actions/paquetes/paquetes.actions';
import toast from 'react-hot-toast';
import { Pencil, Copy, GripVertical, Loader2 } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Grupo = EventoTipo & { Paquete: Paquete[] };

interface Props {
    initialGrupos: Grupo[];
    tiposEvento: EventoTipo[];
}

// Componente para una fila de paquete que se puede arrastrar
function SortablePackageRow({ paquete, onClone }: { paquete: Paquete, onClone: () => void }) {
    const router = useRouter();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: paquete.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <tr ref={setNodeRef} style={style} className="text-zinc-300 hover:bg-zinc-700/50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center gap-3">
                    <span {...attributes} {...listeners} className="cursor-grab touch-none text-zinc-500">
                        <GripVertical size={16} />
                    </span>
                    {paquete.nombre}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                {paquete.precio != null
                    ? paquete.precio.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
                    : <span className="text-zinc-500">N/A</span>
                }
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{paquete.costo?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{paquete.gasto?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-green-400">{paquete.utilidad?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                <div className="flex gap-4 justify-center">
                    <button onClick={() => router.push(`/admin/configurar/paquetes/${paquete.id}`)} className="hover:text-white"><Pencil size={16} /></button>
                    <button onClick={onClone} className="hover:text-white"><Copy size={16} /></button>
                </div>
            </td>
        </tr>
    );
}

// Componente para la tabla de un grupo de paquetes
function PaqueteGroupTable({ grupo, onClone }: { grupo: Grupo, onClone: (id: string) => void }) {
    const [paquetes, setPaquetes] = useState(grupo.Paquete);
    const [isSaving, setIsSaving] = useState(false);
    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => {
        setPaquetes(grupo.Paquete);
    }, [grupo.Paquete]);

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = paquetes.findIndex((p) => p.id === active.id);
            const newIndex = paquetes.findIndex((p) => p.id === over.id);
            const reorderedPaquetes = arrayMove(paquetes, oldIndex, newIndex);
            setPaquetes(reorderedPaquetes);

            setIsSaving(true);
            const updatedPositions = reorderedPaquetes.map((item, index) => ({ id: item.id, posicion: index + 1 }));
            await actualizarOrdenPaquetes(updatedPositions);
            setIsSaving(false);
            toast.success(`Orden de "${grupo.nombre}" guardado.`);
        }
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-3">
                <h2 className="text-lg font-semibold text-zinc-200">{grupo.nombre}</h2>
                {isSaving && <Loader2 size={16} className="animate-spin text-zinc-400" />}
            </div>
            <div className="border border-zinc-700 rounded-lg overflow-hidden">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <table className="min-w-full divide-y divide-zinc-700">
                        <thead className="bg-zinc-900/50">
                            <tr className="text-zinc-400 text-xs uppercase">
                                <th className="px-6 py-3 text-left font-medium">Nombre</th>
                                <th className="px-6 py-3 text-center font-medium">Precio</th>
                                <th className="px-6 py-3 text-center font-medium">Costo</th>
                                <th className="px-6 py-3 text-center font-medium">Gasto</th>
                                <th className="px-6 py-3 text-center font-medium">Utilidad</th>
                                <th className="px-6 py-3 text-center font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <SortableContext items={paquetes.map(p => p.id)} strategy={verticalListSortingStrategy}>
                            <tbody>
                                {paquetes.map(paquete => (
                                    <SortablePackageRow key={paquete.id} paquete={paquete} onClone={() => onClone(paquete.id)} />
                                ))}
                            </tbody>
                        </SortableContext>
                    </table>
                </DndContext>
                {paquetes.length === 0 && (
                    <p className="text-center text-zinc-500 py-6">No hay paquetes para este tipo de evento.</p>
                )}
            </div>
        </div>
    )
}

// Componente principal
export default function PaquetesDashboard({ initialGrupos, tiposEvento }: Props) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nombrePaquete, setNombrePaquete] = useState('');
    const [tipoEventoSeleccionado, setTipoEventoSeleccionado] = useState<string>(tiposEvento[0]?.id || '');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => setIsMounted(true), []);

    const handleCreatePackage = async () => {
        if (!nombrePaquete || !tipoEventoSeleccionado) {
            return toast.error("Nombre y tipo de evento son requeridos.");
        }
        toast.loading("Creando paquete...");
        // La redirección se maneja en la server action
        await crearPaquete({ nombre: nombrePaquete, eventoTipoId: tipoEventoSeleccionado, precio: "0", status: 'active' });
    };

    const handleClone = async (id: string) => {
        toast.loading("Clonando paquete...");
        await clonarPaquete(id);
        toast.dismiss();
        toast.success("Paquete clonado.");
        router.refresh();
    }

    if (!isMounted) {
        return null; // O un esqueleto de carga para evitar hydration mismatch
    }

    return (
        <div>
            <div className='flex justify-between items-center mb-6 pb-4 border-b border-zinc-700'>
                <h1 className="text-2xl font-semibold text-zinc-100">Paquetes de Servicios</h1>
                <button onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">
                    Crear Paquete
                </button>
            </div>

            <div className="space-y-8">
                {initialGrupos.map(grupo => (
                    <PaqueteGroupTable key={grupo.id} grupo={grupo} onClone={handleClone} />
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-zinc-900 p-6 rounded-lg w-full max-w-md space-y-4 border border-zinc-700">
                        <h2 className="text-lg font-medium text-white">Nuevo Paquete</h2>
                        <div>
                            <label htmlFor="nombrePaqueteModal" className="block text-sm font-medium text-zinc-300 mb-1.5">Nombre del Paquete</label>
                            <input id="nombrePaqueteModal" type="text" value={nombrePaquete} onChange={(e) => setNombrePaquete(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100" />
                        </div>
                        <div>
                            <label htmlFor="tipoEventoModal" className="block text-sm font-medium text-zinc-300 mb-1.5">Tipo de Evento</label>
                            <select id="tipoEventoModal" value={tipoEventoSeleccionado} onChange={(e) => setTipoEventoSeleccionado(e.target.value)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100">
                                {tiposEvento.map(tipo => <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end gap-4 pt-4">
                            <button onClick={() => setIsModalOpen(false)} className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 bg-zinc-700 text-zinc-100 hover:bg-zinc-600">Cancelar</button>
                            <button onClick={handleCreatePackage} className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 bg-blue-600 text-white hover:bg-blue-700">Crear y Editar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
