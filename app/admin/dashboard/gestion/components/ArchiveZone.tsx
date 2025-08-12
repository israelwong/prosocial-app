'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Archive, CheckCircle } from 'lucide-react';

interface ArchiveZoneProps {
    isOver?: boolean;
}

export default function ArchiveZone() {
    const { setNodeRef, isOver } = useDroppable({
        id: 'archive-zone',
    });

    return (
        <div className="flex flex-col w-80 min-w-80 max-w-80">
            {/* Header */}
            <div className="bg-zinc-800 rounded-lg p-4 mb-3 border border-zinc-700">
                <div className="flex items-center gap-2 mb-2">
                    <Archive className="w-5 h-5 text-zinc-400" />
                    <h3 className="font-medium text-zinc-100">Archivar Eventos</h3>
                </div>
                <p className="text-xs text-zinc-400">
                    Arrastra aquí los eventos completados para archivarlos
                </p>
            </div>

            {/* Drop Zone */}
            <div
                ref={setNodeRef}
                className={`
                    flex-1 min-h-96 p-6 rounded-lg border-2 border-dashed transition-all duration-300
                    ${isOver
                        ? 'border-green-500 bg-green-500/10 scale-105'
                        : 'border-zinc-600 bg-zinc-900/30'
                    }
                `}
            >
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <div className={`p-4 rounded-full transition-all duration-300 ${isOver ? 'bg-green-500/20' : 'bg-zinc-700/50'}`}>
                        {isOver ? (
                            <CheckCircle className="w-12 h-12 text-green-400" />
                        ) : (
                            <Archive className="w-12 h-12 text-zinc-500" />
                        )}
                    </div>

                    <div className="space-y-2">
                        <h4 className={`font-medium transition-colors ${isOver ? 'text-green-400' : 'text-zinc-400'}`}>
                            {isOver ? '¡Soltar para archivar!' : 'Zona de Archivo'}
                        </h4>
                        <p className="text-xs text-zinc-500 max-w-48">
                            Los eventos archivados no aparecerán en el kanban pero se mantendrán en el historial
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
