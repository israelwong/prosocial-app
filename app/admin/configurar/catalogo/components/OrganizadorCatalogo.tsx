'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    closestCorners
} from '@dnd-kit/core'
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import toast from 'react-hot-toast'
import { Plus, GripVertical, Pencil, Copy, Loader2, X, Trash2 } from 'lucide-react'
import {
    type ServicioSeccion,
    type ServicioCategoria,
    type Servicio
} from '@prisma/client'
import {
    actualizarPosicionCatalogo,
    upsertSeccion,
    upsertCategoria
} from '@/app/admin/_lib/actions/catalogo/catalogo.actions'
import {
    SeccionSchema,
    CategoriaSchema
} from '@/app/admin/_lib/actions/catalogo/catalogo.schemas'
import { duplicarServicio } from '@/app/admin/_lib/actions/servicios/servicios.actions'
import { z } from 'zod'
import { eliminarSeccion } from '@/app/admin/_lib/actions/secciones/secciones.actions' // <-- importado

// Tipos
type ServicioItemData = Servicio & { precio_publico: number | null }
type CategoriaItemData = ServicioCategoria & { servicios: ServicioItemData[] }
type SeccionItemData = ServicioSeccion & { categorias: CategoriaItemData[] }
type CatalogoData = SeccionItemData[]
type ItemType = 'seccion' | 'categoria' | 'servicio'
type DndItemInfo = {
    id: string
    type: ItemType
    data: SeccionItemData | CategoriaItemData | ServicioItemData
    parentId: string | null
}
type SeccionFormData = z.infer<typeof SeccionSchema>
type CategoriaFormData = z.infer<typeof CategoriaSchema>

interface Props {
    initialCatalogo: (
        ServicioSeccion & {
            seccionCategorias: ({
                ServicioCategoria: ServicioCategoria & {
                    Servicio: (Servicio & { precio_publico: number | null })[]
                }
            })[]
        }
    )[]
}

// Util mapeo inicial
function mapInitial(c: Props['initialCatalogo']): CatalogoData {
    return c.map(seccion => ({
        ...seccion,
        categorias: seccion.seccionCategorias.map(sc => ({
            ...sc.ServicioCategoria,
            servicios: (sc.ServicioCategoria.Servicio || []) as ServicioItemData[]
        }))
    }))
}

// Sortable wrapper
const SortableItem = React.memo(function SortableItem({
    id,
    type,
    parentId,
    data,
    children
}: {
    id: string
    type: ItemType
    parentId: string | null
    data: any
    children: React.ReactNode
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id, data: { type, parentId, item: data } })
    const style = useMemo(
        () => ({
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.35 : 1
        }),
        [transform, transition, isDragging]
    )
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    )
})

// Servicio
const ServicioItem = React.memo(function ServicioItem({
    servicio
}: {
    servicio: ServicioItemData
}) {
    const router = useRouter()
    const [isCloning, setIsCloning] = useState(false)
    const precio = useMemo(
        () =>
            new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN'
            }).format(servicio.precio_publico || 0),
        [servicio.precio_publico]
    )

    const handleClone = useCallback(async () => {
        setIsCloning(true)
        const tid = toast.loading('Clonando servicio...')
        try {
            await duplicarServicio(servicio.id)
            toast.success('Servicio clonado.', { id: tid })
            router.refresh()
        } catch {
            toast.error('Error al clonar.', { id: tid })
        } finally {
            setIsCloning(false)
        }
    }, [servicio.id, router])

    return (
        <div className='flex items-center justify-between text-sm w-full p-2 bg-zinc-800 border border-zinc-700/50 rounded-md'>
            <div className='flex items-center gap-2 overflow-hidden'>
                <GripVertical
                    size={16}
                    className='text-zinc-500 flex-shrink-0 cursor-grab'
                />
                <span className='text-zinc-300 truncate'>{servicio.nombre}</span>
            </div>
            <div className='flex items-center gap-3 flex-shrink-0'>
                <span className='text-xs text-zinc-400'>{precio}</span>
                <button
                    onClick={() =>
                        router.push(`/admin/configurar/servicios/${servicio.id}`)
                    }
                    className='text-zinc-400 hover:text-white transition-colors'
                    aria-label={`Editar ${servicio.nombre}`}
                >
                    <Pencil size={14} />
                </button>
                <button
                    onClick={handleClone}
                    disabled={isCloning}
                    className='text-zinc-400 hover:text-white transition-colors disabled:opacity-50'
                    aria-label={`Clonar ${servicio.nombre}`}
                >
                    {isCloning
                        ? <Loader2 size={14} className='animate-spin' />
                        : <Copy size={14} />}
                </button>
            </div>
        </div>
    )
})

