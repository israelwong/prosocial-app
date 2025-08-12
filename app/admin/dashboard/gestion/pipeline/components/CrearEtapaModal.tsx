'use client';

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { crearEtapaPipeline } from '@/app/admin/_lib/actions/pipeline/pipeline.actions';
import { CrearEtapaType } from '@/app/admin/_lib/actions/pipeline/pipeline.schemas';

interface CrearEtapaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    nextPosition: number;
}

export default function CrearEtapaModal({
    isOpen,
    onClose,
    onSuccess,
    nextPosition
}: CrearEtapaModalProps) {
    const [nombre, setNombre] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (nombre.trim() === '') {
            toast.error('El nombre es requerido');
            return;
        }

        try {
            setIsSubmitting(true);

            const data: CrearEtapaType = {
                nombre: nombre.trim(),
                posicion: nextPosition
            };

            const result = await crearEtapaPipeline(data);

            if (result.success) {
                toast.success(result.message || 'Etapa creada correctamente');
                setNombre('');
                onSuccess();
                onClose();
            } else {
                toast.error(result.error || 'Error al crear la etapa');
            }
        } catch (error) {
            console.error('Error al crear etapa:', error);
            toast.error('Error al crear la etapa');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setNombre('');
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape' && !isSubmitting) {
            handleClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleClose}>
            <div
                className="bg-zinc-800 rounded-lg p-6 w-full max-w-md mx-4 border border-zinc-700"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-zinc-100">
                        Nueva Etapa del Pipeline
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-zinc-300 mb-2">
                            Nombre de la etapa
                        </label>
                        <input
                            id="nombre"
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: Contacto inicial, Propuesta enviada..."
                            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-blue-500 transition-colors"
                            disabled={isSubmitting}
                            autoFocus
                        />
                    </div>

                    <div className="text-sm text-zinc-400">
                        <p>Posición: {nextPosition}</p>
                        <p className="text-xs mt-1">La nueva etapa se agregará al final del pipeline</p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || nombre.trim() === ''}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Crear Etapa
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
