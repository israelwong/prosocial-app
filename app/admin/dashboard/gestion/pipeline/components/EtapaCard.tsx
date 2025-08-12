'use client';

import React, { useState } from 'react';
import { Edit, Trash2, GripVertical, Users } from 'lucide-react';
import { toast } from 'sonner';
import { eliminarEtapaPipeline, actualizarEtapaPipeline } from '@/app/admin/_lib/actions/pipeline/pipeline.actions';
import { EtapaPipelineType } from '@/app/admin/_lib/actions/pipeline/pipeline.schemas';

interface EtapaCardProps {
    etapa: EtapaPipelineType;
    onDragStart: (e: React.DragEvent, etapaId: string) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, etapaId: string) => void;
    isDragging: boolean;
    onUpdate: () => void;
    onDelete: () => void;
}

export default function EtapaCard({
    etapa,
    onDragStart,
    onDragOver,
    onDrop,
    isDragging,
    onUpdate,
    onDelete
}: EtapaCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(etapa.nombre);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (editedName.trim() === '') {
            toast.error('El nombre no puede estar vacío');
            return;
        }

        if (editedName === etapa.nombre) {
            setIsEditing(false);
            return;
        }

        try {
            const result = await actualizarEtapaPipeline({
                id: etapa.id,
                nombre: editedName.trim()
            });

            if (result.success) {
                toast.success(result.message || 'Etapa actualizada correctamente');
                setIsEditing(false);
                onUpdate();
            } else {
                toast.error(result.error || 'Error al actualizar la etapa');
            }
        } catch (error) {
            console.error('Error al actualizar etapa:', error);
            toast.error('Error al actualizar la etapa');
        }
    };

    const handleCancel = () => {
        setEditedName(etapa.nombre);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (etapa.eventoCount > 0) {
            toast.error(`No se puede eliminar la etapa porque tiene ${etapa.eventoCount} evento(s) asociado(s)`);
            return;
        }

        const confirmed = window.confirm(
            `¿Estás seguro de que deseas eliminar la etapa "${etapa.nombre}"?\n\nEsta acción no se puede deshacer.`
        );

        if (!confirmed) return;

        try {
            setIsDeleting(true);
            const result = await eliminarEtapaPipeline({ id: etapa.id });

            if (result.success) {
                toast.success(result.message || 'Etapa eliminada correctamente');
                onDelete();
            } else {
                toast.error(result.error || 'Error al eliminar la etapa');
            }
        } catch (error) {
            console.error('Error al eliminar etapa:', error);
            toast.error('Error al eliminar la etapa');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    return (
        <div
            draggable={!isEditing}
            onDragStart={(e) => onDragStart(e, etapa.id)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, etapa.id)}
            className={`
                bg-zinc-800 rounded-lg p-4 border border-zinc-700 transition-all duration-200
                ${isDragging ? 'opacity-50 scale-95' : 'hover:border-zinc-600'}
                ${!isEditing ? 'cursor-move' : ''}
            `}
        >
            <div className="flex items-center gap-4">
                {/* Drag Handle */}
                {!isEditing && (
                    <div className="cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-5 h-5 text-zinc-500" />
                    </div>
                )}

                {/* Posición */}
                <div className="flex-shrink-0 w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center text-sm font-medium text-zinc-300">
                    {etapa.posicion}
                </div>

                {/* Nombre */}
                <div className="flex-1">
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            onKeyDown={handleKeyPress}
                            onBlur={handleSave}
                            className="bg-zinc-700 border border-zinc-600 rounded px-3 py-1 text-zinc-100 focus:outline-none focus:border-blue-500 w-full"
                            autoFocus
                        />
                    ) : (
                        <h3 className="text-lg font-medium text-zinc-100">{etapa.nombre}</h3>
                    )}
                </div>

                {/* Contador de eventos */}
                <div className="flex items-center gap-2 text-zinc-400">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{etapa.eventoCount}</span>
                </div>

                {/* Acciones */}
                {!isEditing && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleEdit}
                            className="p-1 text-zinc-400 hover:text-blue-400 transition-colors"
                            title="Editar nombre"
                        >
                            <Edit className="w-4 h-4" />
                        </button>

                        <button
                            onClick={handleDelete}
                            disabled={etapa.eventoCount > 0 || isDeleting}
                            className={`
                                p-1 transition-colors
                                ${etapa.eventoCount > 0
                                    ? 'text-zinc-600 cursor-not-allowed'
                                    : 'text-zinc-400 hover:text-red-400'
                                }
                            `}
                            title={etapa.eventoCount > 0 ? 'No se puede eliminar: tiene eventos asociados' : 'Eliminar etapa'}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Acciones de edición */}
                {isEditing && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSave}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                        >
                            Guardar
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-3 py-1 bg-zinc-600 hover:bg-zinc-700 text-white text-sm rounded transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
