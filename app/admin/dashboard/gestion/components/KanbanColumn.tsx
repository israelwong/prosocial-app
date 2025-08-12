'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { EventoKanbanType } from '@/app/admin/_lib/actions/gestion/gestion.schemas';
import { EventoEtapa } from '@/app/admin/_lib/types';
import EventCard from './EventCard';
import ColumnHeader from './ColumnHeader';

interface KanbanColumnProps {
    etapa: EventoEtapa;
    eventos: EventoKanbanType[];
    onArchiveEvent?: (eventoId: string) => void;
}

export default function KanbanColumn({ etapa, eventos, onArchiveEvent }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: etapa.id || `etapa-${etapa.posicion}`,
    });

    // Calcular estadísticas de la columna
    const totalEventos = eventos.length;
    const totalPendienteCobrar = eventos.reduce((sum, evento) => {
        return sum + (evento.totalPendiente > 0 ? evento.totalPendiente : 0);
    }, 0);

    return (
        <div className="flex flex-col w-80 min-w-80 max-w-80">
            <ColumnHeader
                etapaNombre={etapa.nombre}
                totalEventos={totalEventos}
                totalPendienteCobrar={totalPendienteCobrar}
                posicion={etapa.posicion}
            />

            <div
                ref={setNodeRef}
                className={`
                    flex-1 min-h-96 p-3 rounded-lg border-2 border-dashed transition-colors
                    ${isOver
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-zinc-700 bg-zinc-900/50'
                    }
                `}
            >
                <SortableContext items={eventos.map(e => e.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {eventos.length === 0 ? (
                            <div className="flex items-center justify-center h-32 text-zinc-500 text-sm italic">
                                No hay eventos en esta etapa
                            </div>
                        ) : (
                            eventos.map((evento) => (
                                <EventCard
                                    key={evento.id}
                                    evento={evento}
                                    onArchive={onArchiveEvent}
                                />
                            ))
                        )}
                    </div>
                </SortableContext>
            </div>
        </div>
    );
}