// Categoria
const CategoriaItem = React.memo(function CategoriaItem({
    categoria,
    onAddServicio,
    onEditCategoria
}: {
    categoria: CategoriaItemData
    onAddServicio: () => void
    onEditCategoria: () => void
}) {
    return (
        <div className='p-3 rounded-md bg-zinc-800/70 border border-zinc-700/80 w-full'>
            <div className='flex items-center justify-between gap-2 mb-3'>
                <div className='flex items-center gap-2 overflow-hidden'>
                    <GripVertical
                        size={18}
                        className='text-zinc-400 flex-shrink-0 cursor-grab'
                    />
                    <h3 className='font-semibold text-zinc-200 truncate'>
                        {categoria.nombre}
                    </h3>
                    <button
                        onClick={onEditCategoria}
                        className='text-zinc-500 hover:text-white transition-colors'
                    >
                        <Pencil size={12} />
                    </button>
                </div>
                <button
                    onClick={onAddServicio}
                    className='text-xs text-blue-400 flex items-center gap-1 hover:text-blue-300 transition-colors flex-shrink-0'
                >
                    <Plus size={14} /> Agregar Servicio
                </button>
            </div>
            <SortableContext
                items={categoria.servicios.map(s => s.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className='space-y-2 ml-4'>
                    {categoria.servicios.map(servicio => (
                        <SortableItem
                            key={servicio.id}
                            id={servicio.id}
                            type='servicio'
                            parentId={categoria.id}
                            data={servicio}
                        >
                            <ServicioItem servicio={servicio} />
                        </SortableItem>
                    ))}
                    {categoria.servicios.length === 0 && (
                        <div className='text-xs text-zinc-500 px-2 h-8 flex items-center'>
                            Arrastra un servicio aquí.
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    )
})

// Seccion
const SeccionItem = React.memo(function SeccionItem({
    seccion,
    onAddCategoria,
    onEditSeccion,
    onEditCategoria,
    onDeleteSeccion
}: {
    seccion: SeccionItemData
    onAddCategoria: () => void
    onEditSeccion: () => void
    onEditCategoria: (c: CategoriaItemData) => void
    onDeleteSeccion: () => void
}) {
    const tieneCategorias = seccion.categorias.length > 0

    return (
        <div className='p-4 rounded-lg bg-zinc-900/70 border border-zinc-800 w-full'>
            <div className='flex items-center justify-between gap-2 mb-4'>
                <div className='flex items-center gap-2 overflow-hidden'>
                    <GripVertical
                        size={20}
                        className='text-zinc-400 flex-shrink-0 cursor-grab'
                    />
                    <div className='truncate'>
                        <div className='flex items-center gap-2'>
                            <h2 className='text-xl font-bold text-zinc-100 truncate'>
                                {seccion.nombre}
                            </h2>
                            <button
                                onClick={onEditSeccion}
                                className='text-zinc-500 hover:text-white transition-colors'
                                aria-label='Editar sección'
                            >
                                <Pencil size={14} />
                            </button>
                            <button
                                onClick={!tieneCategorias ? onDeleteSeccion : undefined}
                                disabled={tieneCategorias}
                                title={tieneCategorias ? 'Primero elimina / mueve las categorías' : 'Eliminar sección'}
                                className='text-red-500 hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
                                aria-label='Eliminar sección'
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        {seccion.descripcion && (
                            <p className='text-sm text-zinc-400 truncate'>
                                {seccion.descripcion}
                            </p>
                        )}
                    </div>
                </div>
                <button
                    onClick={onAddCategoria}
                    className='text-sm text-green-400 flex items-center gap-1 hover:text-green-300 transition-colors flex-shrink-0'
                >
                    <Plus size={16} /> Agregar Categoría
                </button>
            </div>
            <SortableContext
                items={seccion.categorias.map(c => c.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className='space-y-4 ml-4'>
                    {seccion.categorias.map(categoria => (
                        <SortableItem
                            key={categoria.id}
                            id={categoria.id}
                            type='categoria'
                            parentId={seccion.id}
                            data={categoria}
                        >
                            <CategoriaItem
                                categoria={categoria}
                                onAddServicio={() => { }}
                                onEditCategoria={() => onEditCategoria(categoria)}
                            />
                        </SortableItem>
                    ))}
                    {seccion.categorias.length === 0 && (
                        <div className='text-sm text-zinc-500 px-2 h-10 flex items-center'>
                            Arrastra una categoría aquí.
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    )
})

// Modal Sección
const SeccionEditModal = React.memo(function SeccionEditModal({
    seccion,
    onClose,
    onSave
}: {
    seccion: SeccionItemData | null
    onClose: () => void
    onSave: () => void
}) {
    const form = useForm<SeccionFormData>({
        resolver: zodResolver(SeccionSchema),
        values: seccion
            ? {
                id: seccion.id,
                nombre: seccion.nombre || '',
                descripcion: seccion.descripcion || ''
            }
            : undefined
    })
    if (!seccion) return null
    const submit: SubmitHandler<SeccionFormData> = async data => {
        const tid = toast.loading('Guardando...')
        try {
            await upsertSeccion({ ...data, id: seccion.id })
            toast.success('Sección guardada.', { id: tid })
            onSave()
        } catch (e: any) {
            toast.error(e.message || 'Error', { id: tid })
        }
    }
    return (
        <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4'>
            <div className='bg-zinc-900 p-6 rounded-lg w-full max-w-md border border-zinc-700 relative'>
                <button
                    onClick={onClose}
                    className='absolute top-3 right-3 text-zinc-500 hover:text-white'
                >
                    <X size={20} />
                </button>
                <h2 className='text-lg font-medium text-white mb-4'>Editar Sección</h2>
                <form
                    onSubmit={form.handleSubmit(submit)}
                    className='space-y-4'
                    noValidate
                >
                    <div>
                        <label className='text-sm text-zinc-400'>Nombre</label>
                        <input
                            {...form.register('nombre')}
                            className='mt-1 w-full bg-zinc-800 border border-zinc-600 rounded-md p-2 text-white'
                        />
                        {form.formState.errors.nombre && (
                            <p className='text-red-500 text-xs mt-1'>
                                {String(form.formState.errors.nombre.message)}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className='text-sm text-zinc-400'>Descripción</label>
                        <textarea
                            {...form.register('descripcion')}
                            rows={3}
                            className='mt-1 w-full bg-zinc-800 border border-zinc-600 rounded-md p-2 text-white'
                        />
                    </div>
                    <div className='flex justify-end gap-3 pt-2'>
                        <button
                            type='button'
                            onClick={onClose}
                            className='px-4 py-2 rounded-md text-zinc-300 hover:bg-zinc-700'
                        >
                            Cancelar
                        </button>
                        <button
                            type='submit'
                            disabled={form.formState.isSubmitting}
                            className='px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60'
                        >
                            {form.formState.isSubmitting
                                ? <Loader2 className='animate-spin' size={18} />
                                : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
})

// Modal Categoría
const CategoriaEditModal = React.memo(function CategoriaEditModal({
    categoria,
    onClose,
    onSave
}: {
    categoria: CategoriaItemData | null
    onClose: () => void
    onSave: () => void
}) {
    const form = useForm<CategoriaFormData>({
        resolver: zodResolver(CategoriaSchema),
        values: categoria
            ? {
                id: categoria.id,
                nombre: categoria.nombre || ''
            }
            : undefined
    })
    if (!categoria) return null
    const submit: SubmitHandler<CategoriaFormData> = async data => {
        const tid = toast.loading('Guardando...')
        try {
            await upsertCategoria({
                ...data,
                id: categoria.id,
                seccionId: (categoria as any).seccionId
            })
            toast.success('Categoría guardada.', { id: tid })
            onSave()
        } catch (e: any) {
            toast.error(e.message || 'Error', { id: tid })
        }
    }
    return (
        <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4'>
            <div className='bg-zinc-900 p-6 rounded-lg w-full max-w-md border border-zinc-700 relative'>
                <button
                    onClick={onClose}
                    className='absolute top-3 right-3 text-zinc-500 hover:text-white'
                >
                    <X size={20} />
                </button>
                <h2 className='text-lg font-medium text-white mb-4'>
                    Editar Categoría
                </h2>
                <form
                    onSubmit={form.handleSubmit(submit)}
                    className='space-y-4'
                    noValidate
                >
                    <div>
                        <label className='text-sm text-zinc-400'>Nombre</label>
                        <input
                            {...form.register('nombre')}
                            className='mt-1 w-full bg-zinc-800 border border-zinc-600 rounded-md p-2 text-white'
                        />
                        {form.formState.errors.nombre && (
                            <p className='text-red-500 text-xs mt-1'>
                                {String(form.formState.errors.nombre.message)}
                            </p>
                        )}
                    </div>
                    <div className='flex justify-end gap-3 pt-2'>
                        <button
                            type='button'
                            onClick={onClose}
                            className='px-4 py-2 rounded-md text-zinc-300 hover:bg-zinc-700'
                        >
                            Cancelar
                        </button>
                        <button
                            type='submit'
                            disabled={form.formState.isSubmitting}
                            className='px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60'
                        >
                            {form.formState.isSubmitting
                                ? <Loader2 className='animate-spin' size={18} />
                                : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
})

// Principal
export default function OrganizadorCatalogo({ initialCatalogo }: Props) {
    const router = useRouter()
    const [catalogo, setCatalogo] = useState<CatalogoData>(() =>
        mapInitial(initialCatalogo)
    )
    useEffect(() => {
        setCatalogo(mapInitial(initialCatalogo))
    }, [initialCatalogo])

    const [activeItem, setActiveItem] = useState<DndItemInfo | null>(null)
    const [itemWidth, setItemWidth] = useState<number | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [editingSeccion, setEditingSeccion] =
        useState<SeccionItemData | null>(null)
    const [editingCategoria, setEditingCategoria] =
        useState<CategoriaItemData | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    )

    const itemsMap = useMemo(() => {
        const map = new Map<string, DndItemInfo>()
        catalogo.forEach(sec => {
            map.set(sec.id, {
                id: sec.id,
                type: 'seccion',
                data: sec,
                parentId: null
            })
            sec.categorias.forEach(cat => {
                map.set(cat.id, {
                    id: cat.id,
                    type: 'categoria',
                    data: cat,
                    parentId: sec.id
                })
                cat.servicios.forEach(s => {
                    map.set(s.id, {
                        id: s.id,
                        type: 'servicio',
                        data: s,
                        parentId: cat.id
                    })
                })
            })
        })
        return map
    }, [catalogo])

    const handleDragStart = useCallback(
        (event: DragStartEvent) => {
            const { active } = event
            setActiveItem(itemsMap.get(String(active.id)) || null)
            if (event.active.rect.current.initial) {
                setItemWidth(event.active.rect.current.initial.width)
            }
        },
        [itemsMap]
    )

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            setActiveItem(null)
            setItemWidth(null)
            const { active, over } = event
            if (!over) return
            const activeId = String(active.id)
            const overId = String(over.id)
            if (activeId === overId) return

            const activeInfo = itemsMap.get(activeId)
            const overInfo = itemsMap.get(overId)
            if (!activeInfo || !overInfo) return

            const isValidParent = (drag: ItemType, dropParent: ItemType | 'root') =>
                (drag === 'categoria' && dropParent === 'seccion') ||
                (drag === 'servicio' && dropParent === 'categoria') ||
                (drag === 'seccion' && dropParent === 'root')

            const sameParent = activeInfo.parentId === overInfo.parentId
            let targetParentId = activeInfo.parentId
            let newIndex = -1

            if (sameParent) {
                const siblings =
                    activeInfo.type === 'seccion'
                        ? catalogo
                        : activeInfo.type === 'categoria'
                            ? (itemsMap.get(activeInfo.parentId!)!
                                .data as SeccionItemData).categorias
                            : (itemsMap.get(activeInfo.parentId!)!
                                .data as CategoriaItemData).servicios
                newIndex = siblings.findIndex(x => x.id === overId)
            } else {
                const dropContainer =
                    overInfo.type === 'seccion' || overInfo.type === 'categoria'
                        ? overInfo
                        : itemsMap.get(overInfo.parentId || '') || null
                const dropParentType = dropContainer
                    ? dropContainer.type
                    : ('root' as const)
                if (!isValidParent(activeInfo.type, dropParentType)) {
                    toast.error('Movimiento no permitido.')
                    return
                }
                targetParentId =
                    dropContainer && dropContainer.type !== 'seccion'
                        ? dropContainer.id
                        : dropContainer?.type === 'seccion' &&
                            activeInfo.type === 'categoria'
                            ? dropContainer.id
                            : dropContainer?.type === 'categoria' &&
                                activeInfo.type === 'servicio'
                                ? dropContainer.id
                                : null

                const destinationList =
                    activeInfo.type === 'categoria'
                        ? (itemsMap.get(targetParentId!)!.data as SeccionItemData)
                            .categorias
                        : activeInfo.type === 'servicio'
                            ? (itemsMap.get(targetParentId!)!.data as CategoriaItemData)
                                .servicios
                            : catalogo

                newIndex =
                    overInfo.type === activeInfo.type
                        ? destinationList.findIndex(x => x.id === overInfo.id)
                        : destinationList.length
            }

            if (newIndex < 0) return

            const snapshot = catalogo
            setCatalogo(prev => {
                const clone: CatalogoData = JSON.parse(JSON.stringify(prev))

                const remove = (
                    level: CatalogoData | CategoriaItemData[] | ServicioItemData[],
                    id: string
                ): any => {
                    const idx = level.findIndex((i: any) => i.id === id)
                    if (idx >= 0) return level.splice(idx, 1)[0]
                    for (const item of level as any[]) {
                        if (item.categorias) {
                            const r = remove(item.categorias, id)
                            if (r) return r
                        }
                        if (item.servicios) {
                            const r = remove(item.servicios, id)
                            if (r) return r
                        }
                    }
                    return null
                }

                const insert = (
                    level: CatalogoData | CategoriaItemData[] | ServicioItemData[],
                    parentId: string | null,
                    index: number,
                    node: any
                ) => {
                    if (parentId === null) {
                        ; (level as any).splice(index, 0, node)
                        return true
                    }
                    for (const item of level as any[]) {
                        if (item.id === parentId) {
                            const children =
                                item.categorias ?? item.servicios ?? undefined
                            if (children) {
                                children.splice(index, 0, node)
                                return true
                            }
                        }
                        if (item.categorias && insert(item.categorias, parentId, index, node)) return true
                        if (item.servicios && insert(item.servicios, parentId, index, node)) return true
                    }
                    return false
                }

                const moved = remove(clone, activeId)
                if (moved) insert(clone, targetParentId, newIndex, moved)
                return clone
            })

            setIsSaving(true)
            const tid = toast.loading('Guardando cambios...')
            try {
                const parentIdToSend =
                    activeInfo.type === 'seccion' ? null : (targetParentId || null)

                await actualizarPosicionCatalogo({
                    itemId: activeInfo.id,
                    itemType: activeInfo.type,
                    newParentId: parentIdToSend,
                    newIndex
                })
                toast.success('Catálogo actualizado.', { id: tid })
            } catch (e: any) {
                toast.error(e.message || 'Error al guardar', { id: tid })
                setCatalogo(snapshot)
            } finally {
                setIsSaving(false)
                router.refresh()
            }
        },
        [catalogo, itemsMap, router]
    )

    const handleCreateSeccion = useCallback(async () => {
        const tid = toast.loading('Creando sección...')
        try {
            const nuevaResp = await upsertSeccion({ nombre: 'Nueva sección', descripcion: '' })
            const nuevaId = (nuevaResp as any).id ?? (nuevaResp as any).data?.id ?? ''
            if (!nuevaId) {
                toast.error('No se obtuvo el ID.', { id: tid })
                return
            }
            const newIndex = catalogo.length
            await actualizarPosicionCatalogo({
                itemId: nuevaId,
                itemType: 'seccion',
                newParentId: null,
                newIndex
            })
            toast.success('Sección creada', { id: tid })
            router.refresh()
        } catch (e: any) {
            toast.error(e.message || 'Error al crear', { id: tid })
        }
    }, [catalogo.length, router])

    const handleCreateCategoria = useCallback(async (seccion: SeccionItemData) => {
        const tid = toast.loading('Creando categoría...')
        try {
            const nuevaResp = await upsertCategoria({ id: '', nombre: 'Nueva categoría', seccionId: seccion.id })
            const nuevaId = (nuevaResp as any).id ?? (nuevaResp as any).data?.id ?? ''
            if (!nuevaId) {
                toast.error('No se obtuvo el ID.', { id: tid })
                return
            }
            const parent = catalogo.find(s => s.id === seccion.id)
            const newIndex = parent ? parent.categorias.length : 0
            await actualizarPosicionCatalogo({
                itemId: nuevaId,
                itemType: 'categoria',
                newParentId: seccion.id,
                newIndex
            })
            toast.success('Categoría creada', { id: tid })
            router.refresh()
        } catch (e: any) {
            toast.error(e.message || 'Error al crear', { id: tid })
        }
    }, [catalogo, router])

    const handleAddServicio = useCallback((categoria: CategoriaItemData) => {
        const url = `/admin/configurar/servicios/nuevo?categoriaId=${categoria.id}`
        if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer')
    }, [])
    const handleDeleteSeccion = useCallback(async (seccion: SeccionItemData) => {
        if (seccion.categorias.length > 0) {
            toast.error('No se puede eliminar: la sección tiene categorías.')
            return
        }
        if (typeof window !== 'undefined') {
            const ok = window.confirm(`¿Eliminar la sección "${seccion.nombre}"? Esta acción no se puede deshacer.`)
            if (!ok) return
        }
        const tid = toast.loading('Eliminando sección...')
        const prev = catalogo
        setCatalogo(c => c.filter(s => s.id !== seccion.id))
        try {
            await eliminarSeccion(seccion.id) // asegúrate que esta acción acepte el id simple
            toast.success('Sección eliminada', { id: tid })
            router.refresh()
        } catch (e: any) {
            setCatalogo(prev)
            toast.error(e.message || 'Error al eliminar', { id: tid })
        }
    }, [catalogo, router])

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className='space-y-6'>
                <div className='flex justify-between items-center h-8'>
                    <h2 className='text-zinc-300 font-medium'>
                        Estructura del Catálogo
                    </h2>
                    {isSaving && (
                        <div className='flex items-center gap-2 text-sm text-zinc-400'>
                            <Loader2 size={16} className='animate-spin' /> Guardando...
                        </div>
                    )}
                </div>
                <SortableContext
                    items={catalogo.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {catalogo.map(seccion => (
                        <SortableItem
                            key={seccion.id}
                            id={seccion.id}
                            type='seccion'
                            parentId={null}
                            data={seccion}
                        >
                            <SeccionItem
                                seccion={seccion}
                                onAddCategoria={() => handleCreateCategoria(seccion)}
                                onEditSeccion={() => setEditingSeccion(seccion)}
                                onEditCategoria={cat => setEditingCategoria(cat)}
                                onDeleteSeccion={() => handleDeleteSeccion(seccion)}
                            />
                        </SortableItem>
                    ))}
                </SortableContext>

                <button
                    className='w-full p-4 rounded-lg border-2 border-dashed border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-center gap-2'
                    onClick={handleCreateSeccion}
                >
                    <Plus size={16} /> Crear Nueva Sección
                </button>
            </div>

            <DragOverlay>
                {activeItem && (
                    <div className='shadow-lg' style={{ width: itemWidth || 'auto' }}>
                        {activeItem.type === 'seccion' && (
                            <SeccionItem
                                seccion={activeItem.data as SeccionItemData}
                                onAddCategoria={() => { }}
                                onEditSeccion={() => { }}
                                onEditCategoria={() => { }}
                                onDeleteSeccion={() => { }}
                            />
                        )}
                        {activeItem.type === 'categoria' && (
                            <CategoriaItem
                                categoria={activeItem.data as CategoriaItemData}
                                onAddServicio={() => { }}
                                onEditCategoria={() => { }}
                            />
                        )}
                        {activeItem.type === 'servicio' && (
                            <ServicioItem servicio={activeItem.data as ServicioItemData} />
                        )}
                    </div>
                )}
            </DragOverlay>

            <SeccionEditModal
                seccion={editingSeccion}
                onClose={() => setEditingSeccion(null)}
                onSave={() => {
                    setEditingSeccion(null)
                    setTimeout(() => router.refresh(), 80)
                }}
            />
            <CategoriaEditModal
                categoria={editingCategoria}
                onClose={() => setEditingCategoria(null)}
                onSave={() => {
                    setEditingCategoria(null)
                    setTimeout(() => router.refresh(), 80)
                }}
            />
        </DndContext>
    )
}