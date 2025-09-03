'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import { Plus, GripVertical, Pencil, Copy, Loader2, X, Trash2, Eye, EyeOff, DollarSign } from 'lucide-react';
import { z } from 'zod';

import { type ServicioSeccion, type ServicioCategoria, type Servicio } from '@prisma/client';
import { actualizarPosicionCatalogo, upsertSeccion, upsertCategoria, deleteItem } from '@/app/admin/_lib/actions/catalogo/catalogo.actions';
import { SeccionSchema, CategoriaSchema } from '@/app/admin/_lib/actions/catalogo/catalogo.schemas';
import { duplicarServicio } from '@/app/admin/_lib/actions/servicios/servicios.actions';

// --- TIPOS DE DATOS ---
type ServicioItemData = Servicio & { precio_publico: number | null };
type CategoriaItemData = ServicioCategoria & { servicios: ServicioItemData[]; seccionId: string; };
type SeccionItemData = ServicioSeccion & { categorias: CategoriaItemData[]; };
type CatalogoData = SeccionItemData[];
type ItemType = 'seccion' | 'categoria' | 'servicio';
type DndItemInfo = { id: string; type: ItemType; data: SeccionItemData | CategoriaItemData | ServicioItemData, parentId: string | null };
type SeccionFormData = z.infer<typeof SeccionSchema>;
type CategoriaFormData = z.infer<typeof CategoriaSchema>;

interface OrganizadorProps {
    initialCatalogo: SeccionItemData[];
}

// --- SUB-COMPONENTES (DEFINIDOS FUERA DEL COMPONENTE PRINCIPAL) ---

function ServicioCard({ servicio }: { servicio: ServicioItemData }) {
    const router = useRouter();
    const [isCloning, setIsCloning] = useState(false);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: servicio.id, data: { type: 'servicio', parentId: servicio.servicioCategoriaId, item: servicio } });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : 1 };
    const precio = servicio.precio_publico || 0;
    const costo = servicio.costo || 0;
    const fechaActualizacion = servicio.updatedAt ? new Date(servicio.updatedAt).toLocaleString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }) : 'N/A';

    const handleClone = async () => {
        setIsCloning(true);
        const toastId = toast.loading('Clonando...');
        try { await duplicarServicio(servicio.id); toast.success('Servicio clonado.', { id: toastId }); router.refresh(); }
        catch (error) { toast.error('Error al clonar.', { id: toastId }); }
        finally { setIsCloning(false); }
    };
    return (
        <div ref={setNodeRef} style={style} className="flex items-center w-full">
            <div className="flex items-center justify-between text-xs sm:text-sm w-full p-2 bg-zinc-800 border border-zinc-700/50 rounded-md gap-3">
                <div className="flex items-center gap-2 overflow-hidden min-w-0">
                    <button {...attributes} {...listeners} className="cursor-grab text-zinc-500 p-1"><GripVertical size={14} /></button>
                    <div className="flex-1 min-w-0">
                        <div className="text-zinc-300 truncate font-medium" title={servicio.nombre}>{servicio.nombre}</div>
                        <div className="flex items-center gap-3 text-[10px] text-zinc-500 mt-0.5">
                            <span title="Costo">
                                Costo: {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(costo)}
                            </span>
                            <span title="Fecha de actualización">
                                Act: {fechaActualizacion}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-zinc-400" title="Precio Público">
                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(precio)}
                    </span>
                    <span className="text-zinc-400" title={servicio.visible_cliente ? 'Visible al cliente' : 'Oculto al cliente'}>
                        {servicio.visible_cliente ? <Eye size={14} /> : <EyeOff size={14} />}
                    </span>
                    <button onClick={() => router.push(`/admin/configurar/catalogo/servicio/${servicio.id}`)} className="text-zinc-400 hover:text-white" title="Editar">
                        <Pencil size={14} />
                    </button>
                    <button onClick={handleClone} disabled={isCloning} className="text-zinc-400 hover:text-white disabled:opacity-50" title="Duplicar">
                        {isCloning ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
                    </button>
                </div>
            </div>
        </div>
    );
}

