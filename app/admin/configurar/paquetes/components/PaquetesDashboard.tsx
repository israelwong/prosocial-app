// Ruta: app/admin/configurar/paquetes/components/PaquetesDashboard.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import { type Paquete, type EventoTipo, type Configuracion } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { crearPaquete, clonarPaquete, actualizarOrdenPaquetes } from '@/app/admin/_lib/actions/paquetes/paquetes.actions';
import { calcularPaquete, type ServicioCantidad } from '@/app/admin/_lib/pricing/calculos';
import toast from 'react-hot-toast';
import { Pencil, Copy, GripVertical, Loader2 } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type PaqueteConServicios = Paquete & {
    PaqueteServicio: {
        servicioId: string;
        cantidad: number;
        Servicio: {
            costo: number;
            gasto: number;
            utilidad: number;
            precio_publico: number;
        }
    }[]
};

type Grupo = EventoTipo & { Paquete: PaqueteConServicios[] };

interface Props {
    initialGrupos: Grupo[];
    tiposEvento: EventoTipo[];
    configuracion: Configuracion | null;
}

// Componente para una fila de paquete que se puede arrastrar
function SortablePackageRow({ paquete, configuracion, onClone }: { paquete: PaqueteConServicios, configuracion: Configuracion | null, onClone: () => void }) {
    const router = useRouter();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: paquete.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    // Calcular utilidad neta usando la misma lógica que PaqueteForm
    const utilidadCalculada = useMemo(() => {
        if (!paquete.PaqueteServicio?.length || !configuracion) return 0;

        const serviciosCantidad: ServicioCantidad[] = paquete.PaqueteServicio.map(ps => ({
            costo: Number(ps.Servicio.costo) || 0,
            gasto: Number(ps.Servicio.gasto) || 0,
            utilidad: Number(ps.Servicio.utilidad) || 0,
            precio_publico: Number(ps.Servicio.precio_publico) || 0,
            cantidad: ps.cantidad,
            tipo_utilidad: 'servicio' as const
        }));

        const resultado = calcularPaquete({
            servicios: serviciosCantidad,
            configuracion,
            precioVenta: paquete.precio || 0,
            usarSumaPreciosServicio: true
        });

        // Debug para entender valores negativos
        if (resultado.gananciaNeta < 0) {
            console.log(`Paquete ${paquete.nombre}:`, {
                precioVenta: paquete.precio,
                totalCosto: resultado.totales.totalCosto,
                totalGasto: resultado.totales.totalGasto,
                comisionVenta: resultado.comisionVenta,
                sobreprecio: resultado.sobreprecio,
                gananciaNeta: resultado.gananciaNeta,
                servicios: serviciosCantidad
            });
        }

        return resultado.gananciaNeta;
    }, [paquete, configuracion]);

    const formatDate = (d?: Date | string | null) => {
        if (!d) return <span className="text-zinc-500">—</span>;
        const dateObj = typeof d === 'string' ? new Date(d) : d;
        if (isNaN(dateObj.getTime())) return <span className="text-zinc-500">—</span>;
        return dateObj.toLocaleDateString('es-MX', { year: '2-digit', month: '2-digit', day: '2-digit' });
    };

    return (
        <tr ref={setNodeRef} style={style} className="text-zinc-300 hover:bg-zinc-700/50">
            <td className="px-3 md:px-4 py-2 md:py-3 whitespace-nowrap text-sm font-medium align-top">
                <div className="flex items-start gap-2 md:gap-2">
                    <span {...attributes} {...listeners} className="cursor-grab touch-none text-zinc-500 mt-0.5 md:mt-0">
                        <GripVertical size={14} />
                    </span>
                    <div className="min-w-0">
                        <button type="button" onClick={() => router.push(`/admin/configurar/paquetes/${paquete.id}`)} className="text-left hover:text-white line-clamp-1 max-w-[160px] md:max-w-none font-medium">
                            {paquete.nombre}
                        </button>
                        {/* Meta compacta solo móvil */}
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-zinc-500 md:hidden">
                            <span>Creado: {formatDate((paquete as any).createdAt)}</span>
                            <span>Act: {formatDate((paquete as any).updatedAt)}</span>
                            <span className={`${utilidadCalculada < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                {utilidadCalculada.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                            </span>
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-3 md:px-4 py-2 md:py-3 whitespace-nowrap text-sm text-right md:text-center align-middle">
                {paquete.precio != null ? paquete.precio.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) : <span className="text-zinc-500">N/A</span>}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-xs text-center text-zinc-400 hidden md:table-cell align-middle">{formatDate((paquete as any).createdAt)}</td>
            <td className="px-4 py-3 whitespace-nowrap text-xs text-center text-zinc-400 hidden md:table-cell align-middle">{formatDate((paquete as any).updatedAt)}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-medium hidden md:table-cell align-middle">
                <span className={utilidadCalculada < 0 ? 'text-red-400' : 'text-green-400'}>
                    {utilidadCalculada.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                </span>
            </td>
            <td className="px-3 md:px-4 py-2 md:py-3 whitespace-nowrap text-sm text-right md:text-center align-middle">
                <div className="flex gap-2 md:gap-3 justify-end md:justify-center">
                    <button onClick={() => router.push(`/admin/configurar/paquetes/${paquete.id}`)} className="hover:text-white" aria-label="Editar paquete"><Pencil size={15} /></button>
                    <button onClick={onClone} className="hover:text-white" aria-label="Clonar paquete"><Copy size={15} /></button>
                </div>
            </td>
        </tr>
    );
}

// Componente para la tabla de un grupo de paquetes
function PaqueteGroupTable({ grupo, configuracion, onClone }: { grupo: Grupo, configuracion: Configuracion | null, onClone: (id: string) => void }) {
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
                    <div className="overflow-x-auto">
                        <table className="min-w-[760px] md:min-w-full w-full divide-y divide-zinc-700">
                            <thead className="bg-zinc-900/60 hidden md:table-header-group">
                                <tr className="text-zinc-400 text-[11px] uppercase tracking-wide">
                                    <th className="px-4 py-2 text-left font-medium w-1/3">Nombre</th>
                                    <th className="px-4 py-2 text-center font-medium">Precio</th>
                                    <th className="px-4 py-2 text-center font-medium">Creado</th>
                                    <th className="px-4 py-2 text-center font-medium">Actualizado</th>
                                    <th className="px-4 py-2 text-center font-medium">Utilidad</th>
                                    <th className="px-4 py-2 text-center font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <SortableContext items={paquetes.map(p => p.id)} strategy={verticalListSortingStrategy}>
                                <tbody className="divide-y divide-zinc-800">
                                    {paquetes.map(paquete => (
                                        <SortablePackageRow key={paquete.id} paquete={paquete} configuracion={configuracion} onClone={() => onClone(paquete.id)} />
                                    ))}
                                </tbody>
                            </SortableContext>
                        </table>
                    </div>
                </DndContext>
                {paquetes.length === 0 && (
                    <p className="text-center text-zinc-500 py-6">No hay paquetes para este tipo de evento.</p>
                )}
            </div>
        </div>
    )
}

// Componente principal
export default function PaquetesDashboard({ initialGrupos, tiposEvento, configuracion }: Props) {
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
                    <PaqueteGroupTable key={grupo.id} grupo={grupo} configuracion={configuracion} onClone={handleClone} />
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
