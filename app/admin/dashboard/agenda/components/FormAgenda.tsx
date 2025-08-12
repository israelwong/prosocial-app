// Ruta: app/admin/dashboard/agenda/components/FormAgenda.tsx
// Ejemplo de formulario usando los nuevos schemas

'use client'

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    AgendaCreateSchema,
    type AgendaCreateForm
} from '@/app/admin/_lib/actions/agenda/agenda.schemas';
import {
    crearAgenda
} from '@/app/admin/_lib/actions/agenda/agenda.actions';
import { Calendar, Clock, FileText, Users, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface FormAgendaProps {
    eventoId: string;
    userId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function FormAgenda({ eventoId, userId, onClose, onSuccess }: FormAgendaProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<AgendaCreateForm>({
        resolver: zodResolver(AgendaCreateSchema),
        mode: 'onChange',
        defaultValues: {
            fecha: '',
            hora: '',
            concepto: '',
            agendaTipo: 'Evento',
            eventoId: eventoId,
            userId: userId,
            status: 'pendiente'
        }
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        reset
    } = form;

    const onSubmit = async (data: AgendaCreateForm) => {
        setLoading(true);
        try {
            const result = await crearAgenda(data);

            if (result.success) {
                toast.success(result.message || 'Agenda creada exitosamente');
                reset();
                onSuccess?.();
                onClose();
            } else {
                toast.error(result.message || 'Error al crear la agenda');
            }
        } catch (error) {
            console.error('Error al crear agenda:', error);
            toast.error('Error al crear la agenda');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-zinc-950 p-6 rounded-lg border border-zinc-800 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-zinc-200">
                    Nueva Agenda
                </h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-zinc-800 rounded-md transition-colors duration-200"
                >
                    <X className="w-4 h-4 text-zinc-400" />
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Tipo de Agenda */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Tipo de Agenda
                    </label>
                    <select
                        {...register('agendaTipo')}
                        className={`w-full px-3 py-2 bg-zinc-900 border rounded-md text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 ${errors.agendaTipo ? 'border-red-600' : 'border-zinc-700'
                            }`}
                    >
                        <option value="Evento">Evento</option>
                        <option value="Sesion">Sesión</option>
                        <option value="Cita virtual">Cita Virtual</option>
                    </select>
                    {errors.agendaTipo && (
                        <p className="mt-1 text-sm text-red-400">
                            {errors.agendaTipo.message}
                        </p>
                    )}
                </div>

                {/* Fecha */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Fecha
                    </label>
                    <input
                        type="date"
                        {...register('fecha')}
                        className={`w-full px-3 py-2 bg-zinc-900 border rounded-md text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 ${errors.fecha ? 'border-red-600' : 'border-zinc-700'
                            }`}
                    />
                    {errors.fecha && (
                        <p className="mt-1 text-sm text-red-400">
                            {errors.fecha.message}
                        </p>
                    )}
                </div>

                {/* Hora */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Hora
                    </label>
                    <input
                        type="time"
                        {...register('hora')}
                        className={`w-full px-3 py-2 bg-zinc-900 border rounded-md text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 ${errors.hora ? 'border-red-600' : 'border-zinc-700'
                            }`}
                    />
                    {errors.hora && (
                        <p className="mt-1 text-sm text-red-400">
                            {errors.hora.message}
                        </p>
                    )}
                </div>

                {/* Concepto */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Concepto (opcional)
                    </label>
                    <textarea
                        {...register('concepto')}
                        rows={3}
                        placeholder="Descripción de la agenda..."
                        className={`w-full px-3 py-2 bg-zinc-900 border rounded-md text-zinc-200 text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 resize-none ${errors.concepto ? 'border-red-600' : 'border-zinc-700'
                            }`}
                    />
                    {errors.concepto && (
                        <p className="mt-1 text-sm text-red-400">
                            {errors.concepto.message}
                        </p>
                    )}
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-zinc-700 text-zinc-300 rounded-md hover:bg-zinc-900/50 transition-colors duration-200 text-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={!isValid || loading}
                        className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                                Creando...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Crear
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
