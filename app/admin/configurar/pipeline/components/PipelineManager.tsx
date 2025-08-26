'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Settings, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { obtenerEtapasPipeline, reordenarEtapasPipeline } from '@/app/admin/_lib/actions/pipeline/pipeline.actions';
import { EtapaPipelineType } from '@/app/admin/_lib/actions/pipeline/pipeline.schemas';
import EtapaCard from './EtapaCard';
import CrearEtapaModal from './CrearEtapaModal';

export default function PipelineManager() {
    const router = useRouter();
    const [etapas, setEtapas] = useState<EtapaPipelineType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCrearModalOpen, setIsCrearModalOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const cargarEtapas = async () => {
        try {
            setLoading(true);
            const result = await obtenerEtapasPipeline();

            if (result.success && result.data) {
                setEtapas(result.data);
            } else {
                toast.error(result.error || 'Error al cargar las etapas');
            }
        } catch (error) {
            console.error('Error al cargar etapas:', error);
            toast.error('Error al cargar las etapas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarEtapas();
    }, []);

    const handleDragStart = () => {
        setIsDragging(true);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setIsDragging(false);

        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = etapas.findIndex(etapa => etapa.id === active.id);
        const newIndex = etapas.findIndex(etapa => etapa.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
            return;
        }

        const newEtapas = arrayMove(etapas, oldIndex, newIndex);

        // Actualizar posiciones
        const etapasConNuevasPosiciones = newEtapas.map((etapa, index) => ({
            ...etapa,
            posicion: index + 1
        }));

        // Actualizar estado optimistamente
        setEtapas(etapasConNuevasPosiciones);

        try {
            const result = await reordenarEtapasPipeline({
                etapas: etapasConNuevasPosiciones.map(etapa => ({
                    id: etapa.id,
                    posicion: etapa.posicion
                }))
            });

            if (result.success) {
                toast.success(result.message || 'Etapas reordenadas correctamente');
            } else {
                toast.error(result.error || 'Error al reordenar las etapas');
                // Revertir cambios en caso de error
                await cargarEtapas();
            }
        } catch (error) {
            console.error('Error al reordenar etapas:', error);
            toast.error('Error al reordenar las etapas');
            // Revertir cambios en caso de error
            await cargarEtapas();
        }
    };

    const handleDragStart_Card = (e: React.DragEvent, etapaId: string) => {
        e.dataTransfer.setData('text/plain', etapaId);
        setIsDragging(true);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetEtapaId: string) => {
        e.preventDefault();
        const draggedEtapaId = e.dataTransfer.getData('text/plain');

        if (draggedEtapaId !== targetEtapaId) {
            // Simular DragEndEvent para reutilizar la lógica
            handleDragEnd({
                active: { id: draggedEtapaId },
                over: { id: targetEtapaId }
            } as DragEndEvent);
        }

        setIsDragging(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-900 text-zinc-100 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-3 text-zinc-400">Cargando etapas del pipeline...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-900 text-zinc-100 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Settings className="w-8 h-8 text-blue-500" />
                        <h1 className="text-3xl font-bold">Gestión del Pipeline</h1>
                    </div>
                    <p className="text-zinc-400">
                        Administra las etapas del pipeline de eventos. Puedes crear, editar, eliminar y reordenar las etapas.
                    </p>
                </div>

                {/* Crear Nueva Etapa */}
                <div className="mb-8">
                    <button
                        onClick={() => setIsCrearModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Nueva Etapa
                    </button>
                </div>

                {/* Lista de Etapas */}
                {etapas.length === 0 ? (
                    <div className="text-center py-12">
                        <Settings className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-zinc-300 mb-2">No hay etapas configuradas</h3>
                        <p className="text-zinc-500 mb-6">Crea la primera etapa para comenzar a organizar tu pipeline.</p>
                        <button
                            onClick={() => setIsCrearModalOpen(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mx-auto"
                        >
                            <Plus className="w-5 h-5" />
                            Crear Primera Etapa
                        </button>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={etapas.map(e => e.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-4">
                                {etapas.map((etapa) => (
                                    <EtapaCard
                                        key={etapa.id}
                                        etapa={etapa}
                                        onDragStart={handleDragStart_Card}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                        isDragging={isDragging}
                                        onUpdate={cargarEtapas}
                                        onDelete={cargarEtapas}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}

                {/* Modal para crear etapa */}
                <CrearEtapaModal
                    isOpen={isCrearModalOpen}
                    onClose={() => setIsCrearModalOpen(false)}
                    onSuccess={cargarEtapas}
                    nextPosition={etapas.length + 1}
                />
            </div>
        </div>
    );
}