function CategoriaCard({ categoria, onEdit, onAddServicio, onDelete, isParentOrdering, isCategoryOrdering }: { categoria: CategoriaItemData; onEdit: () => void; onAddServicio: () => void; onDelete: () => void; isParentOrdering: boolean; isCategoryOrdering: boolean; }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: categoria.id, data: { type: 'categoria', parentId: categoria.seccionId, item: categoria } });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 };
    const hideChildren = isParentOrdering || isCategoryOrdering;
    return (
        <div ref={setNodeRef} style={style} className="w-full"><div className="p-3 rounded-md bg-zinc-800/70 border border-zinc-700/80 w-full"><div className="flex items-center justify-between gap-2 mb-3"><div className="flex items-center gap-2 overflow-hidden"><button {...attributes} {...listeners} className="cursor-grab text-zinc-400 p-1"><GripVertical size={18} /></button><h3 className="font-semibold text-zinc-200 truncate">{categoria.nombre}</h3><button onClick={onEdit} className="text-zinc-500 hover:text-white"><Pencil size={12} /></button>{categoria.servicios.length === 0 && (<button onClick={onDelete} className="text-red-500 hover:text-red-400"><Trash2 size={12} /></button>)}</div><button onClick={onAddServicio} className="text-xs text-blue-400 flex items-center gap-1 hover:text-blue-300"><Plus size={14} /> Servicio</button></div>{!hideChildren && (<SortableContext items={categoria.servicios.map(s => s.id)} strategy={verticalListSortingStrategy}><div className="space-y-2 ml-4">{categoria.servicios.map(servicio => <ServicioCard key={servicio.id} servicio={servicio} />)}{categoria.servicios.length === 0 && <div className="text-xs text-zinc-500 px-2 h-8 flex items-center">Sin servicios.</div>}</div></SortableContext>)}</div></div>
    );
}

function SeccionCard({ seccion, onEdit, onAddCategoria, onEditCategoria, onDelete, onDeleteCategoria, isOrdering, isCategoryOrdering, onAddServicioToCategoria }: { seccion: SeccionItemData; onEdit: () => void; onAddCategoria: () => void; onEditCategoria: (categoria: CategoriaItemData) => void; onDelete: () => void; onDeleteCategoria: (categoriaId: string) => void; isOrdering: boolean; isCategoryOrdering: boolean; onAddServicioToCategoria: (categoriaId: string) => void; }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: seccion.id, data: { type: 'seccion', parentId: null, item: seccion } });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 };
    const hideChildren = isOrdering;
    return (
        <div ref={setNodeRef} style={style} className="w-full">
            <div className="p-4 rounded-lg bg-zinc-900/70 border border-zinc-800 w-full">
                <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <button {...attributes} {...listeners} className="cursor-grab text-zinc-400 p-1"><GripVertical size={20} /></button>
                        <div className="truncate">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-zinc-100 truncate">{seccion.nombre}</h2>
                                <button onClick={onEdit} className="text-zinc-500 hover:text-white"><Pencil size={14} /></button>
                                {seccion.categorias.length === 0 && (
                                    <button onClick={onDelete} className="text-red-500 hover:text-red-400"><Trash2 size={14} /></button>
                                )}
                            </div>
                            {seccion.descripcion && <p className="text-sm text-zinc-400 truncate">{seccion.descripcion}</p>}
                        </div>
                    </div>
                    <button onClick={onAddCategoria} className="text-sm text-green-400 flex items-center gap-1 hover:text-green-300"><Plus size={16} /> Categoría</button>
                </div>
                {!hideChildren && (
                    <SortableContext items={seccion.categorias.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-4 ml-4">
                            {seccion.categorias.map(categoria => (
                                <CategoriaCard
                                    key={categoria.id}
                                    categoria={categoria}
                                    onEdit={() => onEditCategoria(categoria)}
                                    onAddServicio={() => onAddServicioToCategoria(categoria.id)}
                                    onDelete={() => onDeleteCategoria(categoria.id)}
                                    isParentOrdering={isDragging}
                                    isCategoryOrdering={isCategoryOrdering}
                                />
                            ))}
                            {seccion.categorias.length === 0 && <div className="text-sm text-zinc-500 px-2 h-10 flex items-center">Sin categorías.</div>}
                        </div>
                    </SortableContext>
                )}
            </div>
        </div>
    );
}


