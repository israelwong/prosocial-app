'use client';

import React, { useState } from 'react';
import { X, User } from 'lucide-react';

// Tipos para los datos
interface UserData {
    id: string;
    username: string | null;
    email: string | null;
    role: string;
}

interface ServicioData {
    id: string;
    nombre_snapshot?: string;
    nombre?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    usuarios: UserData[];
    onConfirmar: (usuarioId: string) => Promise<void>;
    servicio: any | null; // Usando any para mayor flexibilidad
}

export default function AsignarUsuarioModal({ isOpen, onClose, usuarios, onConfirmar, servicio }: Props) {
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleConfirmar = async () => {
        if (!usuarioSeleccionado) return;

        setLoading(true);
        try {
            await onConfirmar(usuarioSeleccionado);
            setUsuarioSeleccionado('');
        } catch (error) {
            console.error('Error al asignar usuario:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setUsuarioSeleccionado('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-zinc-200">Asignar Usuario</h3>
                    <button
                        onClick={handleClose}
                        className="text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Servicio Info */}
                {servicio && (
                    <div className="mb-4 p-3 bg-zinc-800 rounded border border-zinc-700">
                        <span className="text-sm text-zinc-400">Servicio:</span>
                        <p className="text-zinc-200 font-medium">
                            {servicio.nombre_snapshot || servicio.nombre || 'Servicio sin nombre'}
                        </p>
                    </div>
                )}

                {/* Lista de Usuarios */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Seleccionar Usuario
                    </label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {usuarios.map((usuario) => (
                            <label
                                key={usuario.id}
                                className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-colors ${usuarioSeleccionado === usuario.id
                                        ? 'bg-blue-600/20 border border-blue-600'
                                        : 'bg-zinc-800 border border-zinc-700 hover:bg-zinc-700'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="usuario"
                                    value={usuario.id}
                                    checked={usuarioSeleccionado === usuario.id}
                                    onChange={(e) => setUsuarioSeleccionado(e.target.value)}
                                    className="sr-only"
                                />
                                <User className="w-4 h-4 text-zinc-400" />
                                <div className="flex-1">
                                    <p className="text-zinc-200 font-medium">
                                        {usuario.username || usuario.email}
                                    </p>
                                    <p className="text-xs text-zinc-400 capitalize">
                                        {usuario.role}
                                    </p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Acciones */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="px-4 py-2 text-zinc-300 bg-zinc-700 hover:bg-zinc-600 rounded transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirmar}
                        disabled={!usuarioSeleccionado || loading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Asignando...' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
