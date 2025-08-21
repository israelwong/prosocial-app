'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners, pointerWithin, getFirstCollision, CollisionDetection } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { obtenerEventosKanban, obtenerEtapasGestion, actualizarEtapaEvento, archivarEvento } from '@/app/admin/_lib/actions/gestion/gestion.actions';
import { EventoKanbanType } from '@/app/admin/_lib/actions/gestion/gestion.schemas';
import { EventoEtapa } from '@/app/admin/_lib/types';
import KanbanColumn from './KanbanColumn';
import EventCard from './EventCard';
import { toast } from 'sonner';

interface KanbanData {
    [etapaId: string]: EventoKanbanType[];
}

export default function KanbanBoard() {
    const router = useRouter();
    const [etapas, setEtapas] = useState<EventoEtapa[]>([]);
    const [eventos, setEventos] = useState<KanbanData>({});
    const [loading, setLoading] = useState(true);
    const [activeEvent, setActiveEvent] = useState<EventoKanbanType | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Estrategia de colisiones personalizada para soportar columnas vacías
    const collisionDetection: CollisionDetection = (args) => {
        const pointerIntersections = pointerWithin(args);

        if (pointerIntersections.length > 0) {
            const overId = getFirstCollision(pointerIntersections, 'id');
            if (overId != null) {
                return [{ id: overId }];
            }
        }
        // Fallback a closestCorners (más estable que closestCenter para layouts irregulares)
        return closestCorners(args);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Obtener etapas
            const etapasResult = await obtenerEtapasGestion();
            if (etapasResult.success && etapasResult.data) {
                setEtapas(etapasResult.data);
            }

            // Obtener eventos
            const eventosResult = await obtenerEventosKanban({ incluirTodos: true });
            if (eventosResult.success && eventosResult.data) {
                // Verificar duplicados en los datos recibidos
                const idsEventos = eventosResult.data.map(e => e.id);
                const duplicados = idsEventos.filter((id, index) => idsEventos.indexOf(id) !== index);
                if (duplicados.length > 0) {
                    console.warn('Eventos duplicados detectados en servidor:', duplicados);
                }

                // Organizar eventos por etapa
                const eventosPorEtapa: KanbanData = {};

                // Inicializar todas las etapas
                etapasResult.data?.forEach((etapa: EventoEtapa) => {
                    if (etapa.id !== undefined) {
                        eventosPorEtapa[etapa.id] = [];
                    }
                });

                // Agrupar eventos por etapa
                const eventosAsignados = new Set<string>(); // Para evitar duplicados

                eventosResult.data.forEach(evento => {
                    // Verificar que no esté ya asignado
                    if (eventosAsignados.has(evento.id)) {
                        console.warn(`Evento duplicado detectado: ${evento.id}`);
                        return;
                    }

                    const etapaId = evento.etapaId || 'sin-etapa';
                    
                    if (!eventosPorEtapa[etapaId]) {
                        eventosPorEtapa[etapaId] = [];
                    }

                    eventosPorEtapa[etapaId].push({
                        ...evento,
                        id: String(evento.id),
                        etapaId: evento.etapaId !== null && evento.etapaId !== undefined ? String(evento.etapaId) : null,
                    });

                    eventosAsignados.add(evento.id);
                });

                // Ordenar eventos por fecha en cada etapa
                for (const etapaId in eventosPorEtapa) {
                    eventosPorEtapa[etapaId].sort((a, b) => new Date(a.fecha_evento).getTime() - new Date(b.fecha_evento).getTime());
                }

                setEventos(eventosPorEtapa);
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
            toast.error('Error al cargar los datos del kanban');
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        const eventoId = event.active.id as string;

        // Buscar el evento en todas las etapas
        let eventoEncontrado: EventoKanbanType | null = null;
        Object.values(eventos).forEach(etapaEventos => {
            const evento = etapaEventos.find(e => e.id === eventoId);
            if (evento) {
                eventoEncontrado = evento;
            }
        });

        setActiveEvent(eventoEncontrado);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveEvent(null);
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (activeId === overId) return;

        const findContainer = (id: string) => {
            // Primero verificar si el ID es directamente una etapa/columna
            if (id in eventos) {
                return id;
            }

            // Verificar si el ID es una etapa válida (aunque no tenga eventos)
            const etapaExiste = etapas.some(etapa => etapa.id === id);
            if (etapaExiste) {
                return id;
            }

            // Finalmente, buscar en qué etapa está el evento
            for (const etapaId in eventos) {
                if (eventos[etapaId].some(evento => evento.id === id)) {
                    return etapaId;
                }
            }
            return null;
        };

        const activeContainer = findContainer(activeId);
        let overContainer: string | null = null;

        // Determinar el contenedor de destino usando la información de data si está disponible
        if (over.data?.current?.type === 'column') {
            overContainer = over.data.current.etapaId;
        } else {
            overContainer = findContainer(overId);
        }

        // Si no se encontró contenedor, verificar si overId es directamente una etapa
        if (!overContainer) {
            const esEtapaValida = etapas.some(etapa => etapa.id === overId);
            if (esEtapaValida) {
                overContainer = overId;
                // Asegurar que la etapa esté inicializada en eventos
                if (!eventos[overId]) {
                    setEventos(prev => ({
                        ...prev,
                        [overId]: []
                    }));
                }
            }
        }

        if (!activeContainer || !overContainer) {
            return;
        }

        const previousEvents = JSON.parse(JSON.stringify(eventos));

        if (activeContainer === overContainer) {
            // Reordenar en la misma columna
            setEventos(prev => {
                const newEvents = { ...prev };
                const items = newEvents[activeContainer];
                const oldIndex = items.findIndex(e => e.id === activeId);
                const newIndex = items.findIndex(e => e.id === overId);

                if (oldIndex !== -1 && newIndex !== -1) {
                    newEvents[activeContainer] = arrayMove(items, oldIndex, newIndex);
                }
                return newEvents;
            });
        } else {
            // Mover a una columna diferente
            setEventos(prev => {
                const newEvents = { ...prev };

                // Asegurar que ambos contenedores existan
                if (!newEvents[activeContainer]) newEvents[activeContainer] = [];
                if (!newEvents[overContainer]) newEvents[overContainer] = [];

                const sourceItems = [...newEvents[activeContainer]];
                const destItems = [...newEvents[overContainer]];

                const activeIndex = sourceItems.findIndex(e => e.id === activeId);
                if (activeIndex === -1) return prev;

                const [movedItem] = sourceItems.splice(activeIndex, 1);
                movedItem.etapaId = overContainer;

                // Si se suelta sobre otra ficha, insertar en esa posición
                const overIndex = destItems.findIndex(e => e.id === overId);
                if (overIndex !== -1) {
                    destItems.splice(overIndex, 0, movedItem);
                } else {
                    // Si se suelta en área vacía, añadir al final
                    destItems.push(movedItem);
                }

                newEvents[activeContainer] = sourceItems;
                newEvents[overContainer] = destItems;

                return newEvents;
            });

            // Llamada a la base de datos
            actualizarEtapaEvento({ eventoId: activeId, nuevaEtapaId: overContainer })
                .then(result => {
                    if (result.success) {
                        toast.success('Evento movido correctamente');
                        // Opcional: re-sincronizar con la DB para asegurar consistencia
                        // fetchData(); 
                    } else {
                        toast.error(result.error || 'Error al mover el evento, revirtiendo...');
                        setEventos(previousEvents);
                    }
                })
                .catch((err) => {
                    console.error("Error en la llamada a la API:", err);
                    toast.error('Error de red al mover el evento, revirtiendo...');
                    setEventos(previousEvents);
                });
        }
    };

    const findEvent = (id: string, events: KanbanData) => {
        for (const columnId in events) {
            const event = events[columnId].find(e => e.id === id);
            if (event) {
                return event;
            }
        }
        return null;
    };

    const handleArchiveEvent = async (eventoId: string) => {
        // Buscar la etapa actual del evento
        let etapaActualId: string | null = null;
        let eventoOriginal: EventoKanbanType | null = null;

        Object.entries(eventos).forEach(([etapaId, etapaEventos]) => {
            const evento = etapaEventos.find((e: EventoKanbanType) => e.id === eventoId);
            if (evento) {
                etapaActualId = etapaId;
                eventoOriginal = evento;
            }
        });

        if (!eventoOriginal || !etapaActualId) {
            toast.error('No se pudo encontrar el evento');
            return;
        }

        // Actualización optimista: remover del kanban inmediatamente
        setEventos(prevEventos => {
            const nuevosEventos = { ...prevEventos };
            if (etapaActualId && nuevosEventos[etapaActualId]) {
                const indexEvento = nuevosEventos[etapaActualId].findIndex((e: EventoKanbanType) => e.id === eventoId);
                if (indexEvento > -1) {
                    nuevosEventos[etapaActualId].splice(indexEvento, 1);
                }
            }
            return nuevosEventos;
        });

        try {
            const result = await archivarEvento(eventoId);

            if (result.success) {
                toast.success(result.message || 'Evento archivado correctamente');
            } else {
                toast.error(result.error || 'Error al archivar el evento');
                // Revertir si hay error
                setEventos(prevEventos => {
                    const nuevosEventos = { ...prevEventos };
                    if (eventoOriginal && etapaActualId) {
                        if (!nuevosEventos[etapaActualId]) {
                            nuevosEventos[etapaActualId] = [];
                        }
                        nuevosEventos[etapaActualId].push(eventoOriginal);
                    }
                    return nuevosEventos;
                });
            }
        } catch (error) {
            console.error('Error al archivar evento:', error);
            toast.error('Error al archivar el evento');
            // Revertir si hay error
            setEventos(prevEventos => {
                const nuevosEventos = { ...prevEventos };
                if (eventoOriginal && etapaActualId) {
                    if (!nuevosEventos[etapaActualId]) {
                        nuevosEventos[etapaActualId] = [];
                    }
                    nuevosEventos[etapaActualId].push(eventoOriginal);
                }
                return nuevosEventos;
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-zinc-500">Cargando kanban...</div>
            </div>
        );
    }

    return (
        <div className="h-full">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100">Gestión de Pipeline</h1>
                    <p className="text-zinc-400">Vista kanban para gestionar el flujo de eventos</p>
                </div>
                <button
                    onClick={() => router.push('/admin/dashboard/gestion/pipeline')}
                    className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-4 py-2 rounded-lg transition-colors border border-zinc-600 hover:border-zinc-500"
                    title="Configurar etapas del pipeline"
                >
                    <Settings className="w-4 h-4" />
                    Editar pipeline
                </button>

            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={collisionDetection}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {etapas
                        .filter(etapa => etapa.id !== undefined)
                        .map(etapa => (
                            <KanbanColumn
                                key={etapa.id}
                                etapa={etapa}
                                eventos={eventos[etapa.id as string] || []}
                                onArchiveEvent={handleArchiveEvent}
                            />
                        ))}
                </div>

                <DragOverlay>
                    {activeEvent ? (
                        <EventCard
                            evento={activeEvent}
                            isDragging={true}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
