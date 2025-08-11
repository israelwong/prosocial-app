// Ruta: app/admin/configurar/catalogo/components/OrganizadorCatalogo.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    closestCorners,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import { Plus, GripVertical, Pencil, Copy, Loader2 } from 'lucide-react';

import { type ServicioSeccion, type ServicioCategoria, type Servicio } from '@prisma/client';
import { actualizarPosicionCatalogo } from '@/app/admin/_lib/actions/catalogo/catalogo.actions';
import { duplicarServicio } from '@/app/admin/_lib/actions/servicios/servicios.actions';

// --- TIPOS DE DATOS ---
// Estos tipos deben coincidir con la estructura de datos que recibe el componente.
// Asumo que el `initialCatalogo` viene de una query con includes anidados.
type ServicioItemData = Servicio;
type CategoriaItemData = ServicioCategoria & { servicios: ServicioItemData[] };
type SeccionItemData = ServicioSeccion & { categorias: CategoriaItemData[] };
type CatalogoData = SeccionItemData[];
type ItemType = 'seccion' | 'categoria' | 'servicio';
type DndItemInfo = { id: string; type: ItemType; data: SeccionItemData | CategoriaItemData | ServicioItemData, parentId: string | null };

interface Props {
    // Ajustamos el tipo para que coincida con la estructura de `obtenerCatalogoCompleto`
    initialCatalogo: (ServicioSeccion & {
        seccionCategorias: ({
            ServicioCategoria: ServicioCategoria & {
                Servicio: Servicio[];
            };
        })[];
    })[];
}