function ConfirmDeleteModal({ item, onClose, onConfirm }: { item: DndItemInfo | null, onClose: () => void, onConfirm: () => void }) {
    if (!item) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"><div className="bg-zinc-900 p-6 rounded-lg w-full max-w-md border border-zinc-700 relative animate-in fade-in-0 zoom-in-95"><h2 className="text-lg font-medium text-white mb-2">Confirmar Eliminación</h2><p className="text-sm text-zinc-400 mb-6">¿Estás seguro de que quieres eliminar "{item.data.nombre}"? Esta acción no se puede deshacer.</p><div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-zinc-300 hover:bg-zinc-700 transition-colors">Cancelar</button><button onClick={onConfirm} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-500 transition-colors">Eliminar</button></div></div></div>
    );
}

// --- COMPONENTE PRINCIPAL ---
export default function Organizador({ initialCatalogo }: OrganizadorProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [catalogo, setCatalogo] = useState<CatalogoData>(initialCatalogo);
    const [activeDragItem, setActiveDragItem] = useState<DndItemInfo | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    // Sección ahora se edita en rutas dedicadas (/seccion/nueva, /seccion/[id])
    // const [editingSeccion, setEditingSeccion] = useState<Partial<SeccionItemData> | null>(null);
    // Categorías ahora se editan en páginas; ya no se usa estado local de edición
    // const [editingCategoria, setEditingCategoria] = useState<Partial<CategoriaItemData> | null>(null);
    const [deletingItem, setDeletingItem] = useState<DndItemInfo | null>(null);
    const router = useRouter();
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    useEffect(() => { setIsMounted(true); }, []);
    useEffect(() => { setCatalogo(initialCatalogo); }, [initialCatalogo]);

    const itemsMap = useMemo(() => { const map = new Map<string, DndItemInfo>(); catalogo.forEach(seccion => { map.set(seccion.id, { id: seccion.id, type: 'seccion', data: seccion, parentId: null }); seccion.categorias.forEach(categoria => { map.set(categoria.id, { id: categoria.id, type: 'categoria', data: categoria, parentId: seccion.id }); categoria.servicios.forEach(servicio => { map.set(servicio.id, { id: servicio.id, type: 'servicio', data: servicio, parentId: categoria.id }); }); }); }); return map; }, [catalogo]);

    const handleDragStart = (event: DragStartEvent) => { const { active } = event; setActiveDragItem(itemsMap.get(String(active.id)) || null); };

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveDragItem(null);
        const { active, over } = event;
        if (!over) return;
        const activeId = String(active.id);
        const overId = String(over.id);
        if (activeId === overId) return;
        const activeItemInfo = itemsMap.get(activeId);
        const overItemInfo = itemsMap.get(overId);
        if (!activeItemInfo || !overItemInfo) return;

        const isReordering = activeItemInfo.parentId === overItemInfo.parentId;
        let newParentId: string | null;
        let newIndex: number;

        if (isReordering) {
            newParentId = activeItemInfo.parentId;
            let siblings: any[] = [];
            const parentData = newParentId === null ? null : itemsMap.get(newParentId)!.data;
            if (newParentId === null) siblings = catalogo;
            else if ((parentData as SeccionItemData).categorias !== undefined) siblings = (parentData as SeccionItemData).categorias;
            else if ((parentData as CategoriaItemData).servicios !== undefined) siblings = (parentData as CategoriaItemData).servicios;

            const activeIndex = siblings.findIndex(item => item.id === activeItemInfo.id);
            const overIndex = siblings.findIndex(item => item.id === overItemInfo.id);

            // Enviamos overIndex y dejamos que backend ajuste cuando activeIndex < overIndex
            newIndex = overIndex;
        } else {
            const targetIsContainer = overItemInfo.type === 'seccion' || overItemInfo.type === 'categoria';
            const targetParentType = targetIsContainer ? overItemInfo.type : itemsMap.get(overItemInfo.parentId!)?.type || 'root';

            const isValidMove = (dragType: ItemType, dropZoneType: string) =>
                (dragType === 'servicio' && dropZoneType === 'categoria') ||
                (dragType === 'categoria' && (dropZoneType === 'seccion' || dropZoneType === 'categoria'));

            if (!isValidMove(activeItemInfo.type, targetParentType)) { toast.error(`No se puede mover un ${activeItemInfo.type} a un ${targetParentType}.`); return; }

            if (activeItemInfo.type === 'categoria') {
                newParentId = overItemInfo.type === 'seccion' ? overItemInfo.id : overItemInfo.parentId;
            } else {
                newParentId = overItemInfo.type === 'categoria' ? overItemInfo.id : overItemInfo.parentId;
            }

            if (!newParentId) return;
            const parentData = itemsMap.get(newParentId!)!.data;
            const childrenList = (parentData as SeccionItemData).categorias || (parentData as CategoriaItemData).servicios;
            // Si se suelta sobre un contenedor, inserta al final; si se suelta sobre un ítem, inserta en su posición
            newIndex = targetIsContainer ? childrenList.length : childrenList.findIndex(item => item.id === overItemInfo.id);
        }

        if (newIndex === -1 || newParentId === undefined) return;

        const originalCatalogo = JSON.parse(JSON.stringify(catalogo));
        setCatalogo(currentCatalogo => {
            const tempCatalogo = JSON.parse(JSON.stringify(currentCatalogo));

            const findAndRemove = (items: any[], id: string): any | null => {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].id === id) return items.splice(i, 1)[0];
                    const children = items[i].categorias || items[i].servicios;
                    if (children) {
                        const found = findAndRemove(children, id);
                        if (found) return found;
                    }
                }
                return null;
            };

            const findAndInsert = (items: any[], parentId: string | null, index: number, itemToInsert: any) => {
                if (parentId === null) {
                    items.splice(index, 0, itemToInsert);
                    return;
                }
                for (const item of items) {
                    if (item.id === parentId) {
                        const children = item.categorias ? item.categorias : item.servicios;
                        children.splice(index, 0, itemToInsert);
                        return;
                    }
                    const children = item.categorias || item.servicios;
                    if (children) findAndInsert(children, parentId, index, itemToInsert);
                }
            };

            // Ajustar el índice de inserción para el estado optimista
            // Para el mismo contenedor, usar directamente overIndex
            let insertIndex = newIndex;

            const itemToMove = findAndRemove(tempCatalogo, activeId);
            if (itemToMove) findAndInsert(tempCatalogo, newParentId, insertIndex, itemToMove);
            return tempCatalogo;
        });

        setIsSaving(true);
        const toastId = toast.loading("Guardando cambios...");
        try {
            // Normalizar el parentId: las secciones viven en la raíz ('root') para el backend
            const normalizedParentId = activeItemInfo.type === 'seccion' ? 'root' : String(newParentId);
            await actualizarPosicionCatalogo({ itemId: activeItemInfo.id, itemType: activeItemInfo.type, newParentId: normalizedParentId, newIndex });
            toast.success("Catálogo actualizado.", { id: toastId });
        } catch (error) {
            toast.error((error as Error).message || "No se pudo actualizar.", { id: toastId });
            setCatalogo(originalCatalogo);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deletingItem) return;
        const toastId = toast.loading('Eliminando...');
        try {
            await deleteItem(deletingItem.id, deletingItem.type as 'seccion' | 'categoria');
            setCatalogo(current => {
                if (deletingItem.type === 'seccion') {
                    return current.filter(s => s.id !== deletingItem.id);
                } else {
                    return current.map(s => ({
                        ...s,
                        categorias: s.categorias.filter(c => c.id !== deletingItem.id)
                    }));
                }
            });
            toast.success('Elemento eliminado.', { id: toastId });
        } catch (error) {
            toast.error((error as Error).message, { id: toastId });
        } finally {
            setDeletingItem(null);
        }
    };

    if (!isMounted) { return <div className="flex justify-center items-center p-10"><Loader2 className="animate-spin text-zinc-400" size={32} /></div>; }

    const activeDragItemType = activeDragItem?.type || null;

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} sensors={sensors} collisionDetection={closestCorners}>
            <div className="space-y-6">
                <div className="flex justify-between items-center h-8"><h2 className="text-zinc-300 font-medium">Estructura del Catálogo</h2><button onClick={() => router.push('/admin/configurar/catalogo/seccion/nueva')} className="text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-md px-3 py-1.5 flex items-center gap-1"><Plus size={16} /> Crear Nueva Sección</button></div>
                {isSaving && <div className="flex items-center gap-2 text-sm text-zinc-400"><Loader2 size={16} className="animate-spin" /> Guardando orden...</div>}
                <SortableContext items={catalogo.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    {catalogo.map(seccion => (
                        <SeccionCard
                            key={seccion.id}
                            seccion={seccion}
                            onEdit={() => router.push(`/admin/configurar/catalogo/seccion/${seccion.id}`)}
                            onAddCategoria={() => router.push(`/admin/configurar/catalogo/categoria/nueva?seccionId=${seccion.id}`)}
                            onEditCategoria={(cat) => router.push(`/admin/configurar/catalogo/categoria/${cat.id}`)}
                            onDelete={() => setDeletingItem(itemsMap.get(seccion.id)!)}
                            onDeleteCategoria={(catId) => setDeletingItem(itemsMap.get(catId)!)}
                            isOrdering={activeDragItemType === 'seccion'}
                            isCategoryOrdering={activeDragItemType === 'categoria'}
                            onAddServicioToCategoria={(categoriaId) => router.push(`/admin/configurar/catalogo/servicio/nuevo?categoriaId=${categoriaId}`)}
                        />
                    ))}
                </SortableContext>
            </div>
            <DragOverlay>
                {activeDragItem ? (
                    <div className="shadow-lg">
                        {activeDragItem.type === 'seccion' && <SeccionCard seccion={activeDragItem.data as SeccionItemData} onEdit={() => { }} onAddCategoria={() => { }} onEditCategoria={() => { }} onDelete={() => { }} onDeleteCategoria={() => { }} isOrdering={true} isCategoryOrdering={false} onAddServicioToCategoria={() => { }} />}
                        {activeDragItem.type === 'categoria' && <CategoriaCard categoria={activeDragItem.data as CategoriaItemData} onEdit={() => { }} onAddServicio={() => { }} onDelete={() => { }} isParentOrdering={false} isCategoryOrdering={true} />}
                        {activeDragItem.type === 'servicio' && <ServicioCard servicio={activeDragItem.data as ServicioItemData} />}
                    </div>
                ) : null}
            </DragOverlay>
            {/* Modal de sección removido en favor de páginas dedicadas */}
            {/* <SeccionEditModal seccion={editingSeccion} onClose={() => setEditingSeccion(null)} onSave={handleSaveSeccion} /> */}
            {/* Modal de categoría removido */}
            <ConfirmDeleteModal item={deletingItem} onClose={() => setDeletingItem(null)} onConfirm={handleDeleteConfirm} />
        </DndContext>
    );
}