// --- SUB-COMPONENTES DE RENDERIZADO (Sin cambios significativos) ---
function ServicioItem({ servicio }: { servicio: ServicioItemData }) {
    const router = useRouter();
    const [isCloning, setIsCloning] = useState(false);

    const handleClone = async () => {
        setIsCloning(true);
        const toastId = toast.loading('Clonando servicio...');
        try {
            await duplicarServicio(servicio.id);
            toast.success('Servicio clonado exitosamente.', { id: toastId });
            router.refresh();
        } catch (error) {
            toast.error('Error al clonar el servicio.', { id: toastId });
        } finally {
            setIsCloning(false);
        }
    };

    return (
        <div className="flex items-center justify-between text-sm w-full p-2 bg-zinc-800 border border-zinc-700/50 rounded-md">
            <div className="flex items-center gap-2 overflow-hidden">
                <GripVertical size={16} className="text-zinc-500 flex-shrink-0" />
                <span className="text-zinc-300 truncate">{servicio.nombre}</span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs text-zinc-400">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(servicio.precio_publico || 0)}</span>
                <button onClick={() => router.push(`/admin/configurar/servicios/${servicio.id}`)} className="text-zinc-400 hover:text-white transition-colors" aria-label={`Editar ${servicio.nombre}`}><Pencil size={14} /></button>
                <button onClick={handleClone} disabled={isCloning} className="text-zinc-400 hover:text-white transition-colors disabled:opacity-50" aria-label={`Clonar ${servicio.nombre}`}>
                    {isCloning ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
                </button>
            </div>
        </div>
    );
}

function CategoriaItem({ categoria, onAddServicio, onEditCategoria }: { categoria: CategoriaItemData, onAddServicio: () => void, onEditCategoria: () => void }) {
    return (
        <div className="p-3 rounded-md bg-zinc-800/70 border border-zinc-700/80 w-full">
            <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 overflow-hidden">
                    <GripVertical size={18} className="text-zinc-400 flex-shrink-0" />
                    <h3 className="font-semibold text-zinc-200 truncate">{categoria.nombre}</h3>
                    <button onClick={onEditCategoria} className="text-zinc-500 hover:text-white transition-colors"><Pencil size={12} /></button>
                </div>
                <button onClick={onAddServicio} className="text-xs text-blue-400 flex items-center gap-1 hover:text-blue-300 transition-colors flex-shrink-0">
                    <Plus size={14} /> Agregar Servicio
                </button>
            </div>
            <SortableContext items={categoria.servicios.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2 ml-4">
                    {categoria.servicios.map(servicio => (
                        <SortableItem key={servicio.id} id={servicio.id} type="servicio" parentId={categoria.id} data={servicio}>
                            <ServicioItem servicio={servicio} />
                        </SortableItem>
                    ))}
                    {categoria.servicios.length === 0 && <div className="text-xs text-zinc-500 px-2 h-8 flex items-center">No hay servicios aquí.</div>}
                </div>
            </SortableContext>
        </div>
    );
}

function SeccionItem({ seccion, onAddCategoria, onEditSeccion }: { seccion: SeccionItemData, onAddCategoria: () => void, onEditSeccion: () => void }) {
    return (
        <div className="p-4 rounded-lg bg-zinc-900/70 border border-zinc-800 w-full">
            <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2 overflow-hidden">
                    <GripVertical size={20} className="text-zinc-400 flex-shrink-0" />
                    <div className="truncate">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-zinc-100 truncate">{seccion.nombre}</h2>
                            <button onClick={onEditSeccion} className="text-zinc-500 hover:text-white transition-colors"><Pencil size={14} /></button>
                        </div>
                        {seccion.descripcion && <p className="text-sm text-zinc-400 truncate">{seccion.descripcion}</p>}
                    </div>
                </div>
                <button onClick={onAddCategoria} className="text-sm text-green-400 flex items-center gap-1 hover:text-green-300 transition-colors flex-shrink-0">
                    <Plus size={16} /> Agregar Categoría
                </button>
            </div>
            <SortableContext items={seccion.categorias.map(c => c.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4 ml-4">
                    {seccion.categorias.map(categoria => (
                        <SortableItem key={categoria.id} id={categoria.id} type="categoria" parentId={seccion.id} data={categoria}>
                            <CategoriaItem categoria={categoria} onAddServicio={() => {/* Lógica modal */ }} onEditCategoria={() => {/* Lógica modal */ }} />
                        </SortableItem>
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}


// --- COMPONENTE DRAGGABLE GENÉRICO ---
function SortableItem({ id, type, parentId, data, children }: { id: string, type: ItemType, parentId: string | null, data: any, children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
        data: { type, parentId, item: data }, // Adjuntamos data para usarla en los eventos
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1, // El "fantasma" que queda atrás
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex items-center w-full">
            {children}
        </div>
    );
}


// --- COMPONENTE PRINCIPAL ---
export default function OrganizadorCatalogo({ initialCatalogo }: Props) {
    const [catalogo, setCatalogo] = useState<CatalogoData>(() => {
        // Adaptar la estructura de datos inicial a la que usa nuestro estado
        return initialCatalogo.map(seccion => ({
            ...seccion,
            categorias: seccion.seccionCategorias.map(sc => ({
                ...sc.ServicioCategoria,
                servicios: sc.ServicioCategoria.Servicio || []
            }))
        }));
    });

    const [activeItem, setActiveItem] = useState<DndItemInfo | null>(null);
    const [itemWidth, setItemWidth] = useState<number | null>(null); // **FIX DISEÑO**
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const itemsMap = useMemo(() => {
        const map = new Map<string, DndItemInfo>();
        catalogo.forEach(seccion => {
            map.set(seccion.id, { id: seccion.id, type: 'seccion', data: seccion, parentId: null });
            seccion.categorias.forEach(categoria => {
                map.set(categoria.id, { id: categoria.id, type: 'categoria', data: categoria, parentId: seccion.id });
                categoria.servicios.forEach(servicio => {
                    map.set(servicio.id, { id: servicio.id, type: 'servicio', data: servicio, parentId: categoria.id });
                });
            });
        });
        return map;
    }, [catalogo]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveItem(itemsMap.get(String(active.id)) || null);
        // **FIX DISEÑO**: Capturar el ancho del elemento
        if (event.active.rect.current.initial) {
            setItemWidth(event.active.rect.current.initial.width);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveItem(null);
        setItemWidth(null);
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const activeItemInfo = itemsMap.get(String(active.id));
        const overItemInfo = itemsMap.get(String(over.id));

        if (!activeItemInfo) return;

        // **FIX ERRORES**: VALIDACIÓN DE MOVIMIENTO
        const targetParentInfo = overItemInfo?.type === 'seccion' || overItemInfo?.type === 'categoria' ? overItemInfo : itemsMap.get(overItemInfo?.parentId!);
        const targetParentType = targetParentInfo?.type || 'root';

        const isValidMove = (dragType: ItemType, dropZoneType: string) => {
            if (dragType === 'servicio' && dropZoneType === 'categoria') return true;
            if (dragType === 'categoria' && dropZoneType === 'seccion') return true;
            if (dragType === 'seccion' && dropZoneType === 'root') return true;
            return false;
        };

        // Permite reordenar dentro del mismo padre, pero valida si se cambia de padre
        if (activeItemInfo.parentId !== targetParentInfo?.id && !isValidMove(activeItemInfo.type, targetParentType)) {
            toast.error(`No se puede mover un ${activeItemInfo.type} a un ${targetParentType}.`);
            return;
        }

        // --- Lógica de UI Optimista (con cálculo de destino mejorado) ---
        const originalCatalogo = JSON.parse(JSON.stringify(catalogo));
        const movedItem = originalCatalogo.flatMap((s: any) => [s, ...s.categorias, ...s.categorias.flatMap((c: any) => c.servicios)]).find((i: any) => i.id === active.id);

        // 1. Quitar el ítem de su lugar original
        const sourceParent = activeItemInfo.parentId ? originalCatalogo.flatMap((s: any) => [s, ...s.categorias]).find((p: any) => p.id === activeItemInfo.parentId) : null;
        if (sourceParent) {
            const sourceList = sourceParent.categorias ? sourceParent.categorias : sourceParent.servicios;
            const itemIndex = sourceList.findIndex((i: any) => i.id === active.id);
            if (itemIndex > -1) sourceList.splice(itemIndex, 1);
        } else { // es una sección
            const itemIndex = originalCatalogo.findIndex((s: any) => s.id === active.id);
            if (itemIndex > -1) originalCatalogo.splice(itemIndex, 1);
        }

        // 2. Calcular el nuevo padre y la nueva posición
        let newParentId: string | null;
        let destList;
        let newIndex;

        if (overItemInfo && (overItemInfo.type === 'seccion' || overItemInfo.type === 'categoria')) {
            // Soltado directamente sobre un contenedor
            newParentId = overItemInfo.id;
            const destParent = originalCatalogo.flatMap((s: any) => [s, ...s.categorias]).find((p: any) => p.id === newParentId);
            destList = destParent.categorias ? destParent.categorias : destParent.servicios;
            newIndex = destList.length; // al final
        } else {
            // Soltado sobre otro item
            newParentId = overItemInfo!.parentId;
            if (newParentId) {
                const destParent = originalCatalogo.flatMap((s: any) => [s, ...s.categorias]).find((p: any) => p.id === newParentId);
                destList = destParent.categorias ? destParent.categorias : destParent.servicios;
                newIndex = destList.findIndex((i: any) => i.id === over.id);
            } else { // Moviendo secciones
                destList = originalCatalogo;
                newIndex = destList.findIndex((i: any) => i.id === over.id);
            }
        }
        if (newIndex === -1) newIndex = 0; // fallback

        // 3. Insertar en el nuevo lugar
        destList.splice(newIndex, 0, movedItem);
        setCatalogo(originalCatalogo);

        // --- FIN UI OPTIMISTA ---

        setIsSaving(true);
        const toastId = toast.loading("Guardando cambios...");

        try {
            await actualizarPosicionCatalogo({
                itemId: String(active.id),
                itemType: activeItemInfo.type,
                newParentId: String(newParentId),
                newIndex: newIndex,
            });
            toast.success("Catálogo actualizado.", { id: toastId });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "No se pudo actualizar.", { id: toastId });
            setCatalogo(JSON.parse(JSON.stringify(catalogo))); // Revertir al estado anterior
        } finally {
            setIsSaving(false);
            router.refresh(); // Refrescar para asegurar sincronización total con el servidor
        }
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="space-y-6">
                <div className="flex justify-between items-center h-8">
                    <h2 className="text-zinc-300 font-medium">Estructura del Catálogo</h2>
                    {isSaving && <div className="flex items-center gap-2 text-sm text-zinc-400"><Loader2 size={16} className="animate-spin" /> Guardando...</div>}
                </div>
                <SortableContext items={catalogo.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    {catalogo.map(seccion => (
                        <SortableItem key={seccion.id} id={seccion.id} type="seccion" parentId={null} data={seccion}>
                            <SeccionItem seccion={seccion} onAddCategoria={() => {/* Lógica modal */ }} onEditSeccion={() => {/* Lógica modal */ }} />
                        </SortableItem>
                    ))}
                </SortableContext>
                <button className="w-full p-4 rounded-lg border-2 border-dashed border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-center gap-2">
                    <Plus size={16} /> Crear Nueva Sección
                </button>
            </div>
            <DragOverlay>
                {activeItem ? (
                    <div className="shadow-lg" style={{ width: itemWidth || 'auto' }}>
                        {activeItem.type === 'seccion' && <SeccionItem seccion={activeItem.data as SeccionItemData} onAddCategoria={() => { }} onEditSeccion={() => { }} />}
                        {activeItem.type === 'categoria' && <CategoriaItem categoria={activeItem.data as CategoriaItemData} onAddServicio={() => { }} onEditCategoria={() => { }} />}
                        {activeItem.type === 'servicio' && <ServicioItem servicio={activeItem.data as ServicioItemData} />}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}